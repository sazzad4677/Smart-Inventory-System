import { Schema, model, Document, Model } from 'mongoose';

export interface ISequence extends Document {
  id: string;
  seq: number;
}

export interface ISequenceModel extends Model<ISequence> {}

const sequenceSchema = new Schema<ISequence, ISequenceModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false },
);

const Sequence = model<ISequence, ISequenceModel>('Sequence', sequenceSchema);
export default Sequence;
