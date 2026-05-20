import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import CoursesInGEAreaTable from "main/components/GEAreas/CoursesInGEAreaTable";
import primaryFixtures from "fixtures/primaryFixtures";

describe("CoursesInGEAreaTable tests", () => {
  const queryClient = new QueryClient();
  const testId = "CoursesInGEAreaTable";
  const expectedHeaders = [
    "Quarter",
    "Course ID",
    "Title",
    "Units",
    "GE Areas",
  ];

  test("renders empty table with correct headers", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesInGEAreaTable courses={[]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-courseId`),
    ).not.toBeInTheDocument();
  });

  test("renders course data with correct content", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesInGEAreaTable courses={primaryFixtures.f24_math_lowerDiv} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-courseId`),
    ).toHaveTextContent("MATH 2A");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-quarter`),
    ).toHaveTextContent("F24");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-title`),
    ).toHaveTextContent("CALC W/ ALG & TRIG");
  });

  test("renders multiple GE areas comma-joined in GE Areas column", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesInGEAreaTable courses={primaryFixtures.f24_math_lowerDiv} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // f24_math_lowerDiv[0] (MATH 2A) has geCode "C  " (L&S) and "QNT" (L&S)
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-geAreas`),
    ).toHaveTextContent("C (L&S), QNT (L&S)");
  });

  test("renders empty GE Areas cell for courses with no GE data", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesInGEAreaTable
            courses={primaryFixtures.singleLectureSectionWithNoDiscussion}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-geAreas`),
    ).toHaveTextContent("");
  });
});
