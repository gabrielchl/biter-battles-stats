import rawData from "../../../../../scraper/data.json";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import type { CaptainMatch } from "../../../types";

const data = rawData as CaptainMatch[];

type Row = {
  players: string[];
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
};

const statNames = ["single", "double"] as const;
const finalStats = Object.fromEntries(
  statNames.map((name) => [name, []])
) as unknown as Record<(typeof statNames)[number], Row[]>;

type PlayerStats = [number, number, number]; // [games played, win count, lose count]

function getCombinations(arr: string[], k: number): string[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  if (arr.length === k) return [arr.slice()];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map((comb) => [
    first,
    ...comb,
  ]);
  const withoutFirst = getCombinations(rest, k);
  return withFirst.concat(withoutFirst);
}

const stats: Map<string, PlayerStats>[] = statNames.map(() => new Map());

for (const match of data) {
  if (
    match["Captain North"] &&
    !match["North picks"].includes(match["Captain North"])
  ) {
    match["North picks"].push(match["Captain North"]);
  }
  if (
    match["Captain South"] &&
    !match["South picks"].includes(match["Captain South"])
  ) {
    match["South picks"].push(match["Captain South"]);
  }

  const winners =
    match["Winner team"] === "North"
      ? match["North picks"]
      : match["South picks"];
  const losers =
    match["Winner team"] === "North"
      ? match["South picks"]
      : match["North picks"];

  for (let i = 0; i < statNames.length; i++) {
    const winnerCombos = getCombinations([...winners].sort(), i + 1);
    for (const combo of winnerCombos) {
      const key = combo.join("|");
      const stat = stats[i].get(key) || [0, 0, 0];
      stat[0] += 1;
      stat[1] += 1;
      stats[i].set(key, stat);
    }
    const loserCombos = getCombinations([...losers].sort(), i + 1);
    for (const combo of loserCombos) {
      const key = combo.join("|");
      const stat = stats[i].get(key) || [0, 0, 0];
      stat[0] += 1;
      stat[2] += 1;
      stats[i].set(key, stat);
    }
  }
}

for (let i = 0; i < statNames.length; i++) {
  const statName = statNames[i];

  for (const [key, playerStats] of stats[i].entries()) {
    if (playerStats[0] < 20) continue;
    const players = key.split("|");
    finalStats[statName].push({
      players,
      gamesPlayed: playerStats[0],
      gamesWon: playerStats[1],
      gamesLost: playerStats[2],
      winRate: playerStats[1] / playerStats[0],
    });
  }

  finalStats[statName].sort(
    (a, b) => (b.winRate as number) - (a.winRate as number)
  );
}

const chartData = finalStats.single.map((row) => ({
  id: row.players.join("|"),
  data: [
    {
      x: row.gamesPlayed,
      y: row.winRate,
    },
  ],
}));

const chartData2 = finalStats.single.map((row) => ({
  id: row.players.join("|"),
  data: [
    {
      x: row.gamesWon,
      y: row.winRate * row.gamesWon,
    },
  ],
}));
chartData2.sort((a, b) => a.data[0].y - b.data[0].y);
const chartData2XMax = Math.max(...chartData2.map((row) => row.data[0].x))
const chartData2YMax = chartData2.at(-1)?.data?.[0]?.y || 0;

export const CaptainsPlayers = () => {
  return (
    <>
      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(0, min(100%, 600px)))"}}>
        <div
          style={{
            height: "500px",
          }}
        >
          <ResponsiveScatterPlot
            data={chartData}
            axisTop={{ legend: 'Win rate vs games played', legendOffset: -20, style:{legend: {text: {fontSize: 16}}}, tickValues: [] }}
            axisBottom={{ legend: "# of games played", legendOffset: 35 }}
            axisLeft={{ legend: "Win rate", legendOffset: -40 }}
            yScale={{ type: "linear", min: 0, max: 1 }}
            yFormat=">-.2f"
            margin={{ top: 30, right: 15, bottom: 55, left: 60 }}
            annotations={[
              {
                type: "circle",
                match: { serieId: "FluffySan" },
                note: "FluffySan has the highest win rate (any # of games won)",
                noteX: 10,
                noteY: -30,
                size: 15,
              },
              {
                type: "circle",
                match: { serieId: "Carl3" },
                note: "Carl3 has the highest win rate (many games won)",
                noteX: -60,
                noteY: -20,
                size: 15,
              },
              {
                type: "circle",
                match: { serieId: "neuro666" },
                note: "neuro666 played the most games",
                noteX: -50,
                noteY: 80,
                size: 15,
              },
            ]}
          />
        </div>
        <div
          style={{
            height: "500px",
          }}
        >
          <ResponsiveScatterPlot
            data={chartData2}
            axisTop={{ legend: '(Win rate * games won) vs games won', legendOffset: -20, style:{legend: {text: {fontSize: 16}}}, tickValues: [] }}
            axisBottom={{ legend: "# of games won", legendOffset: 35 }}
            axisLeft={{ legend: "Win rate * # of games won", legendOffset: -40 }}
            yScale={{ type: "linear", min: 0, max: chartData2YMax * 1.1 }}
            yFormat=">-.2f"
            margin={{ top: 30, right: 15, bottom: 55, left: 60 }}
            annotations={[
              {
                type: "circle",
                match: { serieId: "FluffySan" },
                note: "FluffySan has the highest win rate (any games won)",
                noteX: 40,
                noteY: 40,
                size: 15,
              },
              {
                type: "circle",
                match: { serieId: "Carl3" },
                note: "Carl3 has the highest # of games won",
                noteX: -90,
                noteY: -15,
                size: 15,
              },
              {
                type: "circle",
                match: { serieId: "neuro666" },
                note: "neuro666 played the most games",
                noteX: -10,
                noteY: 100,
                size: 15,
              },
            ]}
          />
        </div>
        <div
          style={{
            height: "500px",
          }}
        >
          <ResponsiveScatterPlot
            data={chartData2.slice(-10)}
            axisTop={{ legend: 'High (win rate * # of games won) and high # of games won', legendOffset: -20, style:{legend: {text: {fontSize: 16}}}, tickValues: [] }}
            axisBottom={{ legend: "# of games won", legendOffset: 35 }}
            axisLeft={{ legend: "Win rate * # of games won", legendOffset: -40 }}
            xScale={{ type: "linear", min: "auto", max: chartData2XMax * 1.05 }}
            yScale={{ type: "linear", min: "auto", max: chartData2YMax * 1.05 }}
            yFormat=">-.2f"
            margin={{ top: 30, right: 15, bottom: 55, left: 60 }}
            annotations={chartData2
              .slice(-10)
              .map((row) => ({
                type: "circle",
                match: { serieId: row.id },
                note: row.id,
                noteX: 5,
                noteY: -5,
                noteWidth: 0,
                size: 15,
              }))}
          />
        </div>
      </div>
    </>
  );
}
