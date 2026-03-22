import connectToDatabase from "@/lib/mongodb";
import { Campaign } from "@/models/Campaign";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const total = await Campaign.countDocuments({});
    const pending = await Campaign.countDocuments({ status: "pending" });
    const downloaded = await Campaign.countDocuments({ status: "downloaded" });
    return NextResponse.json({ total, pending, downloaded });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
