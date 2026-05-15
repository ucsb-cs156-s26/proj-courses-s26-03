/**
 * Turn a flat list of ConvertedSection documents (courseInfo + section) into the
 * same hierarchical shape as /api/public/primaries: each row has quarter, courseId,
 * title, primary (lecture section), and subRows (secondary sections).
 */
function isLectureSectionNumber(sectionNum) {
  if (sectionNum == null || typeof sectionNum !== "string") {
    return false;
  }
  return /^\d+00$/.test(sectionNum.trim());
}

function groupKey(cs) {
  return `${cs.courseInfo.quarter}|${cs.courseInfo.courseId}`;
}

function sortWithinGroup(convertedSections) {
  return [...convertedSections].sort((a, b) =>
    (a.section.section ?? "").localeCompare(b.section.section ?? "", undefined, {
      numeric: true,
    }),
  );
}

export function convertedSectionsToPrimaryRows(flatConvertedSections) {
  if (!flatConvertedSections || flatConvertedSections.length === 0) {
    return [];
  }

  const groups = new Map();
  for (const cs of flatConvertedSections) {
    const key = groupKey(cs);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(cs);
  }

  const sortedKeys = [...groups.keys()].sort((ka, kb) => {
    const [qa, ca] = ka.split("|");
    const [qb, cb] = kb.split("|");
    if (qa !== qb) {
      return qb.localeCompare(qa);
    }
    return ca.localeCompare(cb);
  });

  const result = [];

  for (const key of sortedKeys) {
    const items = sortWithinGroup(groups.get(key));
    let currentPrimary = null;

    for (const cs of items) {
      const sec = cs.section;
      const info = cs.courseInfo;

      if (isLectureSectionNumber(sec.section)) {
        if (currentPrimary) {
          result.push(currentPrimary);
        }
        currentPrimary = {
          quarter: info.quarter,
          courseId: info.courseId,
          title: info.title,
          description: info.description ?? "",
          primary: sec,
          subRows: [],
          generalEducation: info.generalEducation ?? [],
        };
      } else if (currentPrimary) {
        currentPrimary.subRows.push(sec);
      } else {
        result.push({
          quarter: info.quarter,
          courseId: info.courseId,
          title: info.title,
          description: info.description ?? "",
          primary: sec,
          subRows: [],
          generalEducation: info.generalEducation ?? [],
        });
      }
    }

    if (currentPrimary) {
      result.push(currentPrimary);
    }
  }

  return result;
}
