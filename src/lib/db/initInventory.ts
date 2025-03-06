import Inventory from "./models/Inventory";

export const initInventory = async () => {
  const items = [
    { item: "iPhone 14", price: 999, stock: 20 },
    { item: "iPhone 14 Pro", price: 999, stock: 30 },
    { item: "iPhone 14 Pro Max", price: 999, stock: 40 },
    { item: "iPhone 15", price: 999, stock: 50 },
    { item: "iPhone 15 Pro", price: 999, stock: 60 },
    { item: "iPhone 15 Pro Max", price: 999, stock: 70 },
    { item: "iPhone 16", price: 999, stock: 80 },
    { item: "iPhone 16 Pro", price: 999, stock: 90 },
    { item: "iPhone 16 Pro Max", price: 999, stock: 100 },
    { item: "Galaxy S22", price: 799, stock: 110 },
    { item: "Pixel 7", price: 599, stock: 0 },
  ];

  for (const item of items) {
    const existingItem = await Inventory.findOne({ item: item.item });
    if (!existingItem) {
      await Inventory.create(item);
    }
  }
};
