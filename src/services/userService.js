import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';

const SALT_ROUNDS = 10;

export async function registerUser({ email, password, name }) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('User already exists');
  }
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = new User({ email, password: hashed, name });
  await user.save();
  return { id: user._id, email: user.email, name: user.name };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error('Invalid credentials');
  }
  const payload = { sub: user._id, email: user.email };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
  return { token };
}

export async function getUserById(id) {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export async function getAllUsers() {
  return await User.find().select('-password');
}

export async function updateUser(id, updates) {
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
  }
  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export async function deleteUser(id) {
  const result = await User.findByIdAndDelete(id);
  if (!result) {
    throw new Error('User not found');
  }
  return { success: true };
}
