// lib/nflData.ts

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getNFLTeams(year: number) {
  const res = await fetch(`${API_URL}/nfl/getNFLTeams?year=${year}`, {
    cache: "no-store", // or "force-cache" depending on needs
  });
  return res.json();
}

export async function getNFLPlayers(year: number) {
  const res = await fetch(`${API_URL}/nfl/getNFLPlayers?year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getNFLSchedule(year: number) {
  const res = await fetch(`${API_URL}/nfl/getNFLSchedule?year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getNFLPlayerWeeklyStats(year: number) {
  const res = await fetch(`${API_URL}/nfl/getNFLPlayerWeeklyStats?year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getNFLPlayerSeasonStats(year: number) {
  const res = await fetch(`${API_URL}/nfl/getNFLPlayerSeasonStats?year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getNFLTeamWeeklyStats(year: number) {
  const res = await fetch(`${API_URL}/nfl/getNFLTeamWeeklyStats?year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getNFLTeamSeasonStats(year: number) {
  const res = await fetch(`${API_URL}/nfl/getNFLTeamSeasonStats?year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}
