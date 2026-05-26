import { useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import GEAreaSearchForm from "main/components/GEAreas/GEAreaSearchForm";
import CoursesInGEAreaTable from "main/components/GEAreas/CoursesInGEAreaTable";
import { useBackendMutation } from "main/utils/useBackend";

export default function GeneralEducationSearchPage() {
  const [courses, setCourses] = useState([]);

  const objectToAxiosParams = (query) => ({
    url: "/api/public/primariesge",
    params: {
      qtr: query.quarter,
      area: query.area,
    },
  });

  const onSuccess = (data) => {
    setCourses(data);
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [],
  );

  async function fetchGECourses(_event, query) {
    mutation.mutate(query);
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h5>UCSB GE Search</h5>
        <GEAreaSearchForm fetchJSON={fetchGECourses} />
        <CoursesInGEAreaTable courses={courses} />
      </div>
    </BasicLayout>
  );
}
