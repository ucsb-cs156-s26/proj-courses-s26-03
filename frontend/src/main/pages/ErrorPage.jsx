import React, { useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Alert, Button, Collapse } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useBackend } from "main/utils/useBackend";

const ErrorPage = () => {
  const [showTrace, setShowTrace] = useState(false);

  const { data: errorInfo } = useBackend(
    ["/api/currentError"],
    { method: "GET", url: "/api/currentError" },
    null,
  );

  return (
    <BasicLayout>
      <div className="text-center mt-5">
        <h1 data-testid="error-page-heading">Something went wrong</h1>
        <p className="lead">
          We encountered an unexpected error. Please try again later.
        </p>

        {errorInfo && (
          <Alert variant="danger" className="text-start mt-3">
            {errorInfo.status && (
              <p data-testid="error-status">
                <strong>Status:</strong> {errorInfo.status}
              </p>
            )}
            {errorInfo.error && (
              <p data-testid="error-error">
                <strong>Error:</strong> {errorInfo.error}
              </p>
            )}
            {errorInfo.message && (
              <p data-testid="error-message">
                <strong>Message:</strong> {errorInfo.message}
              </p>
            )}
            {errorInfo.path && (
              <p data-testid="error-path">
                <strong>Path:</strong> {errorInfo.path}
              </p>
            )}
          </Alert>
        )}

        {errorInfo?.trace && (
          <div className="mt-3">
            <Button
              variant="secondary"
              onClick={() => setShowTrace(!showTrace)}
              data-testid="toggle-trace-button"
            >
              {showTrace ? "Hide" : "Show"} Technical Details
            </Button>
            <Collapse in={showTrace}>
              <div data-testid="trace-section">
                <pre
                  className="text-start bg-light p-3 border mt-2"
                  style={{
                    fontSize: "0.8em",
                    maxHeight: "400px",
                    overflow: "auto",
                  }}
                >
                  {errorInfo.trace}
                </pre>
              </div>
            </Collapse>
          </div>
        )}

        <div className="mt-4">
          <Link
            to="/"
            className="btn btn-primary"
            data-testid="return-home-link"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </BasicLayout>
  );
};

export default ErrorPage;
