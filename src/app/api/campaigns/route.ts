import connectToDatabase from "@/lib/mongodb";
import { Campaign } from "@/models/Campaign";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { campaignId: { $regex: search, $options: "i" } },
        { campaignName: { $regex: search, $options: "i" } },
        { brandName: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Campaign.countDocuments(query);

    return NextResponse.json({ campaigns, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
