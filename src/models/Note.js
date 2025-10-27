import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Full‑text search index for title and content
noteSchema.index({ title: 'text', content: 'text' });

export default model('Note', noteSchema);
