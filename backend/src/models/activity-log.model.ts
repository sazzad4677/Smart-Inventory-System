import { Schema, model, Document, Model, Types } from 'mongoose';
import { IActivityLog } from '../types';

export interface IActivityLogDocument extends Omit<IActivityLog, 'user_id'>, Document {
  user_id: Types.ObjectId;
}

export interface IActivityLogModel extends Model<IActivityLogDocument> {}

const activityLogSchema = new Schema<IActivityLogDocument, IActivityLogModel>(
  {
    action_text: {
      type: String,
      required: [true, 'Action text is required'],
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
  },
  { versionKey: false },
);

const ActivityLog = model<IActivityLogDocument, IActivityLogModel>(
  'ActivityLog',
  activityLogSchema,
);
export default ActivityLog;
