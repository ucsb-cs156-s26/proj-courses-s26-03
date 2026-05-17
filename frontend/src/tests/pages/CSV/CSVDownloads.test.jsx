import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import CSVDownloadsPage from "main/pages/CSV/CSVDownloadsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

describe("CSVDownloadsPage tests", () => {
  const originalLocation = window.location;
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    localStorage.clear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, {
      startQtrYYYYQ: "20241",
      endQtrYYYYQ: "20242",
    });
    axiosMock.onGet("/api/UCSBSubjects/all").reply(200, [
      {
        subjectCode: "CMPSC",
        subjectTranslation: "Computer Science",
      },
      {
        subjectCode: "MATH",
        subjectTranslation: "Mathematics",
      },
    ]);
  });

  afterEach(() => {
    delete window.location;
    window.location = originalLocation;
  });

  const renderPage = () => {
    const queryClient = new QueryClient();

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

  test("renders correctly", async () => {
    renderPage();
    expect(await screen.findByText("CSV Downloads")).toBeInTheDocument();
  });

  test("submitting by-quarter form downloads quarter CSV", async () => {
    const assignMock = mockLocationAssign();
    renderPage();

    const quarterSelect = await screen.findAllByLabelText("Quarter");
    const byQuarterButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[0];
    const byQuarterForm = byQuarterButton.closest("form");

    fireEvent.change(quarterSelect[0], { target: { value: "20242" } });
    fireEvent.submit(byQuarterForm);

    expect(assignMock).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith(
      "/api/courses/csv/quarter?yyyyq=20242",
    );
  });

  test("submitting by-quarter-and-subject form includes level and checkboxes", async () => {
    const assignMock = mockLocationAssign();
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const quarterSelects = await screen.findAllByLabelText("Quarter");
    const subjectSelect = await screen.findByLabelText("Subject Area");
    const levelSelect = await screen.findByRole("combobox", { name: /level/i });

    const omitSectionsCheckbox = await screen.findByTestId(
      "CSVDownloads.OmitSections-checkbox",
    );
    const withTimeLocationsCheckbox = await screen.findByTestId(
      "CSVDownloads.WithTimeLocations-checkbox",
    );

    const allDownloadButtons = screen.getAllByRole("button", {
      name: "Download CSV",
    });
    const byQuarterAndSubjectButton = allDownloadButtons[1];
    const byQuarterAndSubjectForm = byQuarterAndSubjectButton.closest("form");

    fireEvent.change(quarterSelects[1], { target: { value: "20242" } });
    fireEvent.change(subjectSelect, { target: { value: "CMPSC" } });

    fireEvent.change(levelSelect, { target: { value: "G" } });

    expect(omitSectionsCheckbox).toBeChecked();
    expect(withTimeLocationsCheckbox).toBeChecked();

    fireEvent.click(omitSectionsCheckbox);
    fireEvent.click(withTimeLocationsCheckbox);

    expect(omitSectionsCheckbox).not.toBeChecked();
    expect(withTimeLocationsCheckbox).not.toBeChecked();

    expect(byQuarterAndSubjectButton).not.toBeDisabled();
    fireEvent.submit(byQuarterAndSubjectForm);

    expect(assignMock).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=CMPSC&level=G&omitSections=false&withTimeLocations=false",
    );
  });

  test("submitting by-quarter-and-subject form cycles through all remaining coverage branches", async () => {
    const assignMock = mockLocationAssign();
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const quarterSelects = await screen.findAllByLabelText("Quarter");
    const subjectSelect = await screen.findByLabelText("Subject Area");
    const levelSelect = await screen.findByRole("combobox", { name: /level/i });

    const omitSectionsCheckbox = await screen.findByTestId(
      "CSVDownloads.OmitSections-checkbox",
    );

    const allDownloadButtons = screen.getAllByRole("button", {
      name: "Download CSV",
    });
    const byQuarterAndSubjectButton = allDownloadButtons[1];
    const byQuarterAndSubjectForm = byQuarterAndSubjectButton.closest("form");

    // Cycle 1: Option "A" maps to empty level parameter string value
    fireEvent.change(quarterSelects[1], { target: { value: "20242" } });
    fireEvent.change(subjectSelect, { target: { value: "CMPSC" } });
    fireEvent.change(levelSelect, { target: { value: "A" } });
    fireEvent.submit(byQuarterAndSubjectForm);
    expect(assignMock).toHaveBeenLastCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=CMPSC&level=&omitSections=true&withTimeLocations=true",
    );

    // Cycle 2: Explicit transition to option "U" with a checkbox flipped off
    fireEvent.click(omitSectionsCheckbox); // sets false
    fireEvent.change(levelSelect, { target: { value: "U" } });
    fireEvent.submit(byQuarterAndSubjectForm);
    expect(assignMock).toHaveBeenLastCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=CMPSC&level=U&omitSections=false&withTimeLocations=true",
    );

    // Cycle 3: Fire an empty string directly into selection state to catch base/blank condition fallbacks
    fireEvent.change(levelSelect, { target: { value: "" } });
    fireEvent.submit(byQuarterAndSubjectForm);
    expect(assignMock).toHaveBeenLastCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=CMPSC&level=&omitSections=false&withTimeLocations=true",
    );
  });

  test("initializes state from localStorage correctly to hit fallback branches", async () => {
    // Pre-populate local storage so the ternary operators hit the 'false' and alternate string conditions
    localStorage.setItem("CSVDownloads.Quarter", "20241");
    localStorage.setItem("CSVDownloads.SubjectArea", "MATH");
    localStorage.setItem("CSVDownloads.Level", "G");
    localStorage.setItem("CSVDownloads.OmitSections", "false");
    localStorage.setItem("CSVDownloads.WithTimeLocations", "false");

    renderPage();

    expect(await screen.findByText("CSV Downloads")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    // Checkboxes should initialize as unchecked due to local storage 'false' forcing the branch
    const omitSectionsCheckbox = await screen.findByTestId(
      "CSVDownloads.OmitSections-checkbox",
    );
    expect(omitSectionsCheckbox).not.toBeChecked();
  });

  test("falls back to default quarters when systemInfo lacks them", async () => {
    // Override the beforeEach mock to return empty system info, forcing the "20221" fallback branches
    axiosMock.onGet("/api/systemInfo").reply(200, {});

    renderPage();
    expect(await screen.findByText("CSV Downloads")).toBeInTheDocument();
  });

  test("does not trigger download if subjectArea is empty (implicit else branch)", async () => {
    const assignMock = mockLocationAssign();

    // Override the subjects mock to return empty so subjectArea remains ""
    axiosMock.onGet("/api/UCSBSubjects/all").reply(200, []);

    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Download all UCSB classes by Quarter and Subject Area",
      }),
    );

    const allDownloadButtons = screen.getAllByRole("button", {
      name: "Download CSV",
    });

    const byQuarterAndSubjectButton = allDownloadButtons[1];
    const byQuarterAndSubjectForm = byQuarterAndSubjectButton.closest("form");

    // Force submit the form programmatically to bypass the disabled button state
    fireEvent.submit(byQuarterAndSubjectForm);

    // Assert that the 'if (subjectArea)' block stopped the download
    expect(assignMock).not.toHaveBeenCalled();
  });
});
