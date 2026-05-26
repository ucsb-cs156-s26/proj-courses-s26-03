import React from "react";
import CoursesInGEAreaTable from "main/components/GEAreas/CoursesInGEAreaTable";
import primaryFixtures from "fixtures/primaryFixtures";

export default {
  title: "components/GEAreas/CoursesInGEAreaTable",
  component: CoursesInGEAreaTable,
};

const Template = (args) => <CoursesInGEAreaTable {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  courses: [],
};

export const WithCourses = Template.bind({});
WithCourses.args = {
  courses: primaryFixtures.f24_math_lowerDiv,
};
