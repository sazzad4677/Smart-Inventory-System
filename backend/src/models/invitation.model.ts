import { Schema, model, Document, Types } from 'mongoose';
import { UserRole } from '../types';

export interface IInvitation {
  email: string;
  token: string;
  role: UserRole;
  expiresAt: Date;
  used: boolean;
  invitedBy: Types.ObjectId;
}

export interface IInvitationDocument extends IInvitation, Document {}

const invitationSchema = new Schema<IInvitationDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'Role is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    used: {
      type: Boolean,
      default: false,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index for auto-deletion of expired invitations
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Invitation = model<IInvitationDocument>('Invitation', invitationSchema);

export default Invitation;
