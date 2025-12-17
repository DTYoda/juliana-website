import { NextRequest, NextResponse } from "next/server";
import { getWebsiteContent, saveWebsiteContent } from "@/lib/postgres-website-content";

export async function GET() {
  try {
    const content = await getWebsiteContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error reading website content:", error);
    return NextResponse.json(
      { error: "Failed to read website content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the structure
    if (!body.home || !body.about) {
      return NextResponse.json(
        { error: "Invalid content structure" },
        { status: 400 }
      );
    }

    // Save to KV
    await saveWebsiteContent(body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing website content:", error);
    return NextResponse.json(
      { error: "Failed to save website content" },
      { status: 500 }
    );
  }
}

