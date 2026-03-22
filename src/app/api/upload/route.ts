import connectToDatabase from "@/lib/mongodb";
import { Campaign } from "@/models/Campaign";
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    
    const { campaigns } = await request.json();
    
    if (!campaigns || !Array.isArray(campaigns)) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    if (campaigns.length > 0) {
      // Use ordered: false to continue inserting even if some are duplicates
      await Campaign.insertMany(campaigns, { ordered: false }).catch((err) => {
        if (err.code !== 11000) throw err;
      });
    }

    return NextResponse.json({ success: true, count: campaigns.length });
  } catch (error: any) {
    console.error("Batch Upload Error:", error.message || error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
