import mongoose from "mongoose";

const mongoDB = process.env.MONGODB_URI!;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(mongoDB);
};