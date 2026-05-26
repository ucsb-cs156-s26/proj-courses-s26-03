import React from "react";

import CSVDownloadsPage from "main/pages/CSV/CSVDownloadsPage";

import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbSubjectsFixtures } from "fixtures/ucsbSubjectsFixtures";

import { http, HttpResponse } from "msw";

export default {
  title: "pages/CSV/CSVDownloadsPage",
  component: CSVDownloadsPage,
};

const Template = () => <CSVDownloadsPage />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingBoth, {
        status: 200,
      });
    }),
    http.get("/api/currentUser", () => {
      return HttpResponse.status(403); // returns 403 when not logged in
    }),
    http.get("/api/UCSBSubjects/all", () => {
      return HttpResponse.json(ucsbSubjectsFixtures.threeSubjects, {
        status: 200,
      });
    }),
  ],
};
