import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateSessionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    // Sessions where user is the teacher
    const sessionsAsTeacher = await db.session.findMany({
      where: { teacherId: userId },
      include: {
        participants: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: { participants: true, messages: true, tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Sessions where user is a participant
    const participantRecords = await db.sessionParticipant.findMany({
      where: { studentId: userId },
      select: { sessionId: true },
    });

    const participantSessionIds = participantRecords.map((p) => p.sessionId);

    const sessionsAsParticipant = participantSessionIds.length > 0
      ? await db.session.findMany({
          where: {
            id: { in: participantSessionIds },
          },
          include: {
            participants: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    nickname: true,
                    avatar: true,
                  },
                },
              },
            },
            _count: {
              select: { participants: true, messages: true, tasks: true },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    return NextResponse.json(
      {
        sessions: [...sessionsAsTeacher, ...sessionsAsParticipant],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sessions GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherId, teacherName } = body;

    if (!teacherId || !teacherName) {
      return NextResponse.json(
        { error: "teacherId and teacherName are required" },
        { status: 400 }
      );
    }

    // Generate a unique session code
    let code = generateSessionCode();
    let existingSession = await db.session.findUnique({ where: { code } });
    while (existingSession) {
      code = generateSessionCode();
      existingSession = await db.session.findUnique({ where: { code } });
    }

    const session = await db.session.create({
      data: {
        code,
        teacherId,
        teacherName,
        status: "active",
      },
    });

    return NextResponse.json(
      { session, message: "Session created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sessions POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionCode, studentId, nickname, status, rawCaption } = body;

    if (!sessionCode) {
      return NextResponse.json(
        { error: "sessionCode is required" },
        { status: 400 }
      );
    }

    const session = await db.session.findUnique({
      where: { code: sessionCode },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Update raw caption
    if (rawCaption !== undefined) {
      updateData.rawCaption = rawCaption;
    }

    // Update status
    if (status !== undefined) {
      updateData.status = status;
    }

    // Update session fields if any
    if (Object.keys(updateData).length > 0) {
      await db.session.update({
        where: { code: sessionCode },
        data: updateData,
      });
    }

    // Add participant
    if (studentId && nickname) {
      // Check if already a participant
      const existingParticipant = await db.sessionParticipant.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: session.id,
            studentId,
          },
        },
      });

      if (!existingParticipant) {
        await db.sessionParticipant.create({
          data: {
            sessionId: session.id,
            studentId,
            nickname,
          },
        });
      }
    }

    const updatedSession = await db.session.findUnique({
      where: { code: sessionCode },
      include: {
        participants: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { session: updatedSession, message: "Session updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sessions PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionCode } = body;

    if (!sessionCode) {
      return NextResponse.json(
        { error: "sessionCode is required" },
        { status: 400 }
      );
    }

    const session = await db.session.findUnique({
      where: { code: sessionCode },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    await db.session.update({
      where: { code: sessionCode },
      data: {
        status: "ended",
        endedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Session ended successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sessions DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
