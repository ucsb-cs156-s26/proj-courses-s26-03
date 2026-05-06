import Card from "react-bootstrap/Card";

const dayToStringMap = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  R: "Thursday",
  F: "Friday",
  S: "Saturday",
  U: "Sunday",
};

const dayToString = (day) => {
  return dayToStringMap[day] || day;
};

const monthToStringMap = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  10: "October",
  11: "November",
  12: "December",
};

const monthToString = (month) => {
  return monthToStringMap[month] || month;
};

const formatDate = (date) => {
  return `${monthToString(date.substring(4, 6))} ${parseInt(date.substring(6, 8))}, ${date.substring(0, 4)}`;
};

function FinalExamCard({ finalsInfo }) {
  if (!finalsInfo) {
    return null;
  }

  if (finalsInfo.hasFinals === false) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Final Exam:</Card.Title>
          <Card.Text>
            {finalsInfo.comments
              ? finalsInfo.comments
              : "No final exam information available."}
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }

  const day = finalsInfo.examDay ? dayToString(finalsInfo.examDay) : "";
  const date = finalsInfo.examDate ? formatDate(finalsInfo.examDate) : "";
  const beginTime = finalsInfo.beginTime ? finalsInfo.beginTime : "";
  const endTime = finalsInfo.endTime ? finalsInfo.endTime : "";

  const examInfoString = finalsInfo.examDay
    ? `${day}, ${date} ${beginTime}—${endTime}`
    : "Exam information not available.";

  return (
    <Card>
      <Card.Body>
        <Card.Title>Final Exam:</Card.Title>
        <Card.Text>{examInfoString}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default FinalExamCard;
