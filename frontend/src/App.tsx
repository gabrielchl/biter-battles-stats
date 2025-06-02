import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import rawData from "../../scraper/data.json";
import { ResponsiveScatterPlot, ScatterPlot } from "@nivo/scatterplot";

type Match = {
  "Captain North": string | null;
  "Captain South": string | null;
  "North picks": string[];
  "South picks": string[];
  "Winner team": "North" | "South";
};
const data = rawData as Match[];

type Row = {
  players: string[];
  gamesPlayed: number;
  winCount: number;
  loseCount: number;
  winRate: number;
};

const statNames = ["single", "double", "triple"] as const;
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
      winCount: playerStats[1],
      loseCount: playerStats[2],
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
      x: row.winCount,
      y: row.winRate,
    },
  ],
}));

const chartData2 = finalStats.single.map((row) => ({
  id: row.players.join("|"),
  data: [
    {
      x: row.winCount,
      y: row.winRate * row.winCount,
    },
  ],
}));

function App() {
  return (
    <>
      <div
        style={{
          paddingTop: "10px",
          border: "1px solid black",
        }}
      >
        Win rate vs games won
        <div
          style={{
            width: "500px",
            height: "500px",
          }}
        >
          <ResponsiveScatterPlot
            data={chartData}
            axisBottom={{ legend: "Games won", legendOffset: 35 }}
            axisLeft={{ legend: "Win rate", legendOffset: -40 }}
            yScale={{ type: "linear", min: 0, max: 1 }}
            margin={{ top: 15, right: 15, bottom: 55, left: 60 }}
            annotations={[
              {
                type: "circle",
                match: { serieId: "FluffySan" },
                note: "FluffySan has the highest win rate (any games won)",
                noteX: 10,
                noteY: -30,
                size: 15,
              },
              {
                type: "circle",
                match: { serieId: "Carl3" },
                note: "Carl3 has the highest win rate (many games won)",
                noteX: -130,
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
      </div>
      <div style={{ height: "20px" }} />
      <div
        style={{
          paddingTop: "10px",
          border: "1px solid black",
        }}
      >
        (Win rate * games won) vs games won
        <div
          style={{
            width: "500px",
            height: "500px",
          }}
        >
          <ResponsiveScatterPlot
            data={chartData2}
            axisBottom={{ legend: "Games won", legendOffset: 35 }}
            axisLeft={{ legend: "Win rate * Games won", legendOffset: -40 }}
            // yScale={{ type: "linear", min: 0, max: 1 }}
            margin={{ top: 15, right: 15, bottom: 55, left: 60 }}
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
                note: "Carl3 has the highest win rate (many games won)",
                noteX: -180,
                noteY: 40,
                size: 15,
              },
              {
                type: "circle",
                match: { serieId: "neuro666" },
                note: "neuro666 played the most games",
                noteX: -20,
                noteY: 110,
                size: 15,
              },
            ]}
          />
        </div>
      </div>
      <div style={{ height: "20px" }} />
      <div
        style={{
          paddingTop: "10px",
          border: "1px solid black",
        }}
      >
        Players with high win rate * games won and high games won
        <div
          style={{
            width: "500px",
            height: "500px",
          }}
        >
          <ResponsiveScatterPlot
            data={chartData2.filter((row) => row.data[0].y > 50)}
            axisBottom={{ legend: "Games won", legendOffset: 35 }}
            axisLeft={{ legend: "Win rate * Games won", legendOffset: -40 }}
            xScale={{ type: "linear", min: "auto", max: 160 }}
            yScale={{ type: "linear", min: "auto", max: 110 }}
            margin={{ top: 15, right: 15, bottom: 55, left: 60 }}
            annotations={chartData2
              .filter((row) => row.data[0].y > 50)
              .map((row) => ({
                type: "circle",
                match: { serieId: row.id },
                note: row.id,
                noteX: 20,
                noteY: 0,
                noteWidth: 0,
                size: 15,
              }))}
          />
        </div>
      </div>
    </>
  );
}

export default App;
