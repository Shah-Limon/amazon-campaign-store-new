import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampaign extends Document {
  campaignId: string;
  campaignName: string;
  brandName?: string;
  startDate?: Date;
  endDate?: Date;
  commissionRate?: string;
  status: "pending" | "downloaded";
  createdAt: Date;
}

const CampaignSchema: Schema = new Schema({
  campaignId: { type: String, required: true, unique: true },
  campaignName: { type: String, required: true },
  brandName: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  commissionRate: { type: String },
  status: { type: String, enum: ["pending", "downloaded"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export const Campaign: Model<ICampaign> = mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
