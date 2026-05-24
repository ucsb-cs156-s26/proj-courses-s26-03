import React from "react";
import OurTable from "main/components/OurTable";
import { yyyyqToQyy } from "main/utils/quarterUtilities.jsx";

export default function CoursesInGEAreaTable({ courses }) {
  const columns = [
    {
      Header: "Quarter",
      id: "quarter",
      cell: ({ cell }) => yyyyqToQyy(cell.row.original.quarter),
    },
    {
      Header: "Course ID",
      id: "courseId",
      cell: ({ cell }) => cell.row.original.courseId?.trim(),
    },
    {
      Header: "Title",
      accessor: "title",
    },
    {
      Header: "GE Areas",
      id: "geAreas",
      cell: ({ cell }) => {
        const ges = cell.row.original.generalEducation;
        if (!ges) return "";
        return ges
          .map((ge) => {
            const code = ge.geCode?.trim();
            const college = ge.geCollege?.trim();
            return college ? `${code} (${college})` : code;
          })
          .join(", ");
      },
    },
  ];

  return (
    <OurTable
      data={courses}
      columns={columns}
      testid={"CoursesInGEAreaTable"}
    />
  );
}
