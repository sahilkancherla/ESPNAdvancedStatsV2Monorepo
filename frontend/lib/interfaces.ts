interface League {
    id: string
    teamId: string // the id of my team in this league
    adminUserId: string
    externalLeagueId: string
    espnS2: string
    swid: string
    teams: LeagueTeam[]
}

interface LeagueTeam {
    id: string
    team_name: string
    team_abbrev: string
    espn_team_id: number
}

interface NFLPlayer {
    id: string
    espn_player_id: number
    adp_std: number // average draft position standard league
    adp_ppr: number // average draft position ppr league
    adp_half_ppr: number // average draft position half ppr league
    first_name: string
    last_name: string
    position: string
    team_id: string
    fp_adp_std_avg: number
    fp_adp_ppr_avg: number
    fp_adp_half_ppr_avg: number
    // weekly_stats_last_season: NFLPlayerWeeklyStats[]
    // weekly_stats_this_season: NFLPlayerWeeklyStats[]
}

interface NFLPlayerWeeklyStats {
    id: string
    player_id: string
    game_id: string
    week: number
    year: number
    injured: boolean
    got_injured: boolean
    passing_touchdowns: number
    passing_attempts: number
    passing_completions: number
    passing_incompletions: number
    passing_interceptions: number
    passing_yards: number
    rushing_touchdowns: number
    rushing_attempts: number
    rushing_yards: number
    rush_attempts_inside_20: number
    rush_attempts_inside_10: number
    rush_attempts_inside_5: number
    rush_attempts_inside_2: number
    rushes_on_1st_down: number
    rushes_on_2nd_down: number
    rushes_on_3rd_down: number
    rushes_10_plus: number
    rushes_20_plus: number
    receptions: number
    receiving_yards: number
    receiving_touchdowns: number
    receiving_yards_after_catch: number
    targets: number
    targets_on_1st_down: number
    targets_on_2nd_down: number
    targets_on_3rd_down: number
    targets_10_plus: number
    targets_20_plus: number
    targets_inside_20: number
    targets_inside_10: number
    created_at: string
    updated_at: string
}

interface NFLPlayerSeasonStats {
    id: string
    player_id: string
    year: number
    games_played: number
    passing_touchdowns: number
    passing_attempts: number
    passing_completions: number
    passing_incompletions: number
    passing_interceptions: number
    passing_yards: number
    rushing_touchdowns: number
    rushing_attempts: number
    rushing_yards: number
    rush_attempts_inside_20: number
    rush_attempts_inside_10: number
    rush_attempts_inside_5: number
    rush_attempts_inside_2: number
    rushes_on_1st_down: number
    rushes_on_2nd_down: number
    rushes_on_3rd_down: number
    rushes_10_plus: number
    rushes_20_plus: number
    receptions: number
    receiving_yards: number
    receiving_touchdowns: number
    receiving_yards_after_catch: number
    targets: number
    targets_on_1st_down: number
    targets_on_2nd_down: number
    targets_on_3rd_down: number
    targets_10_plus: number
    targets_20_plus: number
    targets_inside_20: number
    targets_inside_10: number
    created_at: string
    updated_at: string
}

interface NFLTeam {
    id: string
    espn_team_id: number
    team_name: string
    team_abbrev: string
    bye_week: number
    espn_defense_dt_ranking: number
    espn_defense_edge_ranking: number
    espn_defense_lb_ranking: number
    espn_defense_cb_ranking: number
    espn_defense_s_ranking: number
    espn_offensive_line_ranking: number
    the_huddle_run_blocking_ranking: number
    the_huddle_pass_blocking_ranking: number
    the_huddle_overall_offensive_line_ranking: number
    pff_defensive_line_ranking: number
    pff_offensive_line_ranking: number
    schedule: NFLGame[]
}

interface NFLTeamWeeklyStats {
    id: string
    team_id: string
    week: number
    year: number
}

interface NFLTeamSeasonStats {
    id: string
    team_id: string
    year: number
}

interface NFLGame {
    id: string
    week: number
    year: number
    home_team_id: string
    away_team_id: string
}

interface FantasyTeam {
    id: string;
    user_id: string | null;
    league_id: string;
    team_name: string;
    espn_team_id: number;
    team_abbrev: string;
}

interface FantasyTeamWeeklyStats {
    id: string;
    league_id: string;
    team_id: string;
    week: number;
    year: number;
    win: boolean;
    points_for: number;
    points_against: number;
    max_possible_points: number;
    opponent_team_id: string;
    created_at: string;
    updated_at: string;
    projected_points: number;
}
interface FantasyTeamSeasonStats {
    id: string;
    league_id: string;
    team_id: string;
    year: number;
    wins: number;
    losses: number;
    points_for: number;
    points_against: number;
    max_possible_points: number;
    created_at: string;
    updated_at: string;
}
interface FantasyPlayerWeeklyStats {
    id: string;
    player_id: string;
    game_id: string | null;
    week: number;
    year: number;
    team_id: string;
    projected_fantasy_points: number;
    actual_fantasy_points: number;
    created_at: string;
    updated_at: string;
    league_id: string;
    slot: string | null;
}
interface FantasyPlayerSeasonStats {
    id: string;
    player_id: string;
    year: number;
    games_played: number;
    avg_projected_fantasy_points: number;
    std_dev_projected_fantasy_points: number;
    avg_actual_fantasy_points: number;
    std_dev_actual_fantasy_points: number;
    total_points: number;
    created_at: string;
    updated_at: string;
    league_id: string;
}

interface FantasyDraftPick {
    id: string;
    league_id: string;
    team_id: string;
    player_id: string;
    round_number: number;
    pick_number: number;
}

interface BigBoardPlayer extends NFLPlayer {
    big_board_id: string;
    rank: number;
    tier: number;
    notes: string;
    label: string;
    drafted: boolean;
}

interface DraftPick extends NFLPlayer{
    drafted_team_id: string
    drafted_team_name: string
    drafted_team_abbrev: string
    pick_number: number
    slot: string | null
}

interface DraftPosition {
    id: string
    team_id: string
    pick_number: number
}

interface FantasyMockDraft {
    id: string
    league_id: string
    team_id: string
    rounds: number
    title: string
    description: string
    created_at: string
    updated_at: string
}

interface FantasyMockDraftPick {
    id: string
    fantasy_mock_draft_id: string
    round_number: number
    pick_number: number
    overall_pick: number
    drafting_team_id: string
    player_id: string
    notes: string
}