import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import rawData from "../../../../../scraper/data.json";
import type { CaptainMatch } from "../../../types";
import { ResponsiveCalendar } from "@nivo/calendar";

dayjs.extend(utc);
dayjs.extend(duration)

const data = rawData as CaptainMatch[];

const dates = data.reduce((prev, match) => {
  const startDate = dayjs.utc(match['Ending date']).subtract(dayjs.duration(match['Game length'].replaceAll(' ', '').toUpperCase())).format('YYYY-MM-DD');
  if (!prev[startDate]) {
    prev[startDate] = 0;
  }
  prev[startDate] += 1;
  return prev;
}, {} as Record<string, number>);

const chartData = Object.entries(dates).map(([day, value]) => ({day, value}));

export const CaptainsDates = () => (
  <div
    style={{
      height: "500px",
    }}
  >
    <ResponsiveCalendar
      data={chartData}
      from={chartData.at(-1)?.day || ""} to={chartData[0]?.day || ""}
      emptyColor="#eeeeee"
      margin={{ top: 30, right: 10, bottom: 10, left: 20 }}
      align="left"
      yearSpacing={40}
      monthBorderColor="#ffffff"
      dayBorderWidth={2}
      dayBorderColor="#ffffff"
    />
  </div>
);
