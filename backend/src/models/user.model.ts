import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types';

export interface IUserDocument extends IUser, Document {
  /** Compare a plain-text password against the stored hash */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {}

// ─── Schema

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password_hash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'Role is required'],
      default: UserRole.Manager,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ─── Pre-save Hook

userSchema.pre<IUserDocument>('save', async function () {
  if (!this.isModified('password_hash')) return;

  const salt = await bcrypt.genSalt(12);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
});

// ─── Instance Methods
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// ─── Model

const User = model<IUserDocument, IUserModel>('User', userSchema);

export default User;
