import mongoose, { Document, Schema } from 'mongoose';

export interface IClientEvent extends Document {
  eventName: string;
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  url?: string;
  properties?: Record<string, any>;
  createdAt: Date;
}

const ClientEventSchema: Schema = new Schema(
  {
    eventName: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String },
    url: { type: String },
    properties: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need when it happened
  },
);

// Optional TTL index if we want events to expire after 90 days.
// For now, no TTL specified for client events by default, but we can add one if data grows too large.
// ClientEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const ClientEvent = mongoose.model<IClientEvent>('ClientEvent', ClientEventSchema);

export default ClientEvent;
