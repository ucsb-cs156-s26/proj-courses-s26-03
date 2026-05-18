import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

import CSVDownloadsPage from "main/pages/CSV/CSVDownloadsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import * as systemInfoModule from "main/utils/systemInfo";
import * as useBackendModule from "main/utils/useBackend";

describe("CSVDownloadsPage tests", () => {
  const originalLocation = window.location;
  const axiosMock = new AxiosMockAdapter(axios);

  const defaultSubjects = [
    { subjectCode: "CMPSC", subjectTranslation: "Computer Science" },
    { subjectCode: "MATH", subjectTranslation: "Mathematics" },
  ];

  const setupAxiosMocks = ({
    subjects = defaultSubjects,
    systemInfo = { startQtrYYYYQ: "20241", endQtrYYYYQ: "20242" },
  } = {}) => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfo);
    axiosMock.onGet("/api/UCSBSubjects/all").reply(200, subjects);
  };

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CSVDownloadsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const mockLocationAssign = () => {
    const assignMock = vi.fn();
    delete window.location;
    window.location = Object.assign(new URL("http://localhost:3000"), {
      assign: assignMock,
    });
    return assignMock;
  };

  beforeEach(() => {
    localStorage.clear();
    setupAxiosMocks();
  });

  afterEach(() => {
    delete window.location;
    window.location = originalLocation;
    vi.restoreAllMocks();
  });

  test("renders correctly", async () => {
    renderPage();
    expect(await screen.findByText("CSV Downloads")).toBeInTheDocument();
  });

  test("calls useBackend with the correct request and cache key", async () => {
    const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");
    renderPage();
    expect(await screen.findByText("CSV Downloads")).toBeInTheDocument();

    expect(useBackendSpy).toHaveBeenCalledWith(
      ["/api/UCSBSubjects/all"],
      { method: "GET", url: "/api/UCSBSubjects/all" },
      [],
    );
  });

  test("does not crash when systemInfo is null (optional chaining)", async () => {
    const systemInfoSpy = vi.spyOn(systemInfoModule, "useSystemInfo");
    systemInfoSpy.mockReturnValue({ data: null });

    renderPage();
    expect(await screen.findByText("CSV Downloads")).toBeInTheDocument();
  });

  test("reads expected localStorage keys on initial render", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    renderPage();
    expect(await screen.findByText("CSV Downloads")).toBeInTheDocument();

    expect(getItemSpy).toHaveBeenCalledWith("CSVDownloads.Quarter");
    expect(getItemSpy).toHaveBeenCalledWith("CSVDownloads.SubjectArea");
    expect(getItemSpy).toHaveBeenCalledWith("CSVDownloads.Level");
  });

  test("downloads by-quarter CSV", async () => {
    const assignMock = mockLocationAssign();
    renderPage();

    const quarterSelect = await screen.findByTestId("CSVDownloads.Quarter");
    fireEvent.change(quarterSelect, { target: { value: "20242" } });

    const byQuarterButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[0];
    fireEvent.submit(byQuarterButton.closest("form"));

    expect(assignMock).toHaveBeenCalledWith(
      "/api/courses/csv/quarter?yyyyq=20242",
    );
  });

  test("by-quarter uses default quarter when unchanged", async () => {
    const assignMock = mockLocationAssign();
    vi.spyOn(systemInfoModule, "useSystemInfo").mockReturnValue({
      data: { startQtrYYYYQ: "20241", endQtrYYYYQ: "20242" },
    });
    renderPage();

    const quarterSelect = await screen.findByTestId("CSVDownloads.Quarter");

    const byQuarterButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[0];
    fireEvent.submit(byQuarterButton.closest("form"));

    expect(assignMock).toHaveBeenCalledWith(
      `/api/courses/csv/quarter?yyyyq=${quarterSelect.value}`,
    );
  });

  test("by-quarter-and-subject default URL uses level=U when not changed", async () => {
    const assignMock = mockLocationAssign();
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const quarterSelect = await screen.findByTestId(
      "CSVDownloads.QuarterBySubjectArea",
    );
    const subjectSelect = await screen.findByLabelText("Subject Area");

    fireEvent.change(quarterSelect, { target: { value: "20242" } });
    fireEvent.change(subjectSelect, { target: { value: "CMPSC" } });

    const byQuarterAndSubjectButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[1];
    fireEvent.submit(byQuarterAndSubjectButton.closest("form"));

    expect(assignMock).toHaveBeenCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=CMPSC&level=U&omitSections=true&withTimeLocations=true",
    );
  });

  test("saves quarter to localStorage from first quarter dropdown", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    renderPage();

    const quarterSelect = await screen.findByTestId("CSVDownloads.Quarter");
    fireEvent.change(quarterSelect, { target: { value: "20241" } });

    expect(setItemSpy).toHaveBeenCalledWith("CSVDownloads.Quarter", "20241");
  });

  test("by-quarter Download CSV button is enabled when quarter is present", async () => {
    renderPage();
    const byQuarterButton = (
      await screen.findAllByRole("button", {
        name: "Download CSV",
      })
    )[0];
    expect(byQuarterButton).not.toBeDisabled();
  });

  test("initializes quarter from localStorage (kills quarter init mutants)", async () => {
    localStorage.setItem("CSVDownloads.Quarter", "20241");
    renderPage();

    const quarterSelect = await screen.findByTestId("CSVDownloads.Quarter");
    expect(quarterSelect).toHaveValue("20241");
  });

  test("by-quarter uses localStorage quarter when unchanged", async () => {
    localStorage.setItem("CSVDownloads.Quarter", "20241");
    const assignMock = mockLocationAssign();
    vi.spyOn(systemInfoModule, "useSystemInfo").mockReturnValue({
      data: { startQtrYYYYQ: "20241", endQtrYYYYQ: "20242" },
    });
    renderPage();

    const quarterSelect = await screen.findByTestId("CSVDownloads.Quarter");
    expect(quarterSelect).toHaveValue("20241");

    const byQuarterButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[0];
    fireEvent.submit(byQuarterButton.closest("form"));

    expect(assignMock).toHaveBeenCalledWith(
      `/api/courses/csv/quarter?yyyyq=${quarterSelect.value}`,
    );
  });

  test("initializes level from localStorage (kills level init mutants)", async () => {
    localStorage.setItem("CSVDownloads.Level", "G");
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const levelSelect = await screen.findByLabelText("Level");
    expect(levelSelect).toHaveValue("G");
  });

  test("by-quarter-and-subject uses localStorage level when unchanged", async () => {
    localStorage.setItem("CSVDownloads.Level", "G");
    const assignMock = mockLocationAssign();
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const quarterSelect = await screen.findByTestId(
      "CSVDownloads.QuarterBySubjectArea",
    );
    const subjectSelect = await screen.findByLabelText("Subject Area");

    fireEvent.change(quarterSelect, { target: { value: "20242" } });
    fireEvent.change(subjectSelect, { target: { value: "CMPSC" } });

    const byQuarterAndSubjectButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[1];
    fireEvent.submit(byQuarterAndSubjectButton.closest("form"));

    expect(assignMock).toHaveBeenCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=CMPSC&level=G&omitSections=true&withTimeLocations=true",
    );
  });

  test("initializes subject area from localStorage (not subjects[0])", async () => {
    localStorage.setItem("CSVDownloads.SubjectArea", "MATH");
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const subjectSelect = await screen.findByLabelText("Subject Area");
    expect(subjectSelect).toHaveValue("MATH");

    // Extra guard: ensure it isn't just defaulting to the first subject
    expect(subjectSelect).not.toHaveValue("CMPSC");
  });

  test("localStorage subject area is used in the download URL", async () => {
    localStorage.setItem("CSVDownloads.SubjectArea", "MATH");
    const assignMock = mockLocationAssign();
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const quarterSelect = await screen.findByTestId(
      "CSVDownloads.QuarterBySubjectArea",
    );
    fireEvent.change(quarterSelect, { target: { value: "20242" } });

    const byQuarterAndSubjectButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[1];
    fireEvent.submit(byQuarterAndSubjectButton.closest("form"));

    expect(assignMock).toHaveBeenCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=MATH&level=U&omitSections=true&withTimeLocations=true",
    );
  });

  test("by-quarter-and-subject: quarter dropdown writes both keys and controls disabled state", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const byQuarterAndSubjectButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[1];

    const quarterSelect = await screen.findByTestId(
      "CSVDownloads.QuarterBySubjectArea",
    );

    fireEvent.change(quarterSelect, { target: { value: "" } });
    expect(byQuarterAndSubjectButton).toBeDisabled();

    fireEvent.change(quarterSelect, { target: { value: "20242" } });
    expect(byQuarterAndSubjectButton).not.toBeDisabled();

    expect(setItemSpy).not.toHaveBeenCalledWith("", "20242");
    expect(setItemSpy).toHaveBeenCalledWith("CSVDownloads.Quarter", "20242");
    expect(setItemSpy).toHaveBeenCalledWith(
      "CSVDownloads.QuarterBySubjectArea",
      "20242",
    );
  });

  test("by-quarter-and-subject: level and checkboxes affect URL and write localStorage", async () => {
    const assignMock = mockLocationAssign();
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const quarterSelect = await screen.findByTestId(
      "CSVDownloads.QuarterBySubjectArea",
    );
    const subjectSelect = await screen.findByLabelText("Subject Area");
    const levelSelect = await screen.findByLabelText("Level");

    const omitSectionsCheckbox = await screen.findByTestId(
      "CSVDownloads.OmitSections-checkbox",
    );
    const withTimeLocationsCheckbox = await screen.findByTestId(
      "CSVDownloads.WithTimeLocations-checkbox",
    );

    fireEvent.change(quarterSelect, { target: { value: "20242" } });
    fireEvent.change(subjectSelect, { target: { value: "CMPSC" } });
    fireEvent.change(levelSelect, { target: { value: "G" } });
    expect(setItemSpy).toHaveBeenCalledWith("CSVDownloads.Level", "G");

    expect(omitSectionsCheckbox).toBeChecked();
    expect(withTimeLocationsCheckbox).toBeChecked();

    fireEvent.click(omitSectionsCheckbox);
    fireEvent.click(withTimeLocationsCheckbox);
    expect(setItemSpy).toHaveBeenCalledWith(
      "CSVDownloads.OmitSections",
      "false",
    );
    expect(setItemSpy).toHaveBeenCalledWith(
      "CSVDownloads.WithTimeLocations",
      "false",
    );

    const byQuarterAndSubjectButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[1];
    fireEvent.submit(byQuarterAndSubjectButton.closest("form"));

    expect(assignMock).toHaveBeenCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=CMPSC&level=G&omitSections=false&withTimeLocations=false",
    );
  });

  test("when omitSections/withTimeLocations are true, URL contains explicit 'true'", async () => {
    const assignMock = mockLocationAssign();
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const quarterSelect = await screen.findByTestId(
      "CSVDownloads.QuarterBySubjectArea",
    );
    const subjectSelect = await screen.findByLabelText("Subject Area");
    const levelSelect = await screen.findByLabelText("Level");

    fireEvent.change(quarterSelect, { target: { value: "20242" } });
    fireEvent.change(subjectSelect, { target: { value: "CMPSC" } });
    fireEvent.change(levelSelect, { target: { value: "G" } });

    const byQuarterAndSubjectButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[1];
    fireEvent.submit(byQuarterAndSubjectButton.closest("form"));

    expect(assignMock).toHaveBeenCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=CMPSC&level=G&omitSections=true&withTimeLocations=true",
    );
  });

  test("by-quarter-and-subject: does not download if subjectArea is empty", async () => {
    const assignMock = mockLocationAssign();
    setupAxiosMocks({ subjects: [] });
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    expect(screen.queryByLabelText("Subject Area")).not.toBeInTheDocument();

    const byQuarterAndSubjectButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[1];
    fireEvent.submit(byQuarterAndSubjectButton.closest("form"));
    expect(assignMock).not.toHaveBeenCalled();
  });

  test("does not render Subject Area dropdown when subjects is empty even if subjectArea is set", async () => {
    localStorage.setItem("CSVDownloads.SubjectArea", "MATH");
    setupAxiosMocks({ subjects: [] });
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    expect(screen.queryByLabelText("Subject Area")).not.toBeInTheDocument();
  });

  test("renders Quarter labels for both forms", async () => {
    renderPage();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const quarterLabels = screen.getAllByText("Quarter");
    expect(quarterLabels.length).toBeGreaterThanOrEqual(2);
  });

  test("checkbox defaults honor localStorage 'false' branches", async () => {
    localStorage.setItem("CSVDownloads.OmitSections", "false");
    localStorage.setItem("CSVDownloads.WithTimeLocations", "false");

    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const omitSectionsCheckbox = await screen.findByTestId(
      "CSVDownloads.OmitSections-checkbox",
    );
    const withTimeLocationsCheckbox = await screen.findByTestId(
      "CSVDownloads.WithTimeLocations-checkbox",
    );

    expect(omitSectionsCheckbox).not.toBeChecked();
    expect(withTimeLocationsCheckbox).not.toBeChecked();
  });

  test("systemInfo fallback quarters render when systemInfo is empty", async () => {
    setupAxiosMocks({ systemInfo: {} });
    renderPage();

    const quarterSelect = await screen.findByTestId("CSVDownloads.Quarter");
    expect(
      quarterSelect.querySelector('option[value="20221"]'),
    ).toBeInTheDocument();
  });
});
