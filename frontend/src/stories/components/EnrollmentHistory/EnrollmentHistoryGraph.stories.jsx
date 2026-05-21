import React from "react";

import EnrollmentHistoryGraph from "main/components/EnrollmentHistory/EnrollmentHistoryGraph";
import { enrollmentHistoryFixtures } from "fixtures/enrollmentHistoryFixtures";

export default {
  title: "components/EnrollmentHistory/EnrollmentHistoryGraph",
  component: EnrollmentHistoryGraph,
};

const Template = (args) => <EnrollmentHistoryGraph {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  enrollmentHistory: [],
};

export const FiveQuartersOneSection = Template.bind({});
FiveQuartersOneSection.args = {
  enrollmentHistory: enrollmentHistoryFixtures.fiveQuartersOneSection,
};

export const ThreeQuartersTwoSections = Template.bind({});
ThreeQuartersTwoSections.args = {
  enrollmentHistory: enrollmentHistoryFixtures.threeQuartersTwoSections,
};

export const ThreeQuartersWithSuffix = Template.bind({});
ThreeQuartersWithSuffix.args = {
  enrollmentHistory: enrollmentHistoryFixtures.threeQuartersWithSuffix,
};
