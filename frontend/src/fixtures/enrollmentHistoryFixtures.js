// Realistic snapshots of CMPSC 156 section 0100, Spring 2025.
// Each record represents one scrape of enrollment data at that dateCreated.
export const enrollmentHistoryFixtures = {
  // 5 snapshots, one section, one quarter
  fiveSnapshotsSingleSection: [
    {
      id: 1,
      yyyyq: "20252",
      enrollCd: "07526",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 20,
      dateCreated: "2025-01-15T10:00:00Z",
    },
    {
      id: 2,
      yyyyq: "20252",
      enrollCd: "07526",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 88,
      dateCreated: "2025-02-03T08:00:00Z",
    },
    {
      id: 3,
      yyyyq: "20252",
      enrollCd: "07526",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 152,
      dateCreated: "2025-02-18T08:00:00Z",
    },
    {
      id: 4,
      yyyyq: "20252",
      enrollCd: "07526",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 185,
      dateCreated: "2025-03-15T10:00:00Z",
    },
    {
      id: 5,
      yyyyq: "20252",
      enrollCd: "07526",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 196,
      dateCreated: "2025-04-01T10:00:00Z",
    },
  ],

  // 5 snapshots each for two sections, same quarter → two charts
  tenSnapshotsTwoSections: [
    {
      id: 6,
      yyyyq: "20252",
      enrollCd: "07526",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 20,
      dateCreated: "2025-01-15T10:00:00Z",
    },
    {
      id: 7,
      yyyyq: "20252",
      enrollCd: "07526",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 88,
      dateCreated: "2025-02-03T08:00:00Z",
    },
    {
      id: 8,
      yyyyq: "20252",
      enrollCd: "07526",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 196,
      dateCreated: "2025-04-01T10:00:00Z",
    },
    {
      id: 9,
      yyyyq: "20252",
      enrollCd: "07542",
      courseId: "CMPSC   156",
      section: "0200",
      enrollment: 15,
      dateCreated: "2025-01-15T10:00:00Z",
    },
    {
      id: 10,
      yyyyq: "20252",
      enrollCd: "07542",
      courseId: "CMPSC   156",
      section: "0200",
      enrollment: 75,
      dateCreated: "2025-02-03T08:00:00Z",
    },
    {
      id: 11,
      yyyyq: "20252",
      enrollCd: "07542",
      courseId: "CMPSC   156",
      section: "0200",
      enrollment: 176,
      dateCreated: "2025-04-01T10:00:00Z",
    },
  ],

  // 5 snapshots, one section, a past quarter
  fiveSnapshotsPastQuarter: [
    {
      id: 12,
      yyyyq: "20242",
      enrollCd: "07500",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 18,
      dateCreated: "2024-01-15T10:00:00Z",
    },
    {
      id: 13,
      yyyyq: "20242",
      enrollCd: "07500",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 82,
      dateCreated: "2024-02-05T08:00:00Z",
    },
    {
      id: 14,
      yyyyq: "20242",
      enrollCd: "07500",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 140,
      dateCreated: "2024-02-20T08:00:00Z",
    },
    {
      id: 15,
      yyyyq: "20242",
      enrollCd: "07500",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 163,
      dateCreated: "2024-03-10T10:00:00Z",
    },
    {
      id: 16,
      yyyyq: "20242",
      enrollCd: "07500",
      courseId: "CMPSC   156",
      section: "0100",
      enrollment: 148,
      dateCreated: "2024-04-01T10:00:00Z",
    },
  ],
};

// Example UCSB enrollment pass times for Spring 2025
export const passTimes2025Spring = [
  { label: "Pass 1", date: "2025-02-03T08:00:00Z" },
  { label: "Pass 2", date: "2025-02-18T08:00:00Z" },
  { label: "Pass 3", date: "2025-02-28T08:00:00Z" },
];

// Example UCSB enrollment pass times for Spring 2024
export const passTimes2024Spring = [
  { label: "Pass 1", date: "2024-02-05T08:00:00Z" },
  { label: "Pass 2", date: "2024-02-20T08:00:00Z" },
  { label: "Pass 3", date: "2024-03-04T08:00:00Z" },
];
