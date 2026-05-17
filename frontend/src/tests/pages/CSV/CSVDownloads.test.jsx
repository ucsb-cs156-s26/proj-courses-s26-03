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

    // Changed label query to match SingleQuarterDropdown component's label
    const quarterSelect = await screen.findAllByLabelText("Quarter");
    const byQuarterButton = screen.getAllByRole("button", {
      name: "Download CSV",
    })[0];
    const byQuarterForm = byQuarterButton.closest("form");

    // Switching value to 20242 to verify selection handling works correctly
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

    // Changed label query to match SingleQuarterDropdown component's label
    const quarterSelects = await screen.findAllByLabelText("Quarter");
    const subjectSelect = await screen.findByLabelText("Subject Area");
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

    // Switching value to 20242 to verify selection handling works correctly
    fireEvent.change(quarterSelects[1], { target: { value: "20242" } });
    fireEvent.change(subjectSelect, { target: { value: "CMPSC" } });
    expect(omitSectionsCheckbox).toBeChecked();
    expect(withTimeLocationsCheckbox).toBeChecked();

    fireEvent.click(withTimeLocationsCheckbox); // set false
    expect(withTimeLocationsCheckbox).not.toBeChecked();

    expect(byQuarterAndSubjectButton).not.toBeDisabled();
    fireEvent.submit(byQuarterAndSubjectForm);

    expect(assignMock).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith(
      "/api/courses/csv/byQuarterAndSubjectArea?yyyyq=20242&subjectArea=CMPSC&level=U&omitSections=true&withTimeLocations=false",
    );
  });
});
