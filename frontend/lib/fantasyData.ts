// lib/fantasyData.ts

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getFantasyTeams(leagueId: string) {
  const res = await fetch(`${API_URL}/league/getFantasyTeams?leagueId=${leagueId}`, {
    cache: "no-store", // or "force-cache" depending on needs
  });
  return res.json();
}

export async function getFantasyTeamsWeeklyStats(leagueId: string, year: number) {
  const res = await fetch(`${API_URL}/league/getFantasyTeamsWeeklyStats?leagueId=${leagueId}&year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getFantasyTeamsSeasonStats(leagueId: string, year: number) {
  const res = await fetch(`${API_URL}/league/getFantasyTeamsSeasonStats?leagueId=${leagueId}&year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getFantasyPlayersSeasonStats(leagueId: string, year: number) {
  const res = await fetch(`${API_URL}/league/getFantasyPlayersSeasonStats?leagueId=${leagueId}&year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getFantasyPlayersWeeklyStats(leagueId: string, year: number) {
  const res = await fetch(`${API_URL}/league/getFantasyPlayersWeeklyStats?leagueId=${leagueId}&year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getFantasyDraftPicks(leagueId: string, year: number) {
  const res = await fetch(`${API_URL}/league/getFantasyDraftPicks?leagueId=${leagueId}&year=${year}`, {
    cache: "no-store",
  });
  return res.json();
}