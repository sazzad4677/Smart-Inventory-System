import mongoose, { Document, Schema } from 'mongoose';

export interface IApiMetric extends Document {
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const ApiMetricSchema: Schema = new Schema(
  {
    method: { type: String, required: true },
    endpoint: { type: String, required: true, index: true },
    statusCode: { type: Number, required: true },
    responseTime: { type: Number, required: true }, // in milliseconds
    ip: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

ApiMetricSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
ApiMetricSchema.index({ endpoint: 1, createdAt: -1 });

const ApiMetric = mongoose.model<IApiMetric>('ApiMetric', ApiMetricSchema);

export default ApiMetric;
