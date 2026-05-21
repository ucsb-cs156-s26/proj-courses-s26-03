import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { enrollmentHistoryFixtures } from "fixtures/enrollmentHistoryFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import EnrollmentHistoryGraph from "main/components/EnrollmentHistory/EnrollmentHistoryGraph";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

vi.mock("recharts", async () => {
  const OriginalModule = await vi.importActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ height, children }) => (
      <OriginalModule.ResponsiveContainer width={800} height={height}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => vi.fn(),
}));

const queryClient = new QueryClient();

const renderGraph = (props) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EnrollmentHistoryGraph {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("EnrollmentHistoryGraph", () => {
  test("renders empty div when enrollmentHistory is empty", () => {
    renderGraph({ enrollmentHistory: [] });
    expect(
      screen.getByTestId("enrollment-history-graph-empty"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("enrollment-history-graph"),
    ).not.toBeInTheDocument();
  });

  test("renders graph container when data is provided", () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.fiveQuartersOneSection,
    });
    expect(screen.getByTestId("enrollment-history-graph")).toBeInTheDocument();
  });

  test("renders Enrollment History heading", () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.fiveQuartersOneSection,
    });
    expect(screen.getByText("Enrollment History")).toBeInTheDocument();
  });

  test("renders a line in the chart for a single-section course", async () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.fiveQuartersOneSection,
    });
    const container = screen.getByTestId("enrollment-history-graph");
    await waitFor(() => {
      const lines = container.querySelectorAll(".recharts-line");
      expect(lines.length).toBe(1);
    });
  });

  test("renders two lines for a multi-section course", async () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.threeQuartersTwoSections,
    });
    const container = screen.getByTestId("enrollment-history-graph");
    await waitFor(() => {
      const lines = container.querySelectorAll(".recharts-line");
      expect(lines.length).toBe(2);
    });
  });

  test("section labels appear in the legend for single-section data", async () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.fiveQuartersOneSection,
    });
    await waitFor(() => {
      expect(screen.getByText("0100")).toBeInTheDocument();
    });
  });

  test("both section labels appear in the legend for multi-section data", async () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.threeQuartersTwoSections,
    });
    await waitFor(() => {
      expect(screen.getByText("0100")).toBeInTheDocument();
      expect(screen.getByText("0200")).toBeInTheDocument();
    });
  });
});
