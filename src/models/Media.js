import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const mediaSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'audio', 'document'], required: true },
  uploadedAt: { type: Date, default: Date.now },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

mediaSchema.index({ title: 'text', description: 'text' });

export default model('Media', mediaSchema);
