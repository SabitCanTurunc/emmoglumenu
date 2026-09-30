import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function check() {
  await mongoose.connect(uri!);
  const categories = await Category.find({});
  console.log('Categories in DB:');
  categories.forEach(c => console.log(c.name));
  process.exit(0);
}

check();
