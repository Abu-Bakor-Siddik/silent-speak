import { createServer } from "http";
import { Server } from "socket.io";
 
const PORT = Number(process.env.PORT) || 3003;

const httpServer = createServer((req, res) => {
  // Respond OK to any GET — Render's health checker and UptimeRobot
  // hit the root path; returning 200 prevents the service from sleeping.
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  // Allow both polling AND websocket — polling is needed for the initial
  // HTTP upgrade handshake on Render's free tier. Without it, connections
  // never establish and clients reconnect forever.
  transports: ["polling", "websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket service running on port ${PORT}`);
});

// Session state
const sessions = new Map<
  string,
  {
    teacherSocketId: string;
    students: Map<string, { socketId: string; nickname: string }>;
    captions: { text: string; timestamp: number }[];
    fullCaptionText: string;
  }
>();

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  // ── Teacher creates / re-registers a session ──────────────────────────────
  socket.on(
    "create-session",
    (data: { sessionCode: string; teacherName: string }) => {
      const existing = sessions.get(data.sessionCode);

      if (existing) {
        // Session already exists (teacher reconnected) — just update socket ID
        existing.teacherSocketId = socket.id;
        socket.join(data.sessionCode);
        console.log(`Session re-registered: ${data.sessionCode} (teacher reconnected)`);
      } else {
        // Brand new session
        sessions.set(data.sessionCode, {
          teacherSocketId: socket.id,
          students: new Map(),
          captions: [],
          fullCaptionText: "",
        });
        socket.join(data.sessionCode);
        console.log(`Session created: ${data.sessionCode} by ${data.teacherName}`);
      }

      socket.emit("session-ready", { sessionCode: data.sessionCode });
    }
  );

  // ── Student joins a session ───────────────────────────────────────────────
  socket.on(
    "join-session",
    (data: { sessionCode: string; studentId: string; nickname: string }) => {
      const session = sessions.get(data.sessionCode);
      if (!session) {
        socket.emit("session-error", { message: "Session not found" });
        return;
      }

      // Update or add student record (handles reconnects)
      session.students.set(data.studentId, {
        socketId: socket.id,
        nickname: data.nickname,
      });

      socket.join(data.sessionCode);
      socket.emit("joined-room", { sessionCode: data.sessionCode });

      // Notify teacher
      io.to(session.teacherSocketId).emit("student-joined", {
        studentId: data.studentId,
        nickname: data.nickname,
      });

      // Send existing captions to student
      if (session.captions.length > 0) {
        socket.emit("caption-history", session.captions);
      }
      if (session.fullCaptionText) {
        socket.emit("caption-bulk", { fullText: session.fullCaptionText });
      }

      console.log(`Student ${data.nickname} joined session ${data.sessionCode}`);
    }
  );

  // ── Teacher sends live caption ────────────────────────────────────────────
  // Use socket.to (not io.to) so caption is NOT echoed back to the teacher.
  // The teacher already adds the caption locally to avoid latency.
  socket.on("caption", (data: { sessionCode: string; text: string; timestamp: number }) => {
    const session = sessions.get(data.sessionCode);
    if (!session) return;

    session.captions.push({ text: data.text, timestamp: data.timestamp });

    // Broadcast to everyone in room EXCEPT the teacher who sent it
    socket.to(data.sessionCode).emit("caption", {
      text: data.text,
      timestamp: data.timestamp,
    });
  });

  // ── Bulk caption text (full transcript) ──────────────────────────────────
  socket.on(
    "caption-bulk",
    (data: { sessionCode: string; fullText: string }) => {
      const session = sessions.get(data.sessionCode);
      if (!session) return;

      session.fullCaptionText = data.fullText;
      // Send to students only (not back to teacher)
      socket.to(data.sessionCode).emit("caption-bulk", {
        fullText: data.fullText,
      });
    }
  );

  // ── Messages ─────────────────────────────────────────────────────────────
  // Use socket.to (not io.to) — sender already adds their message locally.
  socket.on("message", (data: { sessionCode: string; [key: string]: any }) => {
    const session = sessions.get(data.sessionCode);
    if (!session) return;

    socket.to(data.sessionCode).emit("message", data);
  });

  // ── Quick communication (student phrase) ─────────────────────────────────
  socket.on(
    "quick-comm",
    (data: {
      sessionCode: string;
      senderId: string;
      senderName: string;
      phrase: string;
    }) => {
      const session = sessions.get(data.sessionCode);
      if (!session) return;

      io.to(session.teacherSocketId).emit("quick-comm", {
        senderId: data.senderId,
        senderName: data.senderName,
        phrase: data.phrase,
      });
    }
  );

  // ── Task assignment ───────────────────────────────────────────────────────
  socket.on(
    "task-assigned",
    (data: {
      sessionCode: string;
      task: {
        id: string;
        title: string;
        description: string;
        type: string;
        dueDate: string | null;
      };
    }) => {
      socket.to(data.sessionCode).emit("task-assigned", data.task);
    }
  );

  // ── Mic toggle ───────────────────────────────────────────────────────────
  socket.on(
    "mic-toggle",
    (data: { sessionCode: string; isMuted: boolean }) => {
      socket.to(data.sessionCode).emit("mic-toggle", data);
    }
  );

  // ── Leave session ────────────────────────────────────────────────────────
  socket.on(
    "leave-session",
    (data: { sessionCode: string; userId: string; role: string }) => {
      const session = sessions.get(data.sessionCode);
      if (!session) return;

      if (data.role === "teacher") {
        io.to(data.sessionCode).emit("session-ended", {
          message: "Teacher has ended the session",
        });
        sessions.delete(data.sessionCode);
      } else {
        session.students.delete(data.userId);
        io.to(session.teacherSocketId).emit("student-left", {
          studentId: data.userId,
        });
      }

      socket.leave(data.sessionCode);
    }
  );

  // ── Disconnect cleanup ───────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);

    for (const [code, session] of sessions.entries()) {
      if (session.teacherSocketId === socket.id) {
        // Don't delete session on teacher disconnect — they may reconnect.
        // Just log it. The session will be cleaned up when teacher calls leave-session,
        // or when they reconnect and re-emit create-session.
        console.log(`Teacher disconnected from session ${code} — keeping session alive for reconnect`);
      } else {
        for (const [studentId, student] of session.students.entries()) {
          if (student.socketId === socket.id) {
            session.students.delete(studentId);
            io.to(session.teacherSocketId).emit("student-left", { studentId });
            break;
          }
        }
      }
    }
  });
});
