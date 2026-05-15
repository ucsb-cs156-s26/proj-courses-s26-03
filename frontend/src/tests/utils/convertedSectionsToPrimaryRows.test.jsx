import { describe, expect, test } from "vitest";
import { convertedSectionsToPrimaryRows } from "main/utils/convertedSectionsToPrimaryRows";
import { oneSection, threeSections } from "fixtures/sectionFixtures";

describe("convertedSectionsToPrimaryRows", () => {
  test("returns empty array for empty or null input", () => {
    expect(convertedSectionsToPrimaryRows([])).toEqual([]);
    expect(convertedSectionsToPrimaryRows(null)).toEqual([]);
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
    const rows = convertedSectionsToPrimaryRows([
      {
        courseInfo,
        section: { ...oneSection[0].section, section: "  0100  " },
      },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].subRows).toEqual([]);
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

  test("sort comparator uses ?? fallback on both sides for localeCompare", () => {
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
    convertedSectionsToPrimaryRows([withNum, withoutNum]);
    convertedSectionsToPrimaryRows([withoutNum, withNum]);
  });
});
