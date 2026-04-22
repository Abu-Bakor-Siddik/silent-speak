import { createServer } from "http";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT) || 3003;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
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
  }
>();

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  // Teacher creates a session
  socket.on(
    "create-session",
    (data: { sessionCode: string; teacherName: string }) => {
      sessions.set(data.sessionCode, {
        teacherSocketId: socket.id,
        students: new Map(),
        captions: [],
      });

      socket.join(data.sessionCode);

      // IMPORTANT: also notify teacher joined room
      socket.emit("session-ready", {
        sessionCode: data.sessionCode,
      });
      console.log(`Session created: ${data.sessionCode} by ${data.teacherName}`);
    }
  );

  // Student joins a session
  socket.on(
    "join-session",
    (data: { sessionCode: string; studentId: string; nickname: string }) => {
      const session = sessions.get(data.sessionCode);
      if (!session) {
        socket.emit("session-error", { message: "Session not found" });
        return;
      }
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
      socket.join(data.sessionCode);

      setTimeout(() => {
        socket.emit("caption-history", session.captions);
      }, 200);

      console.log(
        `Student ${data.nickname} joined session ${data.sessionCode}`
      );
    }
  );

  // Teacher sends live caption
socket.on("caption", (data) => {
  const session = sessions.get(data.sessionCode);
  if (!session) return;

  session.captions.push({
    text: data.text,
    timestamp: data.timestamp,
  });

  io.to(data.sessionCode).emit("caption", {
    text: data.text,
    timestamp: data.timestamp,
  });
});

  // Teacher sends bulk captions (for full caption updates)
  socket.on(
    "caption-bulk",
    (data: { sessionCode: string; fullText: string }) => {
      socket.to(data.sessionCode).emit("caption-bulk", {
        fullText: data.fullText,
      });
    }
  );

  // Send message (teacher to students or student to teacher)
  socket.on("message", (data) => {
  const session = sessions.get(data.sessionCode);
  if (!session) return;

  io.to(data.sessionCode).emit("message", data);
});

  // Quick communication (student sends quick phrase with TTS)
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

      // Send to teacher
      io.to(session.teacherSocketId).emit("quick-comm", {
        senderId: data.senderId,
        senderName: data.senderName,
        phrase: data.phrase,
      });

      // Also send as a message
      io.to(session.teacherSocketId).emit("message", {
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: "student",
        content: data.phrase,
        type: "quick-comm",
      });
    }
  );

  // Task assignment
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

  // Teacher mic toggle notification
  socket.on(
    "mic-toggle",
    (data: { sessionCode: string; isMuted: boolean }) => {
      socket.to(data.sessionCode).emit("mic-toggle", data);
    }
  );

  // Leave session
  socket.on(
    "leave-session",
    (data: { sessionCode: string; userId: string; role: string }) => {
      const session = sessions.get(data.sessionCode);
      if (!session) return;

      if (data.role === "teacher") {
        // End the session
        io.to(data.sessionCode).emit("session-ended", {
          message: "Teacher has ended the session",
        });
        sessions.delete(data.sessionCode);
      } else {
        // Student leaves
        session.students.delete(data.userId);
        io.to(session.teacherSocketId).emit("student-left", {
          studentId: data.userId,
        });
      }
      socket.leave(data.sessionCode);
    }
  );

  // Whiteboard data
  socket.on(
    "whiteboard",
    (data: { sessionCode: string; drawing: string }) => {
      socket.to(data.sessionCode).emit("whiteboard", { drawing: data.drawing });
    }
  );

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
    // Clean up sessions where this socket was teacher or student
    for (const [code, session] of sessions.entries()) {
      if (session.teacherSocketId === socket.id) {
        io.to(code).emit("session-ended", {
          message: "Teacher has disconnected",
        });
        sessions.delete(code);
      } else {
        for (const [studentId, student] of session.students.entries()) {
          if (student.socketId === socket.id) {
            session.students.delete(studentId);
            io.to(session.teacherSocketId).emit("student-left", {
              studentId,
            });
            break;
          }
        }
      }
    }
  });
});

console.log(`WebSocket service running on port ${PORT}`);
