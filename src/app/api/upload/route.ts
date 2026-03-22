import connectToDatabase from "@/lib/mongodb";
import { Campaign } from "@/models/Campaign";
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    
    const response = await new Promise<NextResponse>((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const campaignsToInsert = [];
            
            for (const row of results.data as any[]) {
              const campaignId = row["Campaign Id"] || row["campaignId"];
              if (!campaignId) continue;
              
              campaignsToInsert.push({
                campaignId,
                campaignName: row["Campaign Name"] || row["campaignName"] || "Unknown",
                brandName: row["Brand Name"] || row["brandName"] || "",
                startDate: row["Campaign Start Date"] ? new Date(row["Campaign Start Date"]) : undefined,
                endDate: row["Campaign End Date"] ? new Date(row["Campaign End Date"]) : undefined,
                commissionRate: row["Commission Rate"] || row["commissionRate"] || "",
                status: "pending"
              });
            }

            if (campaignsToInsert.length > 0) {
              await Campaign.insertMany(campaignsToInsert, { ordered: false }).catch((e) => {
                if (e.code !== 11000) throw e;
              });
            }

            resolve(NextResponse.json({ success: true, count: campaignsToInsert.length }));
          } catch (error) {
             resolve(NextResponse.json({ error: "Failed to process data" }, { status: 500 }));
          }
        },
        error: (error: any) => {
          resolve(NextResponse.json({ error: error.message }, { status: 400 }));
        }
      });
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
