import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const commentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
}, { timestamps: true });

export default model('Comment', commentSchema);
