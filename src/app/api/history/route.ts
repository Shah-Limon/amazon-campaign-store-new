import connectToDatabase from "@/lib/mongodb";
import { DownloadHistory } from "@/models/DownloadHistory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const history = await DownloadHistory.find().sort({ downloadDate: -1 }).limit(10);
    return NextResponse.json(history);
  } catch (error: any) {
    console.error("History API Error:", error.message || error);
    return NextResponse.json({ error: error.message || "Failed to fetch history" }, { status: 500 });
  }
}
