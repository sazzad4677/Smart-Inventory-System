import { Schema, model, Document, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Session must belong to a user'],
    },
    token: {
      type: String,
      required: [true, 'Session must have a token'],
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Session must have an expiration date'],
    },
    userAgent: String,
    ipAddress: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// TTL Index: Automatically delete sessions 1 second after 'expiresAt'
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = model<ISession>('Session', sessionSchema);

export default Session;
