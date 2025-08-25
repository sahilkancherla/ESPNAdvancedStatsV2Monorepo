// context/NFLDataContext.tsx
import { getNFLTeams, getNFLPlayers, getNFLSchedule, getNFLPlayerWeeklyStats, getNFLPlayerSeasonStats, getNFLTeamWeeklyStats, getNFLTeamSeasonStats } from "@/lib/nflData";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { NFLTeam, NFLPlayer, NFLGame, NFLPlayerWeeklyStats, NFLPlayerSeasonStats, NFLTeamWeeklyStats, NFLTeamSeasonStats } from "@/lib/interfaces";

type NFLData = {
  nflTeams: NFLTeam[];
  nflPlayers: NFLPlayer[];
  nflSchedule: NFLGame[];
  nflPlayerWeeklyStats: NFLPlayerWeeklyStats[];
  nflPlayerSeasonStats: NFLPlayerSeasonStats[];
  nflTeamWeeklyStats: NFLTeamWeeklyStats[];
  nflTeamSeasonStats: NFLTeamSeasonStats[];
};

const NFLDataContext = createContext<NFLData | undefined>(undefined);

export function NFLDataProvider({ year, children }: { year: number | null, children: ReactNode }) {
  const [data, setData] = useState<NFLData>({
    nflTeams: [],
    nflPlayers: [],
    nflSchedule: [],
    nflPlayerWeeklyStats: [],
    nflPlayerSeasonStats: [],
    nflTeamWeeklyStats: [],
    nflTeamSeasonStats: []
  });

  useEffect(() => {
    async function fetchAll(currentYear: number) {
      const [
        nflTeams,
        nflPlayers,
        nflSchedule,
        nflPlayerWeeklyStats,
        nflPlayerSeasonStats,
        nflTeamWeeklyStats,
        nflTeamSeasonStats
      ] = await Promise.all([
        getNFLTeams(currentYear),
        getNFLPlayers(currentYear),
        getNFLSchedule(currentYear),
        getNFLPlayerWeeklyStats(currentYear),
        getNFLPlayerSeasonStats(currentYear),
        getNFLTeamWeeklyStats(currentYear),
        getNFLTeamSeasonStats(currentYear),
      ]);      

      // NFL Player Weekly Stats
      const cleanedPlayerWeeklyStats = [];
      for (const playerWeeklyStat of nflPlayerWeeklyStats.data) {
        cleanedPlayerWeeklyStats.push({
          id: playerWeeklyStat.id,
          player_id: playerWeeklyStat.player_id,
          game_id: playerWeeklyStat.game_id,
          week: playerWeeklyStat.week,
          year: playerWeeklyStat.year,
          injured: playerWeeklyStat.injured,
          got_injured: playerWeeklyStat.got_injured,
          passing_touchdowns: playerWeeklyStat.passing_touchdowns,
          passing_attempts: playerWeeklyStat.passing_attempts,
          passing_completions: playerWeeklyStat.passing_completions,
          passing_incompletions: playerWeeklyStat.passing_incompletions,
          passing_interceptions: playerWeeklyStat.passing_interceptions,
          passing_yards: playerWeeklyStat.passing_yards,
          rushing_touchdowns: playerWeeklyStat.rushing_touchdowns,
          rushing_attempts: playerWeeklyStat.rushing_attempts,
          rushing_yards: playerWeeklyStat.rushing_yards,
          rush_attempts_inside_20: playerWeeklyStat.rush_attempts_inside_20,
          rush_attempts_inside_10: playerWeeklyStat.rush_attempts_inside_10,
          rush_attempts_inside_5: playerWeeklyStat.rush_attempts_inside_5,
          rush_attempts_inside_2: playerWeeklyStat.rush_attempts_inside_2,
          rushes_on_1st_down: playerWeeklyStat.rushes_on_1st_down,
          rushes_on_2nd_down: playerWeeklyStat.rushes_on_2nd_down,
          rushes_on_3rd_down: playerWeeklyStat.rushes_on_3rd_down,
          rushes_10_plus: playerWeeklyStat.rushes_10_plus,
          rushes_20_plus: playerWeeklyStat.rushes_20_plus,
          receptions: playerWeeklyStat.receptions,
          receiving_yards: playerWeeklyStat.receiving_yards,
          receiving_touchdowns: playerWeeklyStat.receiving_touchdowns,
          receiving_yards_after_catch: playerWeeklyStat.receiving_yards_after_catch,
          targets: playerWeeklyStat.targets,
          targets_on_1st_down: playerWeeklyStat.targets_on_1st_down,
          targets_on_2nd_down: playerWeeklyStat.targets_on_2nd_down,
          targets_on_3rd_down: playerWeeklyStat.targets_on_3rd_down,
          targets_10_plus: playerWeeklyStat.targets_10_plus,
          targets_20_plus: playerWeeklyStat.targets_20_plus,
          targets_inside_20: playerWeeklyStat.targets_inside_20,
          targets_inside_10: playerWeeklyStat.targets_inside_10,
          created_at: playerWeeklyStat.created_at,
          updated_at: playerWeeklyStat.updated_at,
        });
      }

      // NFL Player Season Stats
      const cleanedNFLPlayerSeasonStats = [];
      for (const playerSeasonStat of nflPlayerSeasonStats.data) {
        cleanedNFLPlayerSeasonStats.push({
          id: playerSeasonStat.id,
          player_id: playerSeasonStat.player_id,
          year: playerSeasonStat.year,
          games_played: playerSeasonStat.games_played,
          passing_touchdowns: playerSeasonStat.passing_touchdowns,
          passing_attempts: playerSeasonStat.passing_attempts,
          passing_completions: playerSeasonStat.passing_completions,
          passing_incompletions: playerSeasonStat.passing_incompletions,
          passing_interceptions: playerSeasonStat.passing_interceptions,
          passing_yards: playerSeasonStat.passing_yards,
          rushing_touchdowns: playerSeasonStat.rushing_touchdowns,
          rushing_attempts: playerSeasonStat.rushing_attempts,
          rushing_yards: playerSeasonStat.rushing_yards,
          rush_attempts_inside_20: playerSeasonStat.rush_attempts_inside_20,
          rush_attempts_inside_10: playerSeasonStat.rush_attempts_inside_10,
          rush_attempts_inside_5: playerSeasonStat.rush_attempts_inside_5,
          rush_attempts_inside_2: playerSeasonStat.rush_attempts_inside_2,
          rushes_on_1st_down: playerSeasonStat.rushes_on_1st_down,
          rushes_on_2nd_down: playerSeasonStat.rushes_on_2nd_down,
          rushes_on_3rd_down: playerSeasonStat.rushes_on_3rd_down,
          rushes_10_plus: playerSeasonStat.rushes_10_plus,
          rushes_20_plus: playerSeasonStat.rushes_20_plus,
          receptions: playerSeasonStat.receptions,
          receiving_yards: playerSeasonStat.receiving_yards,
          receiving_touchdowns: playerSeasonStat.receiving_touchdowns,
          receiving_yards_after_catch: playerSeasonStat.receiving_yards_after_catch,
          targets: playerSeasonStat.targets,
          targets_on_1st_down: playerSeasonStat.targets_on_1st_down,
          targets_on_2nd_down: playerSeasonStat.targets_on_2nd_down,
          targets_on_3rd_down: playerSeasonStat.targets_on_3rd_down,
          targets_10_plus: playerSeasonStat.targets_10_plus,
          targets_20_plus: playerSeasonStat.targets_20_plus,
          targets_inside_20: playerSeasonStat.targets_inside_20,
          targets_inside_10: playerSeasonStat.targets_inside_10,
          created_at: playerSeasonStat.created_at,
          updated_at: playerSeasonStat.updated_at,
        });
      }

      // NFL Games
      const cleaned_games = [];
      for (const game of nflSchedule.data) {
        cleaned_games.push({
          id: game.id,
          week: game.week,
          year: game.year,
          home_team_id: game.home_team_id,
          away_team_id: game.away_team_id,
          winning_team_id: game.winning_team_id,
        });
      }

      // NFL Teams
      const cleaned_teams = [];
      for (const team of nflTeams.data) {
        cleaned_teams.push({
          id: team.id,
          espn_team_id: team.espn_team_id,
          team_name: team.team_name,
          team_abbrev: team.team_abbrev,
          bye_week: team.bye_week,
          espn_defense_dt_ranking: team.espn_defense_dt_ranking,
          espn_defense_edge_ranking: team.espn_defense_edge_ranking,
          espn_defense_lb_ranking: team.espn_defense_lb_ranking,
          espn_defense_cb_ranking: team.espn_defense_cb_ranking,
          espn_defense_s_ranking: team.espn_defense_s_ranking,
          espn_offensive_line_ranking: team.espn_offensive_line_ranking,
          the_huddle_run_blocking_ranking: team.the_huddle_run_blocking_ranking,
          the_huddle_pass_blocking_ranking: team.the_huddle_pass_blocking_ranking,
          the_huddle_overall_offensive_line_ranking: team.the_huddle_overall_ranking,
          pff_defensive_line_ranking: team.pff_defensive_line_ranking,
          pff_offensive_line_ranking: team.pff_offensive_line_ranking,
          schedule: cleaned_games.filter((game: NFLGame) => 
            game.home_team_id === team.id || game.away_team_id === team.id
          )
        });
      }

      // NFL Team Weekly Stats
      const cleaned_team_weekly_stats = [];
      for (const teamWeeklyStat of nflTeamWeeklyStats.data) {
        cleaned_team_weekly_stats.push({
          id: teamWeeklyStat.id,
          team_id: teamWeeklyStat.team_id,
          game_id: teamWeeklyStat.game_id,
          week: teamWeeklyStat.week,
          year: teamWeeklyStat.year,
          win: teamWeeklyStat.win,
          offense_total_plays: teamWeeklyStat.offense_total_plays,
          defense_total_plays: teamWeeklyStat.defense_total_plays,
          offense_redzone_plays: teamWeeklyStat.offense_redzone_plays,
          defense_redzone_plays: teamWeeklyStat.defense_redzone_plays,
          offense_redzone_trips: teamWeeklyStat.offense_redzone_trips,
          offense_redzone_success_touchdown: teamWeeklyStat.offense_redzone_success_touchdown,
          offense_redzone_success_field_goal: teamWeeklyStat.offense_redzone_success_field_goal,
          defense_redzone_trips_allowed: teamWeeklyStat.defense_redzone_trips_allowed,
          defense_redzone_touchdowns: teamWeeklyStat.defense_redzone_touchdowns,
          defense_redzone_field_goals: teamWeeklyStat.defense_redzone_field_goals,
          defense_redzone_no_points: teamWeeklyStat.defense_redzone_no_points,
          offense_time_of_possession: teamWeeklyStat.offense_time_of_possession,
          offense_pass_plays: teamWeeklyStat.offense_pass_plays,
          offense_run_plays: teamWeeklyStat.offense_run_plays,
          offense_pass_completions: teamWeeklyStat.offense_pass_completions,
          offense_wide_receiver_targets: teamWeeklyStat.offense_wide_receiver_targets,
          offense_wide_receiver_receptions: teamWeeklyStat.offense_wide_receiver_receptions,
          offense_wide_receiver_receiving_yards: teamWeeklyStat.offense_wide_receiver_receiving_yards,
          offense_wide_receiver_receiving_touchdowns: teamWeeklyStat.offense_wide_receiver_receiving_touchdowns,
          offense_tight_end_targets: teamWeeklyStat.offense_tight_end_targets,
          offense_tight_end_receptions: teamWeeklyStat.offense_tight_end_receptions,
          offense_tight_end_receiving_yards: teamWeeklyStat.offense_tight_end_receiving_yards,
          offense_tight_end_receiving_touchdowns: teamWeeklyStat.offense_tight_end_receiving_touchdowns,
          offense_running_back_targets: teamWeeklyStat.offense_running_back_targets,
          offense_running_back_receptions: teamWeeklyStat.offense_running_back_receptions,
          offense_running_back_receiving_yards: teamWeeklyStat.offense_running_back_receiving_yards,
          offense_running_back_receiving_touchdowns: teamWeeklyStat.offense_running_back_receiving_touchdowns,
          offense_running_back_rushing_touchdowns: teamWeeklyStat.offense_running_back_rushing_touchdowns,
          offense_running_back_rushing_yards: teamWeeklyStat.offense_running_back_rushing_yards,
          offense_quarterback_rushing_touchdowns: teamWeeklyStat.offense_quarterback_rushing_touchdowns,
          offense_quarterback_rushing_yards: teamWeeklyStat.offense_quarterback_rushing_yards,
          defense_wide_receiver_receptions_allowed: teamWeeklyStat.defense_wide_receiver_receptions_allowed,
          defense_wide_receiver_receiving_yards_allowed: teamWeeklyStat.defense_wide_receiver_receiving_yards_allowed,
          defense_wide_receiver_receiving_touchdowns_allowed: teamWeeklyStat.defense_wide_receiver_receiving_touchdowns_allowed,
          defense_tight_end_receptions_allowed: teamWeeklyStat.defense_tight_end_receptions_allowed,
          defense_tight_end_receiving_yards_allowed: teamWeeklyStat.defense_tight_end_receiving_yards_allowed,
          defense_tight_end_receiving_touchdowns_allowed: teamWeeklyStat.defense_tight_end_receiving_touchdowns_allowed,
          defense_running_back_receptions_allowed: teamWeeklyStat.defense_running_back_receptions_allowed,
          defense_running_back_receiving_yards_allowed: teamWeeklyStat.defense_running_back_receiving_yards_allowed,
          defense_running_back_receiving_touchdowns_allowed: teamWeeklyStat.defense_running_back_receiving_touchdowns_allowed,
          defense_running_back_rushing_touchdowns_allowed: teamWeeklyStat.defense_running_back_rushing_touchdowns_allowed,
          defense_running_back_rush_yards_allowed: teamWeeklyStat.defense_running_back_rush_yards_allowed,
          defense_quarterback_rushing_touchdowns_allowed: teamWeeklyStat.defense_quarterback_rushing_touchdowns_allowed,
          defense_quarterback_rushing_yards_allowed: teamWeeklyStat.defense_quarterback_rushing_yards_allowed,
          offense_points_scored: teamWeeklyStat.offense_points_scored,
          defense_points_allowed: teamWeeklyStat.defense_points_allowed,
          offense_touchdowns: teamWeeklyStat.offense_touchdowns,
          offense_field_goals_made: teamWeeklyStat.offense_field_goals_made,
          offense_field_goals_attempted: teamWeeklyStat.offense_field_goals_attempted,
          defense_touchdowns_allowed: teamWeeklyStat.defense_touchdowns_allowed,
          defense_field_goals_allowed: teamWeeklyStat.defense_field_goals_allowed,
          offense_extra_points: teamWeeklyStat.offense_extra_points,
          offense_two_point_conversions: teamWeeklyStat.offense_two_point_conversions,
          offense_total_passing_touchdowns: teamWeeklyStat.offense_total_passing_touchdowns,
          offense_total_rushing_touchdowns: teamWeeklyStat.offense_total_rushing_touchdowns,
          offense_passing_yards: teamWeeklyStat.offense_passing_yards,
          defense_passing_yards_allowed: teamWeeklyStat.defense_passing_yards_allowed,
          offense_rushing_yards: teamWeeklyStat.offense_rushing_yards,
          defense_rushing_yards_allowed: teamWeeklyStat.defense_rushing_yards_allowed,
          defense_interceptions: teamWeeklyStat.defense_interceptions,
          offense_interceptions_thrown: teamWeeklyStat.offense_interceptions_thrown,
          offense_sacks_allowed: teamWeeklyStat.offense_sacks_allowed,
          defense_sacks: teamWeeklyStat.defense_sacks,
          offense_fumbles_lost: teamWeeklyStat.offense_fumbles_lost,
          defense_fumbles_recovered: teamWeeklyStat.defense_fumbles_recovered,
          defense_fumble_touchdowns: teamWeeklyStat.defense_fumble_touchdowns,
          defense_interception_touchdowns: teamWeeklyStat.defense_interception_touchdowns,
          created_at: teamWeeklyStat.created_at,
          updated_at: teamWeeklyStat.updated_at,
        });
      }

      // NFL Team Season Stats
      const cleaned_team_season_stats = [];
      for (const teamSeasonStat of nflTeamSeasonStats.data) {
        cleaned_team_season_stats.push({
          id: teamSeasonStat.id,
          team_id: teamSeasonStat.team_id,
          year: teamSeasonStat.year,
          wins: teamSeasonStat.wins,
          losses: teamSeasonStat.losses,
          offense_total_plays: teamSeasonStat.offense_total_plays,
          defense_total_plays: teamSeasonStat.defense_total_plays,
          offense_redzone_plays: teamSeasonStat.offense_redzone_plays,
          defense_redzone_plays: teamSeasonStat.defense_redzone_plays,
          offense_redzone_trips: teamSeasonStat.offense_redzone_trips,
          offense_redzone_success_touchdown: teamSeasonStat.offense_redzone_success_touchdown,
          offense_redzone_success_field_goal: teamSeasonStat.offense_redzone_success_field_goal,
          defense_redzone_trips_allowed: teamSeasonStat.defense_redzone_trips_allowed,
          defense_redzone_touchdowns: teamSeasonStat.defense_redzone_touchdowns,
          defense_redzone_field_goals: teamSeasonStat.defense_redzone_field_goals,
          defense_redzone_no_points: teamSeasonStat.defense_redzone_no_points,
          offense_time_of_possession: teamSeasonStat.offense_time_of_possession,
          offense_pass_plays: teamSeasonStat.offense_pass_plays,
          offense_run_plays: teamSeasonStat.offense_run_plays,
          offense_pass_completions: teamSeasonStat.offense_pass_completions,
          offense_wide_receiver_targets: teamSeasonStat.offense_wide_receiver_targets,
          offense_wide_receiver_receptions: teamSeasonStat.offense_wide_receiver_receptions,
          offense_wide_receiver_receiving_yards: teamSeasonStat.offense_wide_receiver_receiving_yards,
          offense_wide_receiver_receiving_touchdowns: teamSeasonStat.offense_wide_receiver_receiving_touchdowns,
          offense_tight_end_targets: teamSeasonStat.offense_tight_end_targets,
          offense_tight_end_receptions: teamSeasonStat.offense_tight_end_receptions,
          offense_tight_end_receiving_yards: teamSeasonStat.offense_tight_end_receiving_yards,
          offense_tight_end_receiving_touchdowns: teamSeasonStat.offense_tight_end_receiving_touchdowns,
          offense_running_back_targets: teamSeasonStat.offense_running_back_targets,
          offense_running_back_receptions: teamSeasonStat.offense_running_back_receptions,
          offense_running_back_receiving_yards: teamSeasonStat.offense_running_back_receiving_yards,
          offense_running_back_receiving_touchdowns: teamSeasonStat.offense_running_back_receiving_touchdowns,
          offense_running_back_rushing_touchdowns: teamSeasonStat.offense_running_back_rushing_touchdowns,
          offense_running_back_rushing_yards: teamSeasonStat.offense_running_back_rushing_yards,
          offense_quarterback_rushing_touchdowns: teamSeasonStat.offense_quarterback_rushing_touchdowns,
          offense_quarterback_rushing_yards: teamSeasonStat.offense_quarterback_rushing_yards,
          defense_wide_receiver_receptions_allowed: teamSeasonStat.defense_wide_receiver_receptions_allowed,
          defense_wide_receiver_receiving_yards_allowed: teamSeasonStat.defense_wide_receiver_receiving_yards_allowed,
          defense_wide_receiver_receiving_touchdowns_allowed: teamSeasonStat.defense_wide_receiver_receiving_touchdowns_allowed,
          defense_tight_end_receptions_allowed: teamSeasonStat.defense_tight_end_receptions_allowed,
          defense_tight_end_receiving_yards_allowed: teamSeasonStat.defense_tight_end_receiving_yards_allowed,
          defense_tight_end_receiving_touchdowns_allowed: teamSeasonStat.defense_tight_end_receiving_touchdowns_allowed,
          defense_running_back_receptions_allowed: teamSeasonStat.defense_running_back_receptions_allowed,
          defense_running_back_receiving_yards_allowed: teamSeasonStat.defense_running_back_receiving_yards_allowed,
          defense_running_back_receiving_touchdowns_allowed: teamSeasonStat.defense_running_back_receiving_touchdowns_allowed,
          defense_running_back_rushing_touchdowns_allowed: teamSeasonStat.defense_running_back_rushing_touchdowns_allowed,
          defense_running_back_rush_yards_allowed: teamSeasonStat.defense_running_back_rush_yards_allowed,
          defense_quarterback_rushing_touchdowns_allowed: teamSeasonStat.defense_quarterback_rushing_touchdowns_allowed,
          defense_quarterback_rushing_yards_allowed: teamSeasonStat.defense_quarterback_rushing_yards_allowed,
          offense_points_scored: teamSeasonStat.offense_points_scored,
          defense_points_allowed: teamSeasonStat.defense_points_allowed,
          offense_touchdowns: teamSeasonStat.offense_touchdowns,
          offense_field_goals_made: teamSeasonStat.offense_field_goals_made,
          offense_field_goals_attempted: teamSeasonStat.offense_field_goals_attempted,
          defense_touchdowns_allowed: teamSeasonStat.defense_touchdowns_allowed,
          defense_field_goals_allowed: teamSeasonStat.defense_field_goals_allowed,
          offense_extra_points: teamSeasonStat.offense_extra_points,
          offense_two_point_conversions: teamSeasonStat.offense_two_point_conversions,
          offense_total_passing_touchdowns: teamSeasonStat.offense_total_passing_touchdowns,
          offense_total_rushing_touchdowns: teamSeasonStat.offense_total_rushing_touchdowns,
          offense_passing_yards: teamSeasonStat.offense_passing_yards,
          defense_passing_yards_allowed: teamSeasonStat.defense_passing_yards_allowed,
          offense_rushing_yards: teamSeasonStat.offense_rushing_yards,
          defense_rushing_yards_allowed: teamSeasonStat.defense_rushing_yards_allowed,
          defense_interceptions: teamSeasonStat.defense_interceptions,
          offense_interceptions_thrown: teamSeasonStat.offense_interceptions_thrown,
          offense_sacks_allowed: teamSeasonStat.offense_sacks_allowed,
          defense_sacks: teamSeasonStat.defense_sacks,
          offense_fumbles_lost: teamSeasonStat.offense_fumbles_lost,
          defense_fumbles_recovered: teamSeasonStat.defense_fumbles_recovered,
          defense_fumble_touchdowns: teamSeasonStat.defense_fumble_touchdowns,
          defense_interception_touchdowns: teamSeasonStat.defense_interception_touchdowns,
          created_at: teamSeasonStat.created_at,
          updated_at: teamSeasonStat.updated_at,
        });
      }

      // NFL Players
      const cleaned_players = [];
      for (const player of nflPlayers.data) {
        cleaned_players.push({
          id: player.id,
          espn_player_id: player.espn_player_id,
          adp_std: 1000, // average draft position standard league
          adp_ppr: 1000, // average draft position ppr league
          adp_half_ppr: 1000, // average draft position half ppr league
          first_name: player.first_name,
          last_name: player.last_name,
          position: player.position,
          team_id: player.team_id,
          fp_adp_std_avg: player.fp_adp_std_avg,
          fp_adp_ppr_avg: player.fp_adp_ppr_avg,
          fp_adp_half_ppr_avg: player.fp_adp_half_ppr_avg
        });
      }

      setData({
        nflTeams: cleaned_teams,
        nflPlayers: cleaned_players,
        nflSchedule: cleaned_games,
        nflPlayerWeeklyStats: cleanedPlayerWeeklyStats,
        nflPlayerSeasonStats: cleanedNFLPlayerSeasonStats,
        nflTeamWeeklyStats: cleaned_team_weekly_stats,
        nflTeamSeasonStats: cleaned_team_season_stats
      });
    }
    if (year) {
      fetchAll(year);
    }
  }, [year]);

  return (
    <NFLDataContext.Provider value={data}>
      {children}
    </NFLDataContext.Provider>
  );
}

export function useNFLData() {
  const context = useContext(NFLDataContext);
  if (!context) throw new Error("useNFLData must be used within NFLDataProvider");
  return context;
}
