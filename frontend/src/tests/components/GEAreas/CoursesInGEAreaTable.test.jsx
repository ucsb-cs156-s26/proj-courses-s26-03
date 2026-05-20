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
    // Use .textContent (not toHaveTextContent) to verify trimming removes whitespace exactly
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-geAreas`).textContent,
    ).toBe("C (L&S), QNT (L&S)");
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

  test("renders GE area without college when geCollege is null", () => {
    const courses = [
      {
        quarter: "20244",
        courseId: "TEST 1A",
        title: "Test Course",
        generalEducation: [{ geCode: "A1", geCollege: null }],
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesInGEAreaTable courses={courses} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-geAreas`).textContent,
    ).toBe("A1");
  });

  test("renders empty GE Areas when generalEducation is null", () => {
    const courses = [
      {
        quarter: "20244",
        courseId: "TEST 2A",
        title: "Test Course",
        generalEducation: null,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesInGEAreaTable courses={courses} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-geAreas`),
    ).toHaveTextContent("");
  });

  test("renders without crash when courseId is null", () => {
    const courses = [
      {
        quarter: "20244",
        courseId: null,
        title: "Test Course",
        generalEducation: [],
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesInGEAreaTable courses={courses} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-courseId`),
    ).toBeInTheDocument();
  });

  test("renders without crash when geCode is null", () => {
    const courses = [
      {
        quarter: "20244",
        courseId: "TEST 3A",
        title: "Test Course",
        generalEducation: [{ geCode: null, geCollege: "L&S" }],
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesInGEAreaTable courses={courses} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-geAreas`),
    ).toBeInTheDocument();
  });

  test("renders unitsFixed value in Units column", () => {
    const courses = [
      {
        quarter: "20244",
        courseId: "TEST 4A",
        title: "Test Course",
        unitsFixed: 4,
        generalEducation: [],
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesInGEAreaTable courses={courses} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-unitsFixed`),
    ).toHaveTextContent("4");
  });
});
