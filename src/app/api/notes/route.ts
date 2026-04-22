import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const type = request.nextUrl.searchParams.get("type");
    const search = request.nextUrl.searchParams.get("search");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.title = { contains: search };
    }

    const notes = await db.note.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error("Notes GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, content, rawContent, type, sessionId, duration } = body;

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: "userId, title, and content are required" },
        { status: 400 }
      );
    }

    const note = await db.note.create({
      data: {
        userId,
        title,
        content,
        rawContent: rawContent || null,
        type: type || "session",
        sessionId: sessionId || null,
        duration: duration || null,
      },
    });

    return NextResponse.json(
      { note, message: "Note created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Notes POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { noteId, title, content } = body;

    if (!noteId) {
      return NextResponse.json(
        { error: "noteId is required" },
        { status: 400 }
      );
    }

    const existingNote = await db.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const updatedNote = await db.note.update({
      where: { id: noteId },
      data: updateData,
    });

    return NextResponse.json(
      { note: updatedNote, message: "Note updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notes PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { noteId } = body;

    if (!noteId) {
      return NextResponse.json(
        { error: "noteId is required" },
        { status: 400 }
      );
    }

    const existingNote = await db.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await db.note.delete({
      where: { id: noteId },
    });

    return NextResponse.json(
      { message: "Note deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notes DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
