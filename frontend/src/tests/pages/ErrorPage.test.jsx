import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import ErrorPage from "main/pages/ErrorPage";
import { useBackend } from "main/utils/useBackend";

vi.mock("main/utils/useBackend");

describe("ErrorPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ErrorPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders the heading and lead text", async () => {
    useBackend.mockReturnValue({ data: null });
    renderPage();
    expect(await screen.findByTestId("error-page-heading")).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/),
    ).toBeInTheDocument();
  });

  test("renders return home link", async () => {
    useBackend.mockReturnValue({ data: null });
    renderPage();
    expect(await screen.findByTestId("return-home-link")).toBeInTheDocument();
  });

  test("shows no error details when data is null", async () => {
    useBackend.mockReturnValue({ data: null });
    renderPage();
    await screen.findByTestId("error-page-heading");
    expect(screen.queryByTestId("error-status")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-error")).not.toBeInTheDocument();
  });

  test("displays error details when data has error info", async () => {
    useBackend.mockReturnValue({
      data: {
        status: 500,
        error: "Internal Server Error",
        message: "Something went wrong",
        path: "/api/test",
      },
    });

    renderPage();

    expect(await screen.findByTestId("error-status")).toHaveTextContent(
      "Status: 500",
    );
    expect(screen.getByTestId("error-error")).toHaveTextContent(
      "Error: Internal Server Error",
    );
    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "Message: Something went wrong",
    );
    expect(screen.getByTestId("error-path")).toHaveTextContent(
      "Path: /api/test",
    );
  });

  test("shows toggle button when trace is present", async () => {
    useBackend.mockReturnValue({
      data: {
        status: 500,
        error: "Internal Server Error",
        message: "Something went wrong",
        path: "/api/test",
        trace:
          "java.lang.RuntimeException: Something went wrong\n\tat Foo.bar(Foo.java:42)",
      },
    });

    renderPage();

    expect(
      await screen.findByTestId("toggle-trace-button"),
    ).toBeInTheDocument();
  });

  test("does not show toggle button when trace is absent", async () => {
    useBackend.mockReturnValue({
      data: {
        status: 404,
        error: "Not Found",
        message: "Resource not found",
        path: "/api/missing",
      },
    });

    renderPage();

    await screen.findByTestId("error-status");
    expect(screen.queryByTestId("toggle-trace-button")).not.toBeInTheDocument();
  });

  test("clicking toggle button shows and hides technical details", async () => {
    useBackend.mockReturnValue({
      data: {
        status: 500,
        error: "Internal Server Error",
        message: "Something went wrong",
        path: "/api/test",
        trace:
          "java.lang.RuntimeException: Something went wrong\n\tat Foo.bar(Foo.java:42)",
      },
    });

    renderPage();

    const toggleButton = await screen.findByTestId("toggle-trace-button");
    expect(toggleButton).toHaveTextContent("Show Technical Details");

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent("Hide Technical Details");

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent("Show Technical Details");
  });

  test("trace pre element has correct inline styles", async () => {
    useBackend.mockReturnValue({
      data: {
        status: 500,
        error: "Internal Server Error",
        message: "Something went wrong",
        path: "/api/test",
        trace:
          "java.lang.RuntimeException: Something went wrong\n\tat Foo.bar(Foo.java:42)",
      },
    });

    renderPage();

    fireEvent.click(await screen.findByTestId("toggle-trace-button"));

    const pre = screen.getByTestId("trace-section").querySelector("pre");
    expect(pre).toHaveStyle({
      fontSize: "0.8em",
      maxHeight: "400px",
      overflow: "auto",
    });
  });

  test("calls useBackend with correct query key and axios params", async () => {
    useBackend.mockImplementationOnce((queryKey, axiosParams, initialData) => {
      expect(queryKey).toEqual(["/api/currentError"]);
      expect(axiosParams).toEqual({ method: "GET", url: "/api/currentError" });
      expect(initialData).toBeNull();
      return { data: null };
    });

    renderPage();

    expect(useBackend).toHaveBeenCalledWith(
      ["/api/currentError"],
      { method: "GET", url: "/api/currentError" },
      null,
    );
  });
});
