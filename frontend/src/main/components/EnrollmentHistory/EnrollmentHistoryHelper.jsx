// Stryker disable all
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const quarterLabel = { 1: "W", 2: "S", 3: "M", 4: "F" };
// Stryker restore all

// Converts yyyyq (e.g. "20252") to a short display label (e.g. "S25")
export const formatQuarter = (yyyyq) => {
  const year = yyyyq.slice(2, 4);
  const qtr = yyyyq[4];
  return `${quarterLabel[qtr] || "?"}${year}`;
};

// Converts a UTC ms timestamp to a display string like "Mar 01"
export const formatDateForAxis = (timestamp) => {
  const date = new Date(timestamp);
  const month = MONTH_NAMES[date.getUTCMonth()];
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month} ${day}`;
};

// Returns a new array sorted by dateCreated ascending (oldest first)
export const sortByDateCreated = (data) => {
  return [...data].sort(
    (a, b) =>
      new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime(),
  );
};

// Groups enrollment data by "yyyyq-section" key
export const groupBySectionAndQuarter = (data) => {
  const groups = {};
  data.forEach((item) => {
    const key = `${item.yyyyq}-${item.section}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
};

// Transforms section data into a Recharts-friendly time series.
// Returns [{ timestamp: ms, enrollment: number }, ...] sorted oldest first.
export const buildTimeSeries = (sectionData) => {
  return sortByDateCreated(sectionData).map((item) => ({
    timestamp: new Date(item.dateCreated).getTime(),
    enrollment: item.enrollment,
  }));
};
