import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import GeneralEducationSearchPage from "main/pages/GeneralEducation/Search/GeneralEducationSearchPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import primaryFixtures from "fixtures/primaryFixtures";

vi.mock("main/utils/currentUser", () => ({
  useCurrentUser: () => ({
    data: { loggedIn: true, root: { user: { email: "test@example.com" } } },
  }),
  useLogout: () => ({ mutate: vi.fn() }),
  hasRole: (_user, _role) => false,
}));

// Mock the form to avoid localStorage/jsdom incompatibility in tests
vi.mock("main/components/GEAreas/GEAreaSearchForm", () => ({
  default: ({ fetchJSON }) => (
    <button
      data-testid="mock-ge-search-submit"
      onClick={(e) => fetchJSON(e, { quarter: "20224", area: "C" })}
    >
      Submit
    </button>
  ),
}));

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("GeneralEducationSearchPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing and shows the heading", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GeneralEducationSearchPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("UCSB GE Search")).toBeInTheDocument();
    expect(screen.getByTestId("mock-ge-search-submit")).toBeInTheDocument();
  });

  test("calls primariesge API with correct params when form is submitted", async () => {
    axiosMock
      .onGet("/api/public/primariesge")
      .reply(200, primaryFixtures.f24_math_lowerDiv);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GeneralEducationSearchPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    userEvent.click(screen.getByTestId("mock-ge-search-submit"));

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const geCall = axiosMock.history.get.find((r) =>
      r.url.includes("primariesge"),
    );
    expect(geCall).toBeDefined();
    expect(geCall.params).toEqual({ qtr: "20224", area: "C" });
  });

  test("displays course results in table after search", async () => {
    axiosMock
      .onGet("/api/public/primariesge")
      .reply(200, primaryFixtures.f24_math_lowerDiv);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GeneralEducationSearchPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    userEvent.click(screen.getByTestId("mock-ge-search-submit"));

    await waitFor(() => {
      expect(
        screen.getByTestId("CoursesInGEAreaTable-cell-row-0-col-courseId"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId("CoursesInGEAreaTable-cell-row-0-col-courseId"),
    ).toHaveTextContent("MATH 2A");
  });

  test("displays GE areas as comma-joined codes for courses with multiple GEs", async () => {
    axiosMock
      .onGet("/api/public/primariesge")
      .reply(200, primaryFixtures.f24_math_lowerDiv);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GeneralEducationSearchPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    userEvent.click(screen.getByTestId("mock-ge-search-submit"));

    await waitFor(() => {
      expect(
        screen.getByTestId("CoursesInGEAreaTable-cell-row-1-col-geAreas"),
      ).toBeInTheDocument();
    });

    // f24_math_lowerDiv[1] (MATH 3A) has QNT first, then C
    expect(
      screen.getByTestId("CoursesInGEAreaTable-cell-row-1-col-geAreas"),
    ).toHaveTextContent("QNT (L&S), C (L&S)");
  });
});
