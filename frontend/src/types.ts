export type CaptainMatch = {
  "Captain North": string | null;
  "Captain South": string | null;
  "North picks": string[];
  "South picks": string[];
  "Winner team": "North" | "South";
};