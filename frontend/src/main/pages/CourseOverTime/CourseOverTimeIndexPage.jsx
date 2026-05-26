import { useMemo, useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CourseOverTimeSearchForm from "main/components/BasicCourseSearch/CourseOverTimeSearchForm";
import { useBackendMutation } from "main/utils/useBackend";
import SectionsTable from "main/components/Sections/SectionsTable";
import { convertedSectionsToPrimaryRows } from "main/utils/convertedSectionsToPrimaryRows";

export default function CourseOverTimeIndexPage() {
  // Stryker disable next-line all : Can't test state because hook is internal
  const [courseJSON, setCourseJSON] = useState([]);

  const objectToAxiosParams = (query) => ({
    url: "/api/public/courseovertime/search",
    params: {
      startQtr: query.startQuarter,
      endQtr: query.endQuarter,
      subjectArea: query.subject,
      courseNumber: query.courseNumber + query.courseSuf,
    },
  });

  const onSuccess = (courses) => {
    setCourseJSON(courses);
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [],
  );

  async function fetchCourseOverTimeJSON(_event, query) {
    mutation.mutate(query);
  }

  const sectionsForTable = useMemo(
    () => convertedSectionsToPrimaryRows(courseJSON),
    [courseJSON],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        <h5>UCSB Course History Search</h5>
        <CourseOverTimeSearchForm fetchJSON={fetchCourseOverTimeJSON} />
        <SectionsTable sections={sectionsForTable} schedules={[]} />
      </div>
    </BasicLayout>
  );
}
