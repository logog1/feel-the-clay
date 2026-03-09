import { describe, it, expect } from "vitest";

// Test cart logic as pure functions (extracted from CartContext behavior)

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

type CartItemInput = Omit<CartItem, "quantity">;

function addItem(items: CartItem[], item: CartItemInput): CartItem[] {
  const existing = items.find((i) => i.id === item.id);
  if (existing) {
    return items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
  }
  return [...items, { ...item, quantity: 1 }];
}

function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((i) => i.id !== id);
}

function updateQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((i) => i.id !== id);
  return items.map((i) => (i.id === id ? { ...i, quantity } : i));
}

function totalItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

function totalPrice(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

const mug: CartItemInput = { id: "p1", name: "Clay Mug", price: 50, image: "/mug.jpg", category: "pottery" };
const vase: CartItemInput = { id: "p2", name: "Vase", price: 120, image: "/vase.jpg", category: "pottery" };

describe("Cart Logic", () => {
  it("starts empty", () => {
    expect(totalItems([])).toBe(0);
    expect(totalPrice([])).toBe(0);
  });

  it("adds item with quantity 1", () => {
    const items = addItem([], mug);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
    expect(totalPrice(items)).toBe(50);
  });

  it("increments quantity for same item", () => {
    let items = addItem([], mug);
    items = addItem(items, mug);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(totalPrice(items)).toBe(100);
  });

  it("handles multiple items", () => {
    let items = addItem([], mug);
    items = addItem(items, vase);
    expect(items).toHaveLength(2);
    expect(totalItems(items)).toBe(2);
    expect(totalPrice(items)).toBe(170);
  });

  it("removes item by id", () => {
    let items = addItem([], mug);
    items = addItem(items, vase);
    items = removeItem(items, "p1");
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("p2");
  });

  it("updates quantity", () => {
    let items = addItem([], mug);
    items = updateQuantity(items, "p1", 5);
    expect(items[0].quantity).toBe(5);
    expect(totalPrice(items)).toBe(250);
  });

  it("removes when quantity 0", () => {
    let items = addItem([], mug);
    items = updateQuantity(items, "p1", 0);
    expect(items).toHaveLength(0);
  });

  it("removes when quantity negative", () => {
    let items = addItem([], mug);
    items = updateQuantity(items, "p1", -1);
    expect(items).toHaveLength(0);
  });

  it("correct total after removing middle item", () => {
    const bowl: CartItemInput = { id: "p3", name: "Bowl", price: 80, image: "/b.jpg", category: "pottery" };
    let items = addItem([], mug);
    items = addItem(items, vase);
    items = addItem(items, bowl);
    items = removeItem(items, "p2");
    expect(totalPrice(items)).toBe(130);
  });
});
