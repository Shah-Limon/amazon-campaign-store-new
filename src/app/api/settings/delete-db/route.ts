import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Campaign } from "@/models/Campaign";
import { DownloadHistory } from "@/models/DownloadHistory";

export async function POST(): Promise<NextResponse> {
  try {
    await connectToDatabase();
    
    // Clear the database collections
    await Campaign.deleteMany({});
    await DownloadHistory.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: "Database cleared successfully. All campaigns and history have been removed." 
    });
  } catch (error: any) {
    console.error("Delete DB Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to clear database" 
    }, { status: 500 });
  }
}
