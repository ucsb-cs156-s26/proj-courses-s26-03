import React from "react";

import EnrollmentHistoryGraph from "main/components/EnrollmentHistory/EnrollmentHistoryGraph";
import {
  enrollmentHistoryFixtures,
  passTimes2025Spring,
  passTimes2024Spring,
} from "fixtures/enrollmentHistoryFixtures";

export default {
  title: "components/EnrollmentHistory/EnrollmentHistoryGraph",
  component: EnrollmentHistoryGraph,
};

const Template = (args) => <EnrollmentHistoryGraph {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  enrollmentHistory: [],
};

export const SingleSectionNoPassTimes = Template.bind({});
SingleSectionNoPassTimes.args = {
  enrollmentHistory: enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
};

export const SingleSectionWithPassTimes = Template.bind({});
SingleSectionWithPassTimes.args = {
  enrollmentHistory: enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
  passTimes: passTimes2025Spring,
};

export const TwoSectionsWithPassTimes = Template.bind({});
TwoSectionsWithPassTimes.args = {
  enrollmentHistory: enrollmentHistoryFixtures.tenSnapshotsTwoSections,
  passTimes: passTimes2025Spring,
};

export const PastQuarterWithPassTimes = Template.bind({});
PastQuarterWithPassTimes.args = {
  enrollmentHistory: enrollmentHistoryFixtures.fiveSnapshotsPastQuarter,
  passTimes: passTimes2024Spring,
};
