import connectToDatabase from "@/lib/mongodb";
import { Campaign } from "@/models/Campaign";
import { DownloadHistory } from "@/models/DownloadHistory";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { count } = await request.json();
    
    if (!count || count <= 0) {
      return NextResponse.json({ error: "Invalid count" }, { status: 400 });
    }

    // Find pending campaigns
    const pendingCampaigns = await Campaign.find({ status: "pending" }).limit(count);
    
    if (pendingCampaigns.length === 0) {
      return NextResponse.json({ error: "No pending campaigns available" }, { status: 404 });
    }

    const campaignIds = pendingCampaigns.map(c => c.campaignId);
    
    // Update status to downloaded
    await Campaign.updateMany(
      { campaignId: { $in: campaignIds } },
      { $set: { status: "downloaded" } }
    );

    // Track download history
    await DownloadHistory.create({
      count: campaignIds.length,
      campaignIds
    });

    // Make string content for txt file
    const content = campaignIds.join("\n");

    return NextResponse.json({ content, count: campaignIds.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to download campaigns" }, { status: 500 });
  }
}
