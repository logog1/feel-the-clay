import { describe, it, expect } from "vitest";

// Extract and test the pure projection calculation logic independently

const SEASONALITY = [0.6, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6];
const SCENARIO_MULTIPLIERS: Record<string, number> = { conservative: 0.75, base: 1.0, aggressive: 1.35 };

type ScenarioSettings = {
  pricePerPerson: number;
  utilization: number;
  variableCost: number;
  fixedCosts: number;
  daysPerWeek: number;
  sessionsPerDay: number;
  minGroupSize: number;
  maxGroupSize: number;
  instructorCapacitySessions: number;
  instructorCost: number;
};

const DEFAULT_SETTINGS: Record<string, ScenarioSettings> = {
  conservative: {
    pricePerPerson: 150, utilization: 40, variableCost: 50, fixedCosts: 300,
    daysPerWeek: 3, sessionsPerDay: 1, minGroupSize: 4, maxGroupSize: 8,
    instructorCapacitySessions: 2, instructorCost: 3000,
  },
  base: {
    pricePerPerson: 200, utilization: 65, variableCost: 40, fixedCosts: 500,
    daysPerWeek: 5, sessionsPerDay: 2, minGroupSize: 4, maxGroupSize: 10,
    instructorCapacitySessions: 2, instructorCost: 4000,
  },
  aggressive: {
    pricePerPerson: 250, utilization: 85, variableCost: 35, fixedCosts: 800,
    daysPerWeek: 5, sessionsPerDay: 2, minGroupSize: 6, maxGroupSize: 10,
    instructorCapacitySessions: 2, instructorCost: 5000,
  },
};

function computeProjection(settings: ScenarioSettings, scenario: string) {
  const weeksPerMonth = 4.33;
  const workDaysPerMonth = Math.round(settings.daysPerWeek * weeksPerMonth);
  const maxSessionsPerMonth = workDaysPerMonth * settings.sessionsPerDay;
  const avgGroupSize = (settings.minGroupSize + settings.maxGroupSize) / 2;
  const maxParticipantsPerMonth = Math.round(maxSessionsPerMonth * avgGroupSize);
  const mult = SCENARIO_MULTIPLIERS[scenario] || 1;

  const data = Array.from({ length: 36 }, (_, i) => {
    const monthIndex = i % 12;
    const yearFactor = 1 + Math.floor(i / 12) * 0.15;
    const seasonal = SEASONALITY[monthIndex];
    const rawDemand = Math.round(maxParticipantsPerMonth * (settings.utilization / 100) * seasonal * mult * yearFactor);
    const participants = Math.min(rawDemand, maxParticipantsPerMonth);
    const unmetDemand = Math.max(0, rawDemand - maxParticipantsPerMonth);
    const sessionsNeeded = Math.ceil(participants / avgGroupSize);
    const revenue = participants * settings.pricePerPerson;
    const costs = settings.fixedCosts + participants * settings.variableCost;
    const profit = revenue - costs;
    const maxSessionsPerInstructor = settings.instructorCapacitySessions * workDaysPerMonth;
    const instructorsNeeded = Math.ceil(sessionsNeeded / maxSessionsPerInstructor);

    return { participants, rawDemand, unmetDemand, revenue, costs, profit, sessionsNeeded, instructorsNeeded };
  });

  return { data, workDaysPerMonth, maxSessionsPerMonth, avgGroupSize, maxParticipantsPerMonth };
}

describe("Projections Calculations", () => {
  describe("Capacity metrics", () => {
    it("computes work days per month correctly", () => {
      const { workDaysPerMonth } = computeProjection(DEFAULT_SETTINGS.base, "base");
      expect(workDaysPerMonth).toBe(Math.round(5 * 4.33)); // 22
    });

    it("computes max sessions per month", () => {
      const { maxSessionsPerMonth } = computeProjection(DEFAULT_SETTINGS.base, "base");
      expect(maxSessionsPerMonth).toBe(22 * 2); // 44
    });

    it("computes avg group size", () => {
      const { avgGroupSize } = computeProjection(DEFAULT_SETTINGS.base, "base");
      expect(avgGroupSize).toBe(7); // (4+10)/2
    });

    it("computes max participants per month", () => {
      const { maxParticipantsPerMonth } = computeProjection(DEFAULT_SETTINGS.base, "base");
      expect(maxParticipantsPerMonth).toBe(Math.round(44 * 7)); // 308
    });

    it("conservative has fewer work days", () => {
      const c = computeProjection(DEFAULT_SETTINGS.conservative, "conservative");
      const b = computeProjection(DEFAULT_SETTINGS.base, "base");
      expect(c.workDaysPerMonth).toBeLessThan(b.workDaysPerMonth);
    });
  });

  describe("Revenue and costs", () => {
    it("revenue = participants × price per person", () => {
      const { data } = computeProjection(DEFAULT_SETTINGS.base, "base");
      data.forEach((d) => {
        expect(d.revenue).toBe(d.participants * 200);
      });
    });

    it("costs = fixedCosts + participants × variableCost", () => {
      const { data } = computeProjection(DEFAULT_SETTINGS.base, "base");
      data.forEach((d) => {
        expect(d.costs).toBe(500 + d.participants * 40);
      });
    });

    it("profit = revenue - costs", () => {
      const { data } = computeProjection(DEFAULT_SETTINGS.base, "base");
      data.forEach((d) => {
        expect(d.profit).toBe(d.revenue - d.costs);
      });
    });
  });

  describe("Demand capping", () => {
    it("participants never exceed max capacity", () => {
      const { data, maxParticipantsPerMonth } = computeProjection(DEFAULT_SETTINGS.aggressive, "aggressive");
      data.forEach((d) => {
        expect(d.participants).toBeLessThanOrEqual(maxParticipantsPerMonth);
      });
    });

    it("unmet demand is 0 when under capacity", () => {
      const { data, maxParticipantsPerMonth } = computeProjection(DEFAULT_SETTINGS.conservative, "conservative");
      data.forEach((d) => {
        if (d.rawDemand <= maxParticipantsPerMonth) {
          expect(d.unmetDemand).toBe(0);
        }
      });
    });

    it("unmet demand = rawDemand - capacity when over", () => {
      const { data, maxParticipantsPerMonth } = computeProjection(DEFAULT_SETTINGS.aggressive, "aggressive");
      data.forEach((d) => {
        if (d.rawDemand > maxParticipantsPerMonth) {
          expect(d.unmetDemand).toBe(d.rawDemand - maxParticipantsPerMonth);
        }
      });
    });
  });

  describe("Seasonality", () => {
    it("summer months (Jun-Aug) have higher demand than winter (Jan-Feb)", () => {
      const { data } = computeProjection(DEFAULT_SETTINGS.base, "base");
      const jan = data[0]; // month 0 = Jan
      const jul = data[6]; // month 6 = Jul
      expect(jul.rawDemand).toBeGreaterThan(jan.rawDemand);
    });

    it("36 months produces 3 full yearly cycles", () => {
      const { data } = computeProjection(DEFAULT_SETTINGS.base, "base");
      expect(data).toHaveLength(36);
    });
  });

  describe("Year-over-year growth", () => {
    it("same month in year 2 has higher raw demand than year 1", () => {
      const { data } = computeProjection(DEFAULT_SETTINGS.base, "base");
      // Compare Jan Y1 (index 0) vs Jan Y2 (index 12)
      expect(data[12].rawDemand).toBeGreaterThan(data[0].rawDemand);
    });

    it("year 3 demand higher than year 2", () => {
      const { data } = computeProjection(DEFAULT_SETTINGS.base, "base");
      expect(data[24].rawDemand).toBeGreaterThan(data[12].rawDemand);
    });
  });

  describe("Scenario multipliers", () => {
    it("aggressive produces higher demand than base", () => {
      const agg = computeProjection(DEFAULT_SETTINGS.aggressive, "aggressive");
      const base = computeProjection(DEFAULT_SETTINGS.base, "base");
      // Compare raw demand for first month (both at same seasonality)
      expect(agg.data[0].rawDemand).toBeGreaterThan(base.data[0].rawDemand);
    });

    it("conservative produces lower demand than base", () => {
      const con = computeProjection(DEFAULT_SETTINGS.conservative, "conservative");
      const base = computeProjection(DEFAULT_SETTINGS.base, "base");
      expect(con.data[0].rawDemand).toBeLessThan(base.data[0].rawDemand);
    });
  });

  describe("Instructor hiring", () => {
    it("at least 1 instructor always needed", () => {
      const { data } = computeProjection(DEFAULT_SETTINGS.base, "base");
      data.forEach((d) => {
        expect(d.instructorsNeeded).toBeGreaterThanOrEqual(1);
      });
    });

    it("sessions needed = ceil(participants / avgGroupSize)", () => {
      const { data, avgGroupSize } = computeProjection(DEFAULT_SETTINGS.base, "base");
      data.forEach((d) => {
        expect(d.sessionsNeeded).toBe(Math.ceil(d.participants / avgGroupSize));
      });
    });
  });

  describe("Slider sensitivity", () => {
    it("increasing days per week increases capacity", () => {
      const s3 = computeProjection({ ...DEFAULT_SETTINGS.base, daysPerWeek: 3 }, "base");
      const s7 = computeProjection({ ...DEFAULT_SETTINGS.base, daysPerWeek: 7 }, "base");
      expect(s7.maxParticipantsPerMonth).toBeGreaterThan(s3.maxParticipantsPerMonth);
    });

    it("increasing sessions per day increases capacity", () => {
      const s1 = computeProjection({ ...DEFAULT_SETTINGS.base, sessionsPerDay: 1 }, "base");
      const s4 = computeProjection({ ...DEFAULT_SETTINGS.base, sessionsPerDay: 4 }, "base");
      expect(s4.maxParticipantsPerMonth).toBeGreaterThan(s1.maxParticipantsPerMonth);
    });

    it("higher utilization increases revenue", () => {
      const low = computeProjection({ ...DEFAULT_SETTINGS.base, utilization: 30 }, "base");
      const high = computeProjection({ ...DEFAULT_SETTINGS.base, utilization: 90 }, "base");
      const lowTotal = low.data.reduce((s, d) => s + d.revenue, 0);
      const highTotal = high.data.reduce((s, d) => s + d.revenue, 0);
      expect(highTotal).toBeGreaterThan(lowTotal);
    });

    it("higher price increases revenue", () => {
      const cheap = computeProjection({ ...DEFAULT_SETTINGS.base, pricePerPerson: 100 }, "base");
      const expensive = computeProjection({ ...DEFAULT_SETTINGS.base, pricePerPerson: 300 }, "base");
      expect(expensive.data[0].revenue).toBeGreaterThan(cheap.data[0].revenue);
    });
  });
});
