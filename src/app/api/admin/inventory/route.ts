import { NextResponse } from "next/server";
import Inventory from "@/lib/db/models/Inventory";
import mongoose from "mongoose";

export async function GET() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const inventory = await Inventory.find();
  return NextResponse.json(inventory);
}
