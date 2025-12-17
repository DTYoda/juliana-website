import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const CONTENT_FILE = join(process.cwd(), "content", "website-content.json");

export async function GET() {
  try {
    const content = await readFile(CONTENT_FILE, "utf-8");
    return NextResponse.json(JSON.parse(content));
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

    // Write to file
    await writeFile(CONTENT_FILE, JSON.stringify(body, null, 2), "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing website content:", error);
    return NextResponse.json(
      { error: "Failed to save website content" },
      { status: 500 }
    );
  }
}

