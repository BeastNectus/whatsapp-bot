import Inventory from "./models/Inventory";

export const initInventory = async () => {
  const items = [
    { item: "Jasmine Rice", price: 50, stock: 100 },
    { item: "Basmati Rice", price: 60, stock: 80 },
    { item: "Brown Rice", price: 45, stock: 90 },
    { item: "White Rice", price: 40, stock: 120 },
    { item: "Black Rice", price: 70, stock: 50 },
    { item: "Red Rice", price: 65, stock: 60 },
    { item: "Glutinous Rice", price: 55, stock: 70 },
    { item: "Wild Rice", price: 75, stock: 40 },
    { item: "Parboiled Rice", price: 48, stock: 110 },
    { item: "Sushi Rice", price: 58, stock: 30 },
    { item: "Arborio Rice", price: 62, stock: 20 },
  ];

  for (const item of items) {
    const existingItem = await Inventory.findOne({ item: item.item });
    if (!existingItem) {
      await Inventory.create(item);
    }
  }
};
