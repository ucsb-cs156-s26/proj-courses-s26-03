import { describe, expect, test } from "vitest";
import { convertedSectionsToPrimaryRows } from "main/utils/convertedSectionsToPrimaryRows";
import {
  oneSection,
  threeSections,
} from "fixtures/sectionFixtures";

describe("convertedSectionsToPrimaryRows", () => {
  test("returns empty array for empty or null input", () => {
    expect(convertedSectionsToPrimaryRows([])).toEqual([]);
    expect(convertedSectionsToPrimaryRows(null)).toEqual([]);
  });

  test("groups lecture with discussions for same quarter and course", () => {
    const rows = convertedSectionsToPrimaryRows(threeSections);
    expect(rows).toHaveLength(2);
    const ece5 = rows.find((r) => r.primary.section === "0100" && r.subRows.length > 0);
    expect(ece5).toBeDefined();
    expect(ece5.subRows).toHaveLength(1);
    expect(ece5.subRows[0].section).toBe("0101");
  });

  test("single lecture only has empty subRows", () => {
    const rows = convertedSectionsToPrimaryRows(oneSection);
    expect(rows).toHaveLength(1);
    expect(rows[0].subRows).toEqual([]);
    expect(rows[0].primary.section).toBe("0100");
  });
});
