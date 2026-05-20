import { enrollmentHistoryFixtures } from "fixtures/enrollmentHistoryFixtures";
import {
  formatQuarter,
  sortByQuarter,
  getUniqueSections,
  buildEnrollmentByQuarter,
} from "main/components/EnrollmentHistory/EnrollmentHistoryHelper";

describe("formatQuarter", () => {
  it("formats a Spring quarter correctly", () => {
    expect(formatQuarter("20252")).toBe("S25");
  });

  it("formats a Fall quarter correctly", () => {
    expect(formatQuarter("20244")).toBe("F24");
  });

  it("formats a Winter quarter correctly", () => {
    expect(formatQuarter("20241")).toBe("W24");
  });

  it("formats a Summer quarter correctly", () => {
    expect(formatQuarter("20243")).toBe("M24");
  });

  it("returns ? for an unrecognized quarter digit", () => {
    expect(formatQuarter("20240")).toBe("?24");
  });
});

describe("sortByQuarter", () => {
  it("sorts data from oldest to newest quarter", () => {
    const unsorted = [
      { yyyyq: "20252", section: "0100", enrollment: 196 },
      { yyyyq: "20234", section: "0100", enrollment: 120 },
      { yyyyq: "20244", section: "0100", enrollment: 135 },
    ];
    const result = sortByQuarter(unsorted);
    expect(result.map((d) => d.yyyyq)).toEqual(["20234", "20244", "20252"]);
  });

  it("does not mutate the original array", () => {
    const original = [
      { yyyyq: "20252", section: "0100", enrollment: 196 },
      { yyyyq: "20234", section: "0100", enrollment: 120 },
    ];
    const copy = [...original];
    sortByQuarter(original);
    expect(original).toEqual(copy);
  });
});

describe("getUniqueSections", () => {
  it("returns a single section when data has one section", () => {
    const result = getUniqueSections(
      enrollmentHistoryFixtures.fiveQuartersOneSection,
    );
    expect(result).toEqual(["0100"]);
  });

  it("returns sorted unique sections when data has multiple sections", () => {
    const result = getUniqueSections(
      enrollmentHistoryFixtures.threeQuartersTwoSections,
    );
    expect(result).toEqual(["0100", "0200"]);
  });

  it("sorts sections alphabetically regardless of input order", () => {
    const data = [
      { section: "0300" },
      { section: "0100" },
      { section: "0200" },
    ];
    expect(getUniqueSections(data)).toEqual(["0100", "0200", "0300"]);
  });
});

describe("buildEnrollmentByQuarter", () => {
  it("builds one entry per quarter for a single-section course", () => {
    const result = buildEnrollmentByQuarter(
      enrollmentHistoryFixtures.fiveQuartersOneSection,
    );
    expect(result).toEqual([
      { quarter: "F23", "0100": 120 },
      { quarter: "S24", "0100": 148 },
      { quarter: "F24", "0100": 135 },
      { quarter: "S25", "0100": 196 },
      { quarter: "F25", "0100": 180 },
    ]);
  });

  it("builds one entry per quarter with both sections for a multi-section course", () => {
    const result = buildEnrollmentByQuarter(
      enrollmentHistoryFixtures.threeQuartersTwoSections,
    );
    expect(result).toEqual([
      { quarter: "S24", "0100": 148, "0200": 132 },
      { quarter: "F24", "0100": 135, "0200": 117 },
      { quarter: "S25", "0100": 196, "0200": 176 },
    ]);
  });

  it("handles unsorted input by sorting before building", () => {
    const unsorted = [
      enrollmentHistoryFixtures.fiveQuartersOneSection[2], // F24
      enrollmentHistoryFixtures.fiveQuartersOneSection[0], // F23
      enrollmentHistoryFixtures.fiveQuartersOneSection[3], // S25
    ];
    const result = buildEnrollmentByQuarter(unsorted);
    expect(result.map((d) => d.quarter)).toEqual(["F23", "F24", "S25"]);
  });

  it("returns an empty array for empty input", () => {
    expect(buildEnrollmentByQuarter([])).toEqual([]);
  });
});
