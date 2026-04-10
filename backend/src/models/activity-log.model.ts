import { Schema, model, Document, Model, Types } from 'mongoose';
import { IActivityLog } from '../types';

export interface IActivityLogDocument extends Omit<IActivityLog, 'user_id'>, Document {
  user_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLogModel extends Model<IActivityLogDocument> {}

const activityLogSchema = new Schema<IActivityLogDocument, IActivityLogModel>(
  {
    action_text: {
      type: String,
      required: [true, 'Action text is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Activity type is required'],
      trim: true,
    },
    resource: {
      type: String,
      trim: true,
    },
    resource_id: {
      type: String,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ip_address: {
      type: String,
      trim: true,
    },
    user_agent: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    is_undone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

activityLogSchema.index({ user_id: 1, timestamp: -1 });
activityLogSchema.index({ type: 1 });
activityLogSchema.index({ resource: 1 });

const ActivityLog = model<IActivityLogDocument, IActivityLogModel>(
  'ActivityLog',
  activityLogSchema,
);
export default ActivityLog;
