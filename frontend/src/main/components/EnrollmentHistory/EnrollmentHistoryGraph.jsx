import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  buildEnrollmentByQuarter,
  getUniqueSections,
} from "main/components/EnrollmentHistory/EnrollmentHistoryHelper";

// Stryker disable all
const SECTION_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#a4de6c"];
// Stryker restore all

const EnrollmentHistoryGraph = ({ enrollmentHistory }) => {
  if (!enrollmentHistory || enrollmentHistory.length === 0) {
    return <div data-testid="enrollment-history-graph-empty" />;
  }

  const chartData = buildEnrollmentByQuarter(enrollmentHistory);
  const sections = getUniqueSections(enrollmentHistory);

  return (
    <div data-testid="enrollment-history-graph">
      <h3>Enrollment History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          // Stryker disable next-line all
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="quarter" />
          <YAxis />
          <Legend />
          <Tooltip />
          {sections.map((section, idx) => (
            <Line
              key={section}
              type="monotone"
              dataKey={section}
              // Stryker disable next-line ArithmeticOperator
              stroke={SECTION_COLORS[idx % SECTION_COLORS.length]}
              // Stryker disable next-line all
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnrollmentHistoryGraph;
