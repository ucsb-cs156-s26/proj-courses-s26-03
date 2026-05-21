import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  buildTimeSeries,
  groupBySectionAndQuarter,
  formatDateForAxis,
  formatQuarter,
} from "main/components/EnrollmentHistory/EnrollmentHistoryHelper";

const EnrollmentLineChart = ({ data, title, passTimes }) => {
  const timeSeriesData = buildTimeSeries(data);

  return (
    <div data-testid="enrollment-history-graph">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={timeSeriesData}
          // Stryker disable next-line all
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            // Stryker disable next-line all
            domain={["auto", "auto"]}
            tickFormatter={formatDateForAxis}
          />
          <YAxis />
          <Legend />
          <Tooltip labelFormatter={formatDateForAxis} />
          <Line
            type="monotone"
            dataKey="enrollment"
            stroke="#8884d8"
            // Stryker disable next-line all
            dot={false}
          />
          {passTimes &&
            passTimes.map((pass) => (
              <ReferenceLine
                key={pass.label}
                // Stryker disable next-line all
                x={new Date(pass.date).getTime()}
                stroke="#ff7300"
                // Stryker disable next-line all
                label={{ value: pass.label, position: "insideTopRight" }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const EnrollmentHistoryGraph = ({ enrollmentHistory, passTimes }) => {
  if (!enrollmentHistory || enrollmentHistory.length === 0) {
    return <div data-testid="enrollment-history-graph-empty" />;
  }

  const groups = groupBySectionAndQuarter(enrollmentHistory);

  return (
    <div data-testid="enrollment-history-graphs">
      {Object.entries(groups).map(([key, sectionData]) => (
        <EnrollmentLineChart
          key={key}
          data={sectionData}
          title={`Section ${sectionData[0].section} - ${formatQuarter(sectionData[0].yyyyq)}`}
          passTimes={passTimes}
        />
      ))}
    </div>
  );
};

export default EnrollmentHistoryGraph;
