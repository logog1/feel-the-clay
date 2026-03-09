import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart, CartItem } from "@/contexts/CartContext";
import { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const sampleItem = { id: "p1", name: "Clay Mug", price: 50, image: "/mug.jpg", category: "pottery" };
const sampleItem2 = { id: "p2", name: "Vase", price: 120, image: "/vase.jpg", category: "pottery" };

describe("CartContext", () => {
  it("starts with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("adds an item with quantity 1", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(sampleItem));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(50);
  });

  it("increments quantity when adding same item twice", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(sampleItem));
    act(() => result.current.addItem(sampleItem));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(100);
  });

  it("handles multiple different items", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(sampleItem));
    act(() => result.current.addItem(sampleItem2));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(170);
  });

  it("removes an item by id", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(sampleItem));
    act(() => result.current.addItem(sampleItem2));
    act(() => result.current.removeItem("p1"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("p2");
  });

  it("updates quantity of an item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(sampleItem));
    act(() => result.current.updateQuantity("p1", 5));
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalPrice).toBe(250);
  });

  it("removes item when quantity set to 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(sampleItem));
    act(() => result.current.updateQuantity("p1", 0));
    expect(result.current.items).toHaveLength(0);
  });

  it("removes item when quantity set to negative", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(sampleItem));
    act(() => result.current.updateQuantity("p1", -1));
    expect(result.current.items).toHaveLength(0);
  });

  it("clears all items", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(sampleItem));
    act(() => result.current.addItem(sampleItem2));
    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow("useCart must be used within CartProvider");
  });
});
