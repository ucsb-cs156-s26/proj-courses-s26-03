import { describe, expect, test } from "vitest";
import { convertedSectionsToPrimaryRows } from "main/utils/convertedSectionsToPrimaryRows";
import { oneSection, threeSections } from "fixtures/sectionFixtures";

describe("convertedSectionsToPrimaryRows", () => {
  test("returns empty array for empty or null input", () => {
    expect(convertedSectionsToPrimaryRows([])).toEqual([]);
    expect(convertedSectionsToPrimaryRows(null)).toEqual([]);
    expect(convertedSectionsToPrimaryRows({ length: 0 })).toEqual([]);
  });

  test("groups lecture with discussions for same quarter and course", () => {
    const rows = convertedSectionsToPrimaryRows(threeSections);
    expect(rows).toHaveLength(2);
    const ece5 = rows.find(
      (r) => r.primary.section === "0100" && r.subRows.length > 0,
    );
    expect(ece5).toBeDefined();
    expect(ece5.subRows).toHaveLength(1);
    expect(ece5.subRows[0].section).toBe("0101");
  });

  test("single lecture only has empty subRows", () => {
    const rows = convertedSectionsToPrimaryRows(oneSection);
    expect(rows).toHaveLength(1);
    expect(rows[0].subRows).toEqual([]);
    expect(rows[0].primary.section).toBe("0100");
    expect(rows[0].courseId).toBe(oneSection[0].courseInfo.courseId);
    expect(rows[0].title).toBe(oneSection[0].courseInfo.title);
  });

  test("second lecture in same course group closes prior primary row", () => {
    const { courseInfo } = oneSection[0];
    const lec1 = {
      courseInfo,
      section: { ...oneSection[0].section, section: "0100", enrollCode: "a" },
    };
    const disc = {
      courseInfo,
      section: { ...oneSection[0].section, section: "0101", enrollCode: "b" },
    };
    const lec2 = {
      courseInfo,
      section: { ...oneSection[0].section, section: "0200", enrollCode: "c" },
    };
    const rows = convertedSectionsToPrimaryRows([lec1, disc, lec2]);
    expect(rows).toHaveLength(2);
    expect(rows[0].subRows).toHaveLength(1);
    expect(rows[0].primary.section).toBe("0100");
    expect(rows[1].primary.section).toBe("0200");
    expect(rows[1].subRows).toEqual([]);
  });

  test("discussion before any lecture becomes its own primary row", () => {
    const { courseInfo } = oneSection[0];
    const orphan = {
      courseInfo,
      section: { ...oneSection[0].section, section: "0101", enrollCode: "z" },
    };
    const rows = convertedSectionsToPrimaryRows([orphan]);
    expect(rows).toHaveLength(1);
    expect(rows[0].primary.section).toBe("0101");
    expect(rows[0].subRows).toEqual([]);
  });

  test("null or non-string section number is not treated as lecture row", () => {
    const { courseInfo } = oneSection[0];
    const nullSec = {
      courseInfo,
      section: { ...oneSection[0].section, section: null },
    };
    expect(
      convertedSectionsToPrimaryRows([nullSec])[0].primary.section,
    ).toBeNull();
    const numSec = {
      courseInfo,
      section: { ...oneSection[0].section, section: 100 },
    };
    expect(convertedSectionsToPrimaryRows([numSec])[0].primary.section).toBe(
      100,
    );
  });

  test("uses empty description and generalEducation when absent on courseInfo", () => {
    const courseInfo = {
      quarter: "20221",
      courseId: "CMPSC   130A",
      title: "Test",
    };
    const rows = convertedSectionsToPrimaryRows([
      { courseInfo, section: { ...oneSection[0].section, section: "0100" } },
    ]);
    expect(rows[0].description).toBe("");
    expect(rows[0].generalEducation).toEqual([]);
  });

  test("uses empty description and generalEducation when null on courseInfo", () => {
    const { section, courseInfo: baseInfo } = oneSection[0];
    const courseInfo = {
      ...baseInfo,
      description: null,
      generalEducation: null,
    };
    const orphan = {
      courseInfo,
      section: { ...section, section: "0101" },
    };
    const lecture = {
      courseInfo,
      section: { ...section, section: "0100" },
    };
    const fromOrphan = convertedSectionsToPrimaryRows([orphan])[0];
    expect(fromOrphan.description).toBe("");
    expect(fromOrphan.generalEducation).toEqual([]);

    const fromLecture = convertedSectionsToPrimaryRows([lecture])[0];
    expect(fromLecture.description).toBe("");
    expect(fromLecture.generalEducation).toEqual([]);
  });

  test("sorts course groups by courseId when quarter matches", () => {
    const { section, courseInfo: baseInfo } = oneSection[0];
    const quarter = "20221";
    const courseB = { ...baseInfo, quarter, courseId: "CMPSC   130B" };
    const courseA = { ...baseInfo, quarter, courseId: "CMPSC   130A" };
    const rowB = {
      courseInfo: courseB,
      section: { ...section, section: "0100", enrollCode: "b" },
    };
    const rowA = {
      courseInfo: courseA,
      section: { ...section, section: "0100", enrollCode: "a" },
    };
    const rows = convertedSectionsToPrimaryRows([rowB, rowA]);
    expect(rows.map((r) => r.courseId)).toEqual([
      "CMPSC   130A",
      "CMPSC   130B",
    ]);
  });

  test("sorts course groups by quarter when quarters differ", () => {
    const { section, courseInfo: baseInfo } = oneSection[0];
    const earlyQuarter = {
      ...baseInfo,
      quarter: "20221",
      courseId: "CMPSC   130A",
    };
    const lateQuarter = {
      ...baseInfo,
      quarter: "20222",
      courseId: "CMPSC   130A",
    };
    const firstInInput = {
      courseInfo: earlyQuarter,
      section: { ...section, section: "0100", enrollCode: "a" },
    };
    const secondInInput = {
      courseInfo: lateQuarter,
      section: { ...section, section: "0100", enrollCode: "b" },
    };
    const rowsForward = convertedSectionsToPrimaryRows([
      firstInInput,
      secondInInput,
    ]);
    expect(rowsForward.map((r) => r.quarter)).toEqual(["20222", "20221"]);

    const rowsReverse = convertedSectionsToPrimaryRows([
      secondInInput,
      firstInInput,
    ]);
    expect(rowsReverse.map((r) => r.quarter)).toEqual(["20222", "20221"]);
  });

  test("trims whitespace when detecting lecture section numbers", () => {
    const { courseInfo } = oneSection[0];
    const lecture = {
      courseInfo,
      section: {
        ...oneSection[0].section,
        section: "  0100  ",
        enrollCode: "lec",
      },
    };
    const discussion = {
      courseInfo,
      section: {
        ...oneSection[0].section,
        section: "0101",
        enrollCode: "disc",
      },
    };
    const rows = convertedSectionsToPrimaryRows([lecture, discussion]);
    expect(rows).toHaveLength(1);
    expect(rows[0].primary.section).toBe("  0100  ");
    expect(rows[0].subRows.map((s) => s.enrollCode)).toEqual(["disc"]);
  });

  test("sorts section numbers with numeric-aware localeCompare options", () => {
    const { courseInfo } = oneSection[0];
    const n100 = {
      courseInfo,
      section: { ...oneSection[0].section, section: "100", enrollCode: "1" },
    };
    const n99 = {
      courseInfo,
      section: { ...oneSection[0].section, section: "99", enrollCode: "2" },
    };
    const rows = convertedSectionsToPrimaryRows([n100, n99]);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.primary.section)).toEqual(["99", "100"]);
  });

  test("does not treat malformed digit runs as lecture section numbers", () => {
    const { courseInfo } = oneSection[0];
    const disc = {
      courseInfo,
      section: {
        ...oneSection[0].section,
        section: "0101",
        enrollCode: "disc",
      },
    };
    const junkPrefix = {
      courseInfo,
      section: { ...oneSection[0].section, section: "x0100", enrollCode: "jp" },
    };
    const junkSuffix = {
      courseInfo,
      section: {
        ...oneSection[0].section,
        section: "0100junk",
        enrollCode: "js",
      },
    };
    const rowsPrefix = convertedSectionsToPrimaryRows([junkPrefix, disc]);
    expect(rowsPrefix).toHaveLength(2);

    const rowsSuffix = convertedSectionsToPrimaryRows([junkSuffix, disc]);
    expect(rowsSuffix).toHaveLength(2);
  });

  test("sorts sections within a group by section number", () => {
    const { courseInfo } = oneSection[0];
    const c = {
      courseInfo,
      section: { ...oneSection[0].section, section: "0201", enrollCode: "3" },
    };
    const a = {
      courseInfo,
      section: { ...oneSection[0].section, section: "0100", enrollCode: "1" },
    };
    const b = {
      courseInfo,
      section: { ...oneSection[0].section, section: "0102", enrollCode: "2" },
    };
    const rows = convertedSectionsToPrimaryRows([c, a, b]);
    expect(rows).toHaveLength(1);
    expect(rows[0].primary.section).toBe("0100");
    expect(rows[0].subRows.map((s) => s.section)).toEqual(["0102", "0201"]);
  });

  test("sort uses empty string when section number is missing", () => {
    const { courseInfo } = oneSection[0];
    const noNum = {
      courseInfo,
      section: {
        ...oneSection[0].section,
        section: undefined,
        enrollCode: "1",
      },
    };
    const hasNum = {
      courseInfo,
      section: { ...oneSection[0].section, section: "0101", enrollCode: "2" },
    };
    const rows = convertedSectionsToPrimaryRows([hasNum, noNum]);
    expect(rows).toHaveLength(2);
    expect(rows[0].primary.section).toBeUndefined();
    expect(rows[1].primary.section).toBe("0101");
  });

  test("sort comparator uses empty string when rhs section number is missing", () => {
    const { courseInfo } = oneSection[0];
    const withNum = {
      courseInfo,
      section: { ...oneSection[0].section, section: "0201", enrollCode: "a" },
    };
    const withoutNum = {
      courseInfo,
      section: {
        ...oneSection[0].section,
        section: undefined,
        enrollCode: "b",
      },
    };
    const rowsAB = convertedSectionsToPrimaryRows([withNum, withoutNum]);
    expect(rowsAB.map((r) => r.primary.enrollCode)).toEqual(["b", "a"]);

    const rowsBA = convertedSectionsToPrimaryRows([withoutNum, withNum]);
    expect(rowsBA.map((r) => r.primary.enrollCode)).toEqual(["b", "a"]);
  });
});
