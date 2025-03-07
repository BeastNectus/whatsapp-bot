import Inventory from "../db/models/Inventory";
import { normalizeItemName } from "./normalize";

export const findInventoryItem = async (userInput: string) => {
  const normalized = normalizeItemName(userInput);
  console.log("Searching for item:", normalized); // Debug log

  const exactMatch = await Inventory.findOne({ item: { $regex: new RegExp(`^${normalized}$`, "i") } });
  if (exactMatch) {
    console.log("Exact match found:", exactMatch); // Debug log
    return exactMatch;
  }

  const partialMatch = await Inventory.findOne({ item: { $regex: new RegExp(normalized, "i") } });
  if (partialMatch) {
    console.log("Partial match found:", partialMatch); // Debug log
    return partialMatch;
  }

  console.log("No match found for:", normalized); // Debug log
  return null;
};

export const listProducts = async () => {
  const products = await Inventory.find({ stock: { $gt: 0 } });
  if (!products.length) return "😔 No products available.";

  return "🛍️ *Available Products:*\n\n" + products.map((p, i) => `👉 ${i + 1}. ${p.item} - 💵 $${p.price} (📦 ${p.stock} left)`).join("\n");
};

export const suggestAvailableItems = async () => {
  const availableItems = await Inventory.find({ stock: { $gt: 0 } }).limit(5);
  return availableItems.length ? 
    "✨ Here are some available items:\n\n" + availableItems.map((item, i) => `👉 ${i + 1}. ${item.item} - 💵 $${item.price} (📦 ${item.stock} left)`).join("\n") :
    "😔 No products available.";
};
