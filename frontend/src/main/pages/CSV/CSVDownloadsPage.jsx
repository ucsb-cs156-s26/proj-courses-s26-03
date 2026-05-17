import React, { useEffect, useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import {
  Accordion,
  Form,
  Button,
  Container,
  Row,
  Col,
  FormCheck,
} from "react-bootstrap";
import { useSystemInfo } from "main/utils/systemInfo";
import { quarterRange } from "main/utils/quarterUtilities";
import { useBackend } from "main/utils/useBackend";
import SingleQuarterDropdown from "main/components/Quarters/SingleQuarterDropdown";
import SingleSubjectDropdown from "main/components/Subjects/SingleSubjectDropdown";
import SingleLevelDropdown from "main/components/Levels/SingleLevelDropdown";
import { allTheLevels } from "fixtures/levelsFixtures";

export default function CSVDownloadsPage() {
  const { data: systemInfo } = useSystemInfo();
  const startQtr = systemInfo?.startQtrYYYYQ || "20221";
  const endQtr = systemInfo?.endQtrYYYYQ || "20222";
  const quarters = quarterRange(startQtr, endQtr);

  const {
    data: subjects,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/UCSBSubjects/all"],
    { method: "GET", url: "/api/UCSBSubjects/all" },
    [],
  );

  const localQuarter = localStorage.getItem("CSVDownloads.Quarter");
  const localSubjectArea = localStorage.getItem("CSVDownloads.SubjectArea");
  const localLevel = localStorage.getItem("CSVDownloads.Level");
  const localOmitSections =
    localStorage.getItem("CSVDownloads.OmitSections") === "false"
      ? false
      : true;
  const localWithTimeLocations =
    localStorage.getItem("CSVDownloads.WithTimeLocations") === "false"
      ? false
      : true;

  const [quarter, setQuarter] = useState(
    localQuarter || quarters[quarters.length - 1].yyyyq,
  );
  const [subjectArea, setSubjectArea] = useState(localSubjectArea || "");
  const [level, setLevel] = useState(localLevel || "U");
  const [omitSections, setOmitSections] = useState(localOmitSections);
  const [withTimeLocations, setWithTimeLocations] = useState(
    localWithTimeLocations,
  );

  useEffect(() => {
    if (subjects.length > 0 && !subjectArea) {
      setSubjectArea(subjects[0].subjectCode);
    }
  }, [subjects, subjectArea]);

  const byQuarterUrl = `/api/courses/csv/quarter?yyyyq=${encodeURIComponent(quarter)}`;
  const byQuarterAndSubjectUrl =
    `/api/courses/csv/byQuarterAndSubjectArea?yyyyq=${encodeURIComponent(quarter)}` +
    `&subjectArea=${encodeURIComponent(subjectArea)}` +
    `&level=${encodeURIComponent(level)}` +
    `&omitSections=${encodeURIComponent(omitSections ? "true" : "false")}` +
    `&withTimeLocations=${encodeURIComponent(withTimeLocations ? "true" : "false")}`;

  const downloadCsv = (url) => {
    window.location.assign(url);
  };

  const handleQuarterSubmit = (e) => {
    e.preventDefault();
    downloadCsv(byQuarterUrl);
  };

  const handleQuarterSubjectSubmit = (e) => {
    e.preventDefault();
    if (subjectArea) downloadCsv(byQuarterAndSubjectUrl);
  };

  return (
    <BasicLayout>
      <div className="container mt-3">
        <h1>CSV Downloads</h1>

        <Accordion defaultActiveKey="by-quarter" className="mt-3">
          {/* Download by Quarter */}
          <Accordion.Item eventKey="by-quarter">
            <Accordion.Header>
              Download all UCSB classes by Quarter
            </Accordion.Header>
            <Accordion.Body>
              <Form onSubmit={handleQuarterSubmit}>
                <Container>
                  <Row className="mb-3">
                    <Col md="auto">
                      <SingleQuarterDropdown
                        quarters={quarters}
                        quarter={quarter}
                        setQuarter={setQuarter}
                        controlId={"CSVDownloads.Quarter"}
                        label={"Quarter"}
                        onChange={(e) =>
                          localStorage.setItem(
                            "CSVDownloads.Quarter",
                            e.target.value,
                          )
                        }
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md="auto">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={!quarter}
                      >
                        Download CSV
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Form>
            </Accordion.Body>
          </Accordion.Item>

          {/* Download by Quarter + Subject Area */}
          <Accordion.Item eventKey="by-quarter-and-subject-area">
            <Accordion.Header>
              Download all UCSB classes by Quarter and Subject Area
            </Accordion.Header>
            <Accordion.Body>
              <Form onSubmit={handleQuarterSubjectSubmit}>
                <Container>
                  <Row className="mb-3">
                    <Col md="auto">
                      <SingleQuarterDropdown
                        quarters={quarters}
                        quarter={quarter}
                        setQuarter={setQuarter}
                        controlId={"CSVDownloads.QuarterBySubjectArea"}
                        label={"Quarter"}
                        onChange={(e) => {
                          localStorage.setItem(
                            "CSVDownloads.Quarter",
                            e.target.value,
                          );
                          localStorage.setItem(
                            "CSVDownloads.QuarterBySubjectArea",
                            e.target.value,
                          );
                        }}
                      />
                    </Col>
                    <Col md="auto">
                      {subjects.length > 0 && subjectArea && (
                        <SingleSubjectDropdown
                          subjects={subjects}
                          subject={subjectArea}
                          setSubject={setSubjectArea}
                          controlId={"CSVDownloads.SubjectArea"}
                          label={"Subject Area"}
                        />
                      )}
                    </Col>
                    <Col md="auto">
                      <SingleLevelDropdown
                        levels={allTheLevels}
                        setLevel={setLevel}
                        controlId={"CSVDownloads.Level"}
                        label={"Level"}
                      />
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md="auto">
                      <Form.Group controlId="CSVDownloads.OmitSections">
                        <FormCheck
                          data-testid="CSVDownloads.OmitSections-checkbox"
                          label="Omit sections"
                          onChange={(e) => {
                            setOmitSections(e.target.checked);
                            localStorage.setItem(
                              "CSVDownloads.OmitSections",
                              e.target.checked.toString(),
                            );
                          }}
                          checked={omitSections}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="auto">
                      <Form.Group controlId="CSVDownloads.WithTimeLocations">
                        <FormCheck
                          data-testid="CSVDownloads.WithTimeLocations-checkbox"
                          label="With time/locations"
                          onChange={(e) => {
                            setWithTimeLocations(e.target.checked);
                            localStorage.setItem(
                              "CSVDownloads.WithTimeLocations",
                              e.target.checked.toString(),
                            );
                          }}
                          checked={withTimeLocations}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="auto">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={!quarter || !subjectArea}
                      >
                        Download CSV
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </BasicLayout>
  );
}
