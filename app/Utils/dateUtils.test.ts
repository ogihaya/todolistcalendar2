import { describe, expect, it } from "vitest";
import {
  addDays,
  combineDateAndTime,
  isSameDate,
  startOfDay,
  toDateKey,
} from "./dateUtils";

describe("dateUtils", () => {
  describe("startOfDay", () => {
    it("returns midnight for the same local date without mutating input", () => {
      const input = new Date(2026, 3, 25, 14, 30, 15, 123);
      const result = startOfDay(input);

      expect(result).not.toBe(input);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(3);
      expect(result.getDate()).toBe(25);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(input.getHours()).toBe(14);
      expect(input.getMinutes()).toBe(30);
    });
  });

  describe("isSameDate", () => {
    it("compares only local year, month, and day", () => {
      expect(
        isSameDate(
          new Date(2026, 3, 25, 0, 0),
          new Date(2026, 3, 25, 23, 59),
        ),
      ).toBe(true);
      expect(isSameDate(new Date(2026, 3, 25), new Date(2026, 3, 26))).toBe(
        false,
      );
    });
  });

  describe("toDateKey", () => {
    it("returns a zero-padded local YYYY-MM-DD key", () => {
      expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
      expect(toDateKey(new Date(2026, 10, 15, 0, 0))).toBe("2026-11-15");
    });
  });

  describe("addDays", () => {
    it("adds days without mutating input and preserves time", () => {
      const input = new Date(2026, 0, 31, 9, 45, 10, 5);
      const result = addDays(input, 1);

      expect(result).not.toBe(input);
      expect(toDateKey(result)).toBe("2026-02-01");
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(45);
      expect(input.getDate()).toBe(31);
    });

    it("supports negative day offsets across years", () => {
      expect(toDateKey(addDays(new Date(2026, 0, 1, 12), -1))).toBe(
        "2025-12-31",
      );
    });
  });

  describe("combineDateAndTime", () => {
    it("uses the date from the first argument and time from the second without mutation", () => {
      const date = new Date(2026, 3, 25, 1, 2, 3, 4);
      const timeSource = new Date(2020, 0, 1, 14, 35, 45, 678);
      const result = combineDateAndTime(date, timeSource);

      expect(toDateKey(result)).toBe("2026-04-25");
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(35);
      expect(result.getSeconds()).toBe(45);
      expect(result.getMilliseconds()).toBe(678);
      expect(date.getHours()).toBe(1);
      expect(timeSource.getFullYear()).toBe(2020);
    });
  });
});
