import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import rawData from "../../../../../scraper/data.json";
import type { CaptainMatch } from "../../../types";
import { ResponsiveCalendar } from "@nivo/calendar";

dayjs.extend(utc);
dayjs.extend(duration)

const data = rawData as CaptainMatch[];

const gameDates = data.reduce((prev, match) => {
  const startDate = dayjs.utc(match['Ending date']).subtract(dayjs.duration(match['Game length'].replaceAll(' ', '').toUpperCase())).format('YYYY-MM-DD');
  if (!prev[startDate]) {
    prev[startDate] = 0;
  }
  prev[startDate] += 1;
  return prev;
}, {} as Record<string, number>);

const gameDatesChartData = Object.entries(gameDates).map(([day, value]) => ({day, value}));

const playerDates = data.reduce((prev, match) => {
  const startDate = dayjs.utc(match['Ending date']).subtract(dayjs.duration(match['Game length'].replaceAll(' ', '').toUpperCase())).format('YYYY-MM-DD');
  if (!prev[startDate]) {
    prev[startDate] = new Set();
  }
  [match['Captain North'], match['Captain South'], ...match['North picks'], ...match['South picks']].filter((i) => i).forEach((player) => {
    prev[startDate].add(player as string);
  });
  return prev;
}, {} as Record<string, Set<string>>);

const playerDatesChartData = Object.entries(playerDates).map(([day, value]) => ({day, value: value.size}));

export const CaptainsDates = () => (
  <div>
    <span># of games played per day</span>
    <div
      style={{
        height: "500px",
      }}
    >
      <ResponsiveCalendar
        data={gameDatesChartData}
        from={gameDatesChartData.at(-1)?.day || ""} to={gameDatesChartData[0]?.day || ""}
        emptyColor="#eeeeee"
        margin={{ top: 30, right: 10, bottom: 10, left: 20 }}
        align="left"
        yearSpacing={40}
        monthBorderColor="#ffffff"
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
      />
    </div>
    <span># of unique players per day</span>
    <div
      style={{
        height: "500px",
      }}
    >
      <ResponsiveCalendar
        data={playerDatesChartData}
        from={playerDatesChartData.at(-1)?.day || ""} to={playerDatesChartData[0]?.day || ""}
        emptyColor="#eeeeee"
        margin={{ top: 30, right: 10, bottom: 10, left: 20 }}
        align="left"
        yearSpacing={40}
        monthBorderColor="#ffffff"
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
      />
    </div>
  </div>
);
