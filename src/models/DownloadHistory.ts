import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDownloadHistory extends Document {
  count: number;
  downloadDate: Date;
  campaignIds: string[];
}

const DownloadHistorySchema: Schema = new Schema({
  count: { type: Number, required: true },
  downloadDate: { type: Date, default: Date.now },
  campaignIds: [{ type: String }],
});

export const DownloadHistory: Model<IDownloadHistory> = mongoose.models.DownloadHistory || mongoose.model<IDownloadHistory>("DownloadHistory", DownloadHistorySchema);
