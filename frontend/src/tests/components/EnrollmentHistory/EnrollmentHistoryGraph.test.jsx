import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  enrollmentHistoryFixtures,
  passTimes2025Spring,
} from "fixtures/enrollmentHistoryFixtures";
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
      screen.queryByTestId("enrollment-history-graphs"),
    ).not.toBeInTheDocument();
  });

  test("renders the graphs container when data is provided", () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
    });
    expect(screen.getByTestId("enrollment-history-graphs")).toBeInTheDocument();
  });

  test("renders one chart for a single section-quarter group", async () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
    });
    await waitFor(() => {
      expect(screen.getAllByTestId("enrollment-history-graph")).toHaveLength(1);
    });
  });

  test("renders two charts for two section-quarter groups", async () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.tenSnapshotsTwoSections,
    });
    await waitFor(() => {
      expect(screen.getAllByTestId("enrollment-history-graph")).toHaveLength(2);
    });
  });

  test("chart title includes section and formatted quarter", () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
    });
    expect(screen.getByText("Section 0100 - S25")).toBeInTheDocument();
  });

  test("renders reference lines when passTimes are provided", async () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
      passTimes: passTimes2025Spring,
    });
    const container = screen.getByTestId("enrollment-history-graphs");
    await waitFor(() => {
      const refLines = container.querySelectorAll(".recharts-reference-line");
      expect(refLines.length).toBe(3);
    });
  });

  test("renders no reference lines when passTimes is not provided", async () => {
    renderGraph({
      enrollmentHistory: enrollmentHistoryFixtures.fiveSnapshotsSingleSection,
    });
    const container = screen.getByTestId("enrollment-history-graphs");
    await waitFor(() => {
      const refLines = container.querySelectorAll(".recharts-reference-line");
      expect(refLines.length).toBe(0);
    });
  });
});
