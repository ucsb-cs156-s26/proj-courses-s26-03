const quarterLabel = { 1: "W", 2: "S", 3: "M", 4: "F" };

// Converts yyyyq (e.g. "20252") to a short display label (e.g. "S25")
export const formatQuarter = (yyyyq) => {
  const year = yyyyq.slice(2, 4);
  const qtr = yyyyq[4];
  return `${quarterLabel[qtr] || "?"}${year}`;
};

// Returns a new array sorted by yyyyq ascending (oldest quarter first)
export const sortByQuarter = (data) => {
  return [...data].sort((a, b) => a.yyyyq.localeCompare(b.yyyyq));
};

// Returns sorted unique section strings present in the data
export const getUniqueSections = (data) => {
  return [...new Set(data.map((item) => item.section))].sort();
};

// Transforms raw enrollment data into a Recharts-friendly format.
// Returns one object per quarter with section enrollment counts as keys:
// e.g. [{ quarter: "S25", "0100": 196, "0200": 176 }, ...]
export const buildEnrollmentByQuarter = (data) => {
  const sorted = sortByQuarter(data);
  const quarterMap = {};

  sorted.forEach((item) => {
    const label = formatQuarter(item.yyyyq);
    if (!quarterMap[label]) {
      quarterMap[label] = { quarter: label };
    }
    quarterMap[label][item.section] = item.enrollment;
  });

  return Object.values(quarterMap);
};
