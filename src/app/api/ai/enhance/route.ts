import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, content } = body;
    const inputText = text || content;

    if (!inputText) {
      return NextResponse.json(
        { error: "text or content is required" },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that reformats raw classroom captions into well-structured, organized study notes. Preserve all information but organize it with headers, bullet points, and clear structure. If the text is in Bangla/Banglish/English, keep the original language.",
        },
        {
          role: "user",
          content: `Please reformat the following raw classroom captions into well-organized study notes:\n\n${inputText}`,
        },
      ],
    });

    const enhancedText =
      response.choices?.[0]?.message?.content || "Unable to enhance content";

    return NextResponse.json(
      { enhanced: enhancedText },
      { status: 200 }
    );
  } catch (error) {
    console.error("AI Enhance error:", error);
    return NextResponse.json(
      { error: "Failed to enhance content" },
      { status: 500 }
    );
  }
}
