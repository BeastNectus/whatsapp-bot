import { NextResponse } from "next/server";
import Order from "@/lib/db/models/Order";
import mongoose from "mongoose";

export async function GET() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const orders = await Order.find().sort({ timestamp: -1 });
  return NextResponse.json(orders);
}
