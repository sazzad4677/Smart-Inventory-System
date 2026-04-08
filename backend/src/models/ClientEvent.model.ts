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
    timestamps: { createdAt: true, updatedAt: false },
  },
);
ClientEventSchema.index({ userId: 1, eventName: 1, createdAt: -1 });

const ClientEvent = mongoose.model<IClientEvent>('ClientEvent', ClientEventSchema);

export default ClientEvent;
