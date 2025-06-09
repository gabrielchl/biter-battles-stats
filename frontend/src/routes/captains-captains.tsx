import { createFileRoute } from "@tanstack/react-router";
import rawData from "../../../scraper/data.json";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import type { CaptainMatch } from "../types";

export const Route = createFileRoute("/captains-captains")({
  component: CaptainsCaptainsWithPlayers,
});

const data = rawData as CaptainMatch[];

type Row = {
  captain: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
};

const statNames = ["single"] as const;
const finalStats = Object.fromEntries(
  statNames.map((name) => [name, []])
) as unknown as Record<(typeof statNames)[number], Row[]>;

type PlayerStats = [number, number, number]; // [games played, win count, lose count]

const stats: Map<string, PlayerStats>[] = statNames.map(() => new Map());

for (const match of data) {
  if (!match["Captain North"] || !match["Captain South"]) {
    continue;
  }

  const winnerCaptain =
    match["Winner team"] === "North"
      ? match["Captain North"]
      : match["Captain South"];
  const loserCaptain =
    match["Winner team"] === "North"
      ? match["Captain South"]
      : match["Captain North"];

  for (let i = 0; i < statNames.length; i++) {
    const winnerStat = stats[i].get(winnerCaptain) || [0, 0, 0];
    winnerStat[0] += 1;
    winnerStat[1] += 1;
    stats[i].set(winnerCaptain, winnerStat);
    const loserStat = stats[i].get(loserCaptain) || [0, 0, 0];
    loserStat[0] += 1;
    loserStat[2] += 1;
    stats[i].set(loserCaptain, loserStat);
  }
}

for (let i = 0; i < statNames.length; i++) {
  const statName = statNames[i];

  for (const [key, playerStats] of stats[i].entries()) {
    if (playerStats[0] < 10) continue;
    finalStats[statName].push({
      captain: key,
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
  id: row.captain,
  data: [
    {
      x: row.gamesPlayed,
      y: row.winRate,
    },
  ],
}));

const chartData2 = finalStats.single.map((row) => ({
  id: row.captain,
  data: [
    {
      x: row.gamesWon,
      y: row.winRate * row.gamesWon,
    },
  ],
}));
const chartData2XMax = Math.max(...chartData2.map((row) => row.data[0].x));
const chartData2YMax = Math.max(...chartData2.map((row) => row.data[0].y));

function CaptainsCaptainsWithPlayers() {
  return (
    <>
      <div
        style={{
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fit, minmax(0, min(100%, 600px)))",
        }}
      >
        <div
          style={{
            height: "500px",
          }}
        >
          <ResponsiveScatterPlot
            data={chartData}
            axisTop={{
              legend: "Win rate vs games played",
              legendOffset: -20,
              style: { legend: { text: { fontSize: 16 } } },
              tickValues: [],
            }}
            axisBottom={{ legend: "# of games played", legendOffset: 35 }}
            axisLeft={{ legend: "Win rate", legendOffset: -40 }}
            yScale={{ type: "linear", min: 0, max: 1 }}
            yFormat=">-.2f"
            margin={{ top: 30, right: 15, bottom: 55, left: 60 }}
            annotations={[
              {
                type: "circle",
                match: { serieId: "Clutch331" },
                note: "Clutch331 has the highest win rate as a captain",
                noteX: -40,
                noteY: -20,
                size: 15,
              },
              {
                type: "circle",
                match: { serieId: "thesoldier57" },
                note: "thesoldier57 captained the most games",
                noteX: -75,
                noteY: -40,
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
            axisTop={{
              legend: "(Win rate * games won) vs games won",
              legendOffset: -20,
              style: { legend: { text: { fontSize: 16 } } },
              tickValues: [],
            }}
            axisBottom={{ legend: "# of games won", legendOffset: 35 }}
            axisLeft={{
              legend: "Win rate * # of games won",
              legendOffset: -40,
            }}
            yScale={{ type: "linear", min: 0, max: chartData2YMax * 1.1 }}
            yFormat=">-.2f"
            margin={{ top: 30, right: 15, bottom: 55, left: 60 }}
            annotations={[
              {
                type: "circle",
                match: { serieId: "Clutch331" },
                note: "Clutch331 has the highest win rate as a captain",
                noteX: -40,
                noteY: -20,
                size: 15,
              },
              {
                type: "circle",
                match: { serieId: "thesoldier57" },
                note: "thesoldier57 captained the most games",
                noteX: -80,
                noteY: -20,
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
            data={chartData2.filter((row) => row.data[0].y > 10)}
            axisTop={{
              legend:
                "High (win rate * # of games won) and high # of games won",
              legendOffset: -20,
              style: { legend: { text: { fontSize: 16 } } },
              tickValues: [],
            }}
            axisBottom={{ legend: "# of games won", legendOffset: 35 }}
            axisLeft={{
              legend: "Win rate * # of games won",
              legendOffset: -40,
            }}
            xScale={{ type: "linear", min: "auto", max: chartData2XMax * 1.05 }}
            yScale={{ type: "linear", min: "auto", max: chartData2YMax * 1.05 }}
            yFormat=">-.2f"
            margin={{ top: 30, right: 15, bottom: 55, left: 60 }}
            annotations={chartData2
              .filter((row) => row.data[0].y > 50)
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
