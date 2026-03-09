import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirror the booking schema from BookingFormSection
const bookingSchema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  city: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Required").max(20),
  workshop: z.string().min(1, "Select a workshop"),
  participants: z.number().min(1).max(50),
  sessionType: z.string().optional(),
  date: z.date({ required_error: "Select a date" }),
  notes: z.string().max(1000).optional(),
});

const validBooking = {
  name: "Alice", city: "Tetouan", email: "alice@example.com", phone: "+212612345678",
  workshop: "pottery", participants: 4, sessionType: "open",
  date: new Date("2026-04-15"), notes: "Looking forward!",
};

describe("Booking Validation Schema", () => {
  it("accepts a valid booking", () => {
    const result = bookingSchema.safeParse(validBooking);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = bookingSchema.safeParse({ ...validBooking, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const result = bookingSchema.safeParse({ ...validBooking, name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("trims whitespace-only name as invalid", () => {
    const result = bookingSchema.safeParse({ ...validBooking, name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = bookingSchema.safeParse({ ...validBooking, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects short phone", () => {
    const result = bookingSchema.safeParse({ ...validBooking, phone: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects phone over 20 chars", () => {
    const result = bookingSchema.safeParse({ ...validBooking, phone: "1".repeat(21) });
    expect(result.success).toBe(false);
  });

  it("rejects empty workshop", () => {
    const result = bookingSchema.safeParse({ ...validBooking, workshop: "" });
    expect(result.success).toBe(false);
  });

  it("rejects 0 participants", () => {
    const result = bookingSchema.safeParse({ ...validBooking, participants: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects over 50 participants", () => {
    const result = bookingSchema.safeParse({ ...validBooking, participants: 51 });
    expect(result.success).toBe(false);
  });

  it("requires a date", () => {
    const result = bookingSchema.safeParse({ ...validBooking, date: undefined });
    expect(result.success).toBe(false);
  });

  it("accepts booking without notes", () => {
    const { notes, ...noNotes } = validBooking;
    const result = bookingSchema.safeParse(noNotes);
    expect(result.success).toBe(true);
  });

  it("rejects notes over 1000 chars", () => {
    const result = bookingSchema.safeParse({ ...validBooking, notes: "X".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("accepts empty sessionType", () => {
    const result = bookingSchema.safeParse({ ...validBooking, sessionType: "" });
    expect(result.success).toBe(true);
  });

  it("accepts 1 participant", () => {
    const result = bookingSchema.safeParse({ ...validBooking, participants: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts 50 participants", () => {
    const result = bookingSchema.safeParse({ ...validBooking, participants: 50 });
    expect(result.success).toBe(true);
  });
});

describe("Booking Date Logic", () => {
  const isDateDisabled = (date: Date, isLargeGroup: boolean, blockedDates: string[] = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    const dateStr = date.toISOString().split("T")[0];
    if (blockedDates.includes(dateStr)) return true;
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    if (!isLargeGroup && !isWeekend) return true;
    return false;
  };

  it("disables past dates", () => {
    const past = new Date("2020-01-01");
    expect(isDateDisabled(past, true)).toBe(true);
  });

  it("disables blocked dates", () => {
    const futureDate = new Date("2027-06-15");
    expect(isDateDisabled(futureDate, true, ["2027-06-15"])).toBe(true);
  });

  it("small groups can only book weekends", () => {
    // Find next Monday
    const monday = new Date();
    monday.setDate(monday.getDate() + ((1 + 7 - monday.getDay()) % 7 || 7));
    expect(isDateDisabled(monday, false)).toBe(true);
  });

  it("large groups can book weekdays", () => {
    // Find next Wednesday
    const wed = new Date();
    wed.setDate(wed.getDate() + ((3 + 7 - wed.getDay()) % 7 || 7));
    expect(isDateDisabled(wed, true)).toBe(false);
  });

  it("large groups can also book weekends", () => {
    const sat = new Date();
    sat.setDate(sat.getDate() + ((6 + 7 - sat.getDay()) % 7 || 7));
    expect(isDateDisabled(sat, true)).toBe(false);
  });
});
