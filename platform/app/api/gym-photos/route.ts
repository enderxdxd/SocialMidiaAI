import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "gym-photos");
  try {
    const files = fs.readdirSync(dir).filter((f) =>
      /\.(jpg|jpeg|png|webp|avif)$/i.test(f)
    );
    const photos = files.sort().map((f) => `/gym-photos/${f}`);
    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
