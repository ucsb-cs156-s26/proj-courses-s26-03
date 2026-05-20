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
      Header: "Units",
      accessor: "unitsFixed",
    },
    {
      Header: "GE Areas",
      id: "geAreas",
      cell: ({ cell }) =>
        (cell.row.original.generalEducation || [])
          .map((ge) => {
            const code = ge.geCode?.trim();
            const college = ge.geCollege?.trim();
            return college ? `${code} (${college})` : code;
          })
          .join(", "),
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
