// context/FantasyDataContext.tsx
import { getFantasyTeams, getFantasyPlayersWeeklyStats, getFantasyPlayersSeasonStats, getFantasyTeamsWeeklyStats, getFantasyTeamsSeasonStats, getFantasyDraftPicks } from "@/lib/fantasyData";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"; 
import { useLeagueTeamData } from "./LeagueTeamDataContext";

type FantasyData = {
  fantasyTeams: FantasyTeam[];
  fantasyPlayersWeeklyStats: FantasyPlayerWeeklyStats[];
  fantasyPlayersSeasonStats: FantasyPlayerSeasonStats[];
  fantasyTeamsWeeklyStats: FantasyTeamWeeklyStats[];
  fantasyTeamsSeasonStats: FantasyTeamSeasonStats[];
  fantasyDraftPicks: FantasyDraftPick[];
  isLoading: boolean;
  refetchData: () => void;
};

const FantasyDataContext = createContext<FantasyData | undefined>(undefined);

export function FantasyDataProvider({ year, children }: { year: number, children: ReactNode }) {

  const { selectedLeagueId } = useLeagueTeamData();
    
  console.log("FantasyDataProvider component executing", { selectedLeagueId, year });

  const [data, setData] = useState<FantasyData>({
    fantasyTeams: [],
    fantasyPlayersWeeklyStats: [],
    fantasyPlayersSeasonStats: [],
    fantasyTeamsWeeklyStats: [],
    fantasyTeamsSeasonStats: [],
    fantasyDraftPicks: [],
    isLoading: true,
    refetchData: () => {}
  });

  const fetchAll = useCallback(async (leagueId: string) => {
    console.log("Fetching fantasy data for league:", leagueId, "year:", year);
    setData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const [
        fantasyTeams,
        fantasyPlayersWeeklyStats,
        fantasyPlayersSeasonStats,
        fantasyTeamsWeeklyStats,
        fantasyTeamsSeasonStats,
        fantasyDraftPicks
      ] = await Promise.all([
        getFantasyTeams(leagueId),
        getFantasyPlayersWeeklyStats(leagueId, year),
        getFantasyPlayersSeasonStats(leagueId, year),
        getFantasyTeamsWeeklyStats(leagueId, year),
        getFantasyTeamsSeasonStats(leagueId, year),
        getFantasyDraftPicks(leagueId, year)
      ]);

      const cleaned_fantasy_teams = [];
      for (const team of fantasyTeams.data) {
        cleaned_fantasy_teams.push({
          id: team.id,
          user_id: team.user_id,
          league_id: team.league_id,
          team_name: team.team_name,
          espn_team_id: team.espn_team_id,
          team_abbrev: team.team_abbrev,
        });
      }

      const cleaned_fantasy_players_weekly_stats = [];
      for (const playerWeeklyStat of fantasyPlayersWeeklyStats.data) {
        cleaned_fantasy_players_weekly_stats.push({
          id: playerWeeklyStat.id,
          player_id: playerWeeklyStat.player_id,
          game_id: playerWeeklyStat.game_id,
          week: playerWeeklyStat.week,
          year: playerWeeklyStat.year,
          team_id: playerWeeklyStat.team_id,
          projected_fantasy_points: playerWeeklyStat.projected_fantasy_points,
          actual_fantasy_points: playerWeeklyStat.actual_fantasy_points,
          created_at: playerWeeklyStat.created_at,
          updated_at: playerWeeklyStat.updated_at,
          league_id: playerWeeklyStat.league_id,
          slot: playerWeeklyStat.slot,
        });
      }

      const cleaned_fantasy_players_season_stats = [];
      for (const playerSeasonStat of fantasyPlayersSeasonStats.data) {
        cleaned_fantasy_players_season_stats.push({
          id: playerSeasonStat.id,
          player_id: playerSeasonStat.player_id,
          year: playerSeasonStat.year,
          games_played: playerSeasonStat.games_played,
          avg_projected_fantasy_points: playerSeasonStat.avg_projected_fantasy_points,
          std_dev_projected_fantasy_points: playerSeasonStat.std_dev_projected_fantasy_points,
          avg_actual_fantasy_points: playerSeasonStat.avg_actual_fantasy_points,
          std_dev_actual_fantasy_points: playerSeasonStat.std_dev_actual_fantasy_points,
          total_points: playerSeasonStat.total_points,
          created_at: playerSeasonStat.created_at,
          updated_at: playerSeasonStat.updated_at,
          league_id: playerSeasonStat.league_id,
        });
      }

      const cleaned_fantasy_teams_weekly_stats = [];
      for (const teamWeeklyStat of fantasyTeamsWeeklyStats.data) {
        cleaned_fantasy_teams_weekly_stats.push({
          id: teamWeeklyStat.id,
          league_id: teamWeeklyStat.league_id,
          team_id: teamWeeklyStat.team_id,
          week: teamWeeklyStat.week,
          year: teamWeeklyStat.year,
          win: teamWeeklyStat.win,
          points_for: teamWeeklyStat.points_for,
          points_against: teamWeeklyStat.points_against,
          max_possible_points: teamWeeklyStat.max_possible_points,
          opponent_team_id: teamWeeklyStat.opponent_team_id,
          created_at: teamWeeklyStat.created_at,
          updated_at: teamWeeklyStat.updated_at,
          projected_points: teamWeeklyStat.projected_points,
        });
      }

      const cleaned_fantasy_teams_season_stats = [];
      for (const teamSeasonStat of fantasyTeamsSeasonStats.data) {
        cleaned_fantasy_teams_season_stats.push({
          id: teamSeasonStat.id,
          league_id: teamSeasonStat.league_id,
          team_id: teamSeasonStat.team_id,
          year: teamSeasonStat.year,
          wins: teamSeasonStat.wins,
          losses: teamSeasonStat.losses,
          points_for: teamSeasonStat.points_for,
          points_against: teamSeasonStat.points_against,
          max_possible_points: teamSeasonStat.max_possible_points,
          created_at: teamSeasonStat.created_at,
          updated_at: teamSeasonStat.updated_at,
        });
      }

      const cleaned_fantasy_draft_picks = [];
      for (const draftPick of fantasyDraftPicks.data) {
        cleaned_fantasy_draft_picks.push({
          id: draftPick.id,
          league_id: draftPick.league_id,
          team_id: draftPick.team_id,
          player_id: draftPick.player_id,
          round_number: draftPick.round_number,
          pick_number: draftPick.pick_number,
        });
      }

      const newData = {
        fantasyTeams: cleaned_fantasy_teams,
        fantasyPlayersWeeklyStats: cleaned_fantasy_players_weekly_stats,
        fantasyPlayersSeasonStats: cleaned_fantasy_players_season_stats,
        fantasyTeamsWeeklyStats: cleaned_fantasy_teams_weekly_stats,
        fantasyTeamsSeasonStats: cleaned_fantasy_teams_season_stats,
        fantasyDraftPicks: cleaned_fantasy_draft_picks,
        isLoading: false,
        refetchData: () => {}
      };

      setData(newData);
      console.log("Fantasy data loaded successfully for league:", leagueId);
      
    } catch (error) {
      console.error("Error fetching fantasy data:", error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [year]); // Only depend on year, not selectedLeagueId

  // Create refetch function
  const refetchData = useCallback(() => {
    if (selectedLeagueId) {
      fetchAll(selectedLeagueId);
    }
  }, [selectedLeagueId, fetchAll]);

  // Update the data with the refetch function
  useEffect(() => {
    setData(prev => ({ ...prev, refetchData }));
  }, [refetchData]);

  // Main effect that triggers when league changes
  useEffect(() => {
    console.log("useEffect running with:", { selectedLeagueId, year });

    if (selectedLeagueId) {
      fetchAll(selectedLeagueId);
    } else {
      // Reset data when no league is selected
      setData({
        fantasyTeams: [],
        fantasyPlayersWeeklyStats: [],
        fantasyPlayersSeasonStats: [],
        fantasyTeamsWeeklyStats: [],
        fantasyTeamsSeasonStats: [],
        fantasyDraftPicks: [],
        isLoading: false,
        refetchData: () => {}
      });
    }
  }, [selectedLeagueId, fetchAll]);

  return <FantasyDataContext.Provider value={data}>{children}</FantasyDataContext.Provider>;
}

export function useFantasyData() {
  const context = useContext(FantasyDataContext);
  if (!context) {
    throw new Error("useFantasyData must be used within a FantasyDataProvider");
  }
  return context;
}