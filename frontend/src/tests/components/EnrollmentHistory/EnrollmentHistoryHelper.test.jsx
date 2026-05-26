import {
  enrollmentHistoryFixtures,
  passTimes2025Spring,
  passTimes2024Spring,
} from "fixtures/enrollmentHistoryFixtures";
import {
  formatQuarter,
  formatDateForAxis,
  sortByDateCreated,
  groupBySectionAndQuarter,
  buildTimeSeries,
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

describe("formatDateForAxis", () => {
  it("formats a March date correctly", () => {
    const ts = new Date("2025-03-01T00:00:00Z").getTime();
    expect(formatDateForAxis(ts)).toBe("Mar 01");
  });

  it("formats a November date correctly", () => {
    const ts = new Date("2024-11-15T00:00:00Z").getTime();
    expect(formatDateForAxis(ts)).toBe("Nov 15");
  });

  it("pads single-digit days with a leading zero", () => {
    const ts = new Date("2025-02-03T00:00:00Z").getTime();
    expect(formatDateForAxis(ts)).toBe("Feb 03");
  });
});

describe("sortByDateCreated", () => {
  it("sorts data from oldest to newest dateCreated", () => {
    const unsorted = [
      { dateCreated: "2025-04-01T10:00:00Z", enrollment: 196 },
      { dateCreated: "2025-01-15T10:00:00Z", enrollment: 20 },
      { dateCreated: "2025-02-18T08:00:00Z", enrollment: 152 },
    ];
    const result = sortByDateCreated(unsorted);
    expect(result.map((d) => d.enrollment)).toEqual([20, 152, 196]);
  });

  it("does not mutate the original array", () => {
    const original = enrollmentHistoryFixtures.fiveSnapshotsSingleSection;
    const copy = [...original];
    sortByDateCreated(original);
    expect(original).toEqual(copy);
  });
});

describe("groupBySectionAndQuarter", () => {
  it("creates a single group for one section-quarter combination", () => {
    const groups = groupBySectionAndQuarter(
      enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
    );
    const keys = Object.keys(groups);
    expect(keys).toEqual(["20252-0100"]);
    expect(groups["20252-0100"]).toHaveLength(5);
  });

  it("creates two groups for two sections in the same quarter", () => {
    const groups = groupBySectionAndQuarter(
      enrollmentHistoryFixtures.tenSnapshotsTwoSections,
    );
    const keys = Object.keys(groups).sort();
    expect(keys).toEqual(["20252-0100", "20252-0200"]);
    expect(groups["20252-0100"]).toHaveLength(3);
    expect(groups["20252-0200"]).toHaveLength(3);
  });

  it("assigns each item to the correct group", () => {
    const groups = groupBySectionAndQuarter(
      enrollmentHistoryFixtures.tenSnapshotsTwoSections,
    );
    groups["20252-0100"].forEach((item) => {
      expect(item.section).toBe("0100");
      expect(item.yyyyq).toBe("20252");
    });
    groups["20252-0200"].forEach((item) => {
      expect(item.section).toBe("0200");
      expect(item.yyyyq).toBe("20252");
    });
  });
});

describe("buildTimeSeries", () => {
  it("converts dateCreated strings to UTC ms timestamps", () => {
    const result = buildTimeSeries(
      enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
    );
    expect(result[0].timestamp).toBe(
      new Date("2025-01-15T10:00:00Z").getTime(),
    );
  });

  it("preserves enrollment values", () => {
    const result = buildTimeSeries(
      enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
    );
    expect(result.map((d) => d.enrollment)).toEqual([20, 88, 152, 185, 196]);
  });

  it("returns data sorted oldest first regardless of input order", () => {
    const reversed = [
      ...enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
    ].reverse();
    const result = buildTimeSeries(reversed);
    const timestamps = result.map((d) => d.timestamp);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });

  it("returns an empty array for empty input", () => {
    expect(buildTimeSeries([])).toEqual([]);
  });
});

describe("passTimes2025Spring fixture", () => {
  it("has three pass time entries with label and date", () => {
    expect(passTimes2025Spring).toHaveLength(3);
    expect(passTimes2025Spring[0].label).toBe("Pass 1");
    expect(passTimes2025Spring[1].label).toBe("Pass 2");
    expect(passTimes2025Spring[2].label).toBe("Pass 3");
    passTimes2025Spring.forEach((p) => {
      expect(p.label).toBeTruthy();
      expect(new Date(p.date).getTime()).toBeGreaterThan(0);
    });
  });
});

describe("passTimes2024Spring fixture", () => {
  it("has three pass time entries with label and date", () => {
    expect(passTimes2024Spring).toHaveLength(3);
    expect(passTimes2024Spring[0].label).toBe("Pass 1");
    expect(passTimes2024Spring[1].label).toBe("Pass 2");
    expect(passTimes2024Spring[2].label).toBe("Pass 3");
    passTimes2024Spring.forEach((p) => {
      expect(p.label).toBeTruthy();
      expect(new Date(p.date).getTime()).toBeGreaterThan(0);
    });
  });
});
