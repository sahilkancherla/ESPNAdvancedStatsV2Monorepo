from dotenv import load_dotenv
from espn_api.football import League
from supabase import create_client, Client
import nfl_data_py as nfl
import pandas as pd
from .supabase_helper import get_team_abbrev_to_team_id_map, get_game_id_for_team_in_week, get_player_id_to_team_id_map, get_nfl_data_player_id_to_db_player_id_map
import json

load_dotenv()

team_map = {
    "BUF": "Buffalo Bills",
    "NYG": "New York Giants",
    "HOU": "Houston Texans",
    "PIT": "Pittsburgh Steelers",
    "IND": "Indianapolis Colts",
    "DEN": "Denver Broncos",
    "CLE": "Cleveland Browns",
    "NYJ": "New York Jets",
    "BAL": "Baltimore Ravens",
    "WAS": "Washington Commanders",
    "CAR": "Carolina Panthers",
    "GB": "Green Bay Packers",
    "SEA": "Seattle Seahawks",
    "NO": "New Orleans Saints",
    "PHI": "Philadelphia Eagles",
    "ATL": "Atlanta Falcons",
    "SF": "San Francisco 49ers",
    "LV": "Las Vegas Raiders",
    "ARI": "Arizona Cardinals",
    "MIA": "Miami Dolphins",
    "LAC": "Los Angeles Chargers",
    "JAX": "Jacksonville Jaguars",
    "TEN": "Tennessee Titans",
    "DAL": "Dallas Cowboys",
    "CHI": "Chicago Bears",
    "MIN": "Minnesota Vikings",
    "LA": "Los Angeles Rams",
    "DET": "Detroit Lions",
    "TB": "Tampa Bay Buccaneers",
    "NE": "New England Patriots",
    "KC": "Kansas City Chiefs",
    "CIN": "Cincinnati Bengals"
}

def get_team_stat_schema():
    return {
        "offense_total_plays": 0,
        "defense_total_plays": 0,
        "offense_redzone_plays": 0,
        "defense_redzone_plays": 0,
        "offense_redzone_trips": 0,
        "offense_redzone_success_touchdown": 0,
        "offense_redzone_success_field_goal": 0,
        "defense_redzone_trips_allowed": 0,
        "defense_redzone_touchdowns": 0,
        "defense_redzone_field_goals": 0,
        "defense_redzone_no_points": 0,
        "offense_time_of_possession": 0,
        "offense_pass_plays": 0,
        "offense_run_plays": 0,
        "offense_pass_completions": 0,
        "offense_wide_receiver_targets": 0,
        "offense_wide_receiver_receptions": 0,
        "offense_wide_receiver_receiving_yards": 0,
        "offense_wide_receiver_receiving_touchdowns": 0,
        "offense_tight_end_targets": 0,
        "offense_tight_end_receptions": 0,
        "offense_tight_end_receiving_yards": 0,
        "offense_tight_end_receiving_touchdowns": 0,
        "offense_running_back_targets": 0,
        "offense_running_back_receptions": 0,
        "offense_running_back_receiving_yards": 0,
        "offense_running_back_receiving_touchdowns": 0,
        "offense_running_back_rushing_touchdowns": 0,
        "offense_running_back_rushing_yards": 0,
        "offense_quarterback_rushing_touchdowns": 0,
        "offense_quarterback_rushing_yards": 0,
        "defense_wide_receiver_receptions_allowed": 0,
        "defense_wide_receiver_receiving_yards_allowed": 0,
        "defense_wide_receiver_receiving_touchdowns_allowed": 0,
        "defense_tight_end_receptions_allowed": 0,
        "defense_tight_end_receiving_yards_allowed": 0,
        "defense_tight_end_receiving_touchdowns_allowed": 0,
        "defense_running_back_receptions_allowed": 0,
        "defense_running_back_receiving_yards_allowed": 0,
        "defense_running_back_receiving_touchdowns_allowed": 0,
        "defense_running_back_rushing_touchdowns_allowed": 0,
        "defense_running_back_rush_yards_allowed": 0,
        "defense_quarterback_rushing_touchdowns_allowed": 0,
        "defense_quarterback_rushing_yards_allowed": 0,
        "offense_points_scored": 0,
        "defense_points_allowed": 0,
        "offense_touchdowns": 0,
        "offense_field_goals_made": 0,
        "offense_field_goals_attempted": 0,
        "defense_touchdowns_allowed": 0,
        "defense_field_goals_allowed": 0,
        "offense_extra_points": 0,
        "offense_two_point_conversions": 0,
        "offense_total_passing_touchdowns": 0,
        "offense_total_rushing_touchdowns": 0,
        "offense_passing_yards": 0,
        "defense_passing_yards_allowed": 0,
        "offense_rushing_yards": 0,
        "defense_rushing_yards_allowed": 0,
        "defense_interceptions": 0,
        "offense_interceptions_thrown": 0,
        "offense_sacks_allowed": 0,
        "defense_sacks": 0,
        "offense_fumbles_lost": 0,
        "defense_fumbles_recovered": 0,
        "defense_fumble_touchdowns": 0,
        "defense_interception_touchdowns": 0
    }

def get_player_stat_schema():
    return {
        "player_id": "",
        "passing_touchdowns": 0,
        "passing_attempts": 0,
        "passing_completions": 0,
        "passing_incompletions": 0,
        "passing_interceptions": 0,
        "passing_yards": 0,
        "rushing_touchdowns": 0,
        "rushing_attempts": 0,
        "rushing_yards": 0,
        "rush_attempts_inside_20": 0,
        "rush_attempts_inside_10": 0,
        "rush_attempts_inside_5": 0,
        "rush_attempts_inside_2": 0,
        "rushes_on_1st_down": 0,
        "rushes_on_2nd_down": 0,
        "rushes_on_3rd_down": 0,
        "rushes_10_plus": 0,
        "rushes_20_plus": 0,
        "receptions": 0,
        "receiving_yards": 0,
        "receiving_touchdowns": 0,
        "receiving_yards_after_catch": 0,
        "targets": 0,
        "targets_on_1st_down": 0,
        "targets_on_2nd_down": 0,
        "targets_on_3rd_down": 0,
        "targets_10_plus": 0,
        "targets_20_plus": 0,
        "targets_inside_20": 0,
        "targets_inside_10": 0,
    }

def get_nfl_data_player_id_to_espn_id_map(df):
    player_id_to_espn_id_map = {}
    for index, row in df.iterrows():
        player_id_to_espn_id_map[row['player_id']] = row['espn_id']
    return player_id_to_espn_id_map

def populate_nfl_data(current_week, year, updateWeeksBeforeCurrentWeek, supabase_client):
    years = [year]
    
    # 1. Import all data to process
    print("Importing data...")
    weekly_roster_df = nfl.import_weekly_rosters(years)
    df = nfl.import_pbp_data(years, downcast=True, cache=False)
    roster_data = nfl.import_seasonal_rosters(years)
    
    # 2. Get the team abbrev to team id map, player id to team id map to help later
    print("Getting stats ready...")
    team_abbrev_to_team_id_map = get_team_abbrev_to_team_id_map(supabase_client)
    player_id_to_team_id_map = get_player_id_to_team_id_map(supabase_client)
    nfl_data_player_id_to_espn_id_map = get_nfl_data_player_id_to_espn_id_map(roster_data)
    nfl_data_player_id_to_db_player_id_map = get_nfl_data_player_id_to_db_player_id_map(supabase_client, nfl_data_player_id_to_espn_id_map)

    # 3. (Part 1) Insert team weekly data
    
    # if user wants to update weeks before current week, we need to insert all the weeks before current week
    if updateWeeksBeforeCurrentWeek:
        for week in range(1, current_week + 1):
            print(f"Inserting team weekly data for week {week} of year {year}")
            weekly_data = get_nfl_team_weekly_stats(df, weekly_roster_df, week)
            insert_nfl_team_weekly_stats_into_db(weekly_data, team_abbrev_to_team_id_map, supabase_client, week, year)
            print(f"Done inserting data for week {week} of year {year}")
    # otherwise, we just insert the current week
    else:
        print(f"Inserting team weekly data for week {current_week} of year {year}")
        weekly_data = get_nfl_team_weekly_stats(df, weekly_roster_df, current_week)
        insert_nfl_team_weekly_stats_into_db(weekly_data, team_abbrev_to_team_id_map, supabase_client, current_week, year)
        print(f"Done inserting data for week {current_week} of year {year}")
    
    # 4. Insert team season data
    print(f"Inserting team season data for year {year}")
    season_data = get_nfl_team_season_stats(df, weekly_roster_df, current_week)
    insert_nfl_team_season_stats_into_db(season_data, team_abbrev_to_team_id_map, supabase_client, year)
    print(f"Done inserting season data for year {year}")
    
    # 5. (Part 2) Insert player weekly data
    if updateWeeksBeforeCurrentWeek:
        for week in range(1, current_week + 1):
            print(f"Inserting player weekly data for week {week} of year {year}")
            player_weekly_data = get_nfl_weekly_player_stats(df, weekly_roster_df, week)
            insert_nfl_player_weekly_stats_into_db(player_weekly_data, player_id_to_team_id_map, nfl_data_player_id_to_db_player_id_map, supabase_client, week, year)
            print(f"Done inserting data for week {week} of year {year}")
    # otherwise, we just insert the current week
    else:
        print(f"Inserting player weekly data for week {current_week} of year {year}")
        player_weekly_data = get_nfl_weekly_player_stats(df, weekly_roster_df, current_week) 
        insert_nfl_player_weekly_stats_into_db(player_weekly_data, player_id_to_team_id_map, nfl_data_player_id_to_db_player_id_map, supabase_client, current_week, year)
        print(f"Done inserting data for week {current_week} of year {year}")
        
    # 6. Insert player season data
    print(f"Inserting player season data for year {year}")
    season_player_stats = get_nfl_season_player_stats(df, weekly_roster_df, current_week)
    insert_nfl_player_season_stats_into_db(season_player_stats, nfl_data_player_id_to_db_player_id_map, supabase_client, year)
    print(f"Done inserting player season data for year {year}")
    
    print("Done with all inserts!")

# uses supabase to upsert nfl team weekly stats into the database
def insert_nfl_team_weekly_stats_into_db(weekly_data, team_abbrev_to_team_id_map, supabase_client, week, year):
    for team in weekly_data:
        team_id = team_abbrev_to_team_id_map[team]
        game_id = get_game_id_for_team_in_week(supabase_client, team_id, week, year)
        
        if game_id is None:
            print(f"No game id found for team {team} in week {week} of year {year}. They might be on bye.")
            continue
        
        data_to_insert = {
            "team_id": team_id,
            "game_id": game_id,
            "week": week,
            "year": year
        }
        
        # Add all stats to the data dictionary
        for stat in weekly_data[team]:
            data_to_insert[stat] = weekly_data[team][stat]
            
        supabase_client.table("nfl_team_weekly_stats").upsert(data_to_insert, on_conflict="team_id,game_id,week,year").execute()
    
# uses supabase to upsert nfl team season stats into the database
def insert_nfl_team_season_stats_into_db(season_data, team_abbrev_to_team_id_map, supabase_client, year):
    for team in season_data:
        team_id = team_abbrev_to_team_id_map[team]
        
        data_to_insert = {
            "team_id": team_id,
            "year": year
        }
        
        # Add all stats to the data dictionary
        for stat in season_data[team]:
            data_to_insert[stat] = season_data[team][stat]
            
        supabase_client.table("nfl_team_season_stats").upsert(data_to_insert, on_conflict="team_id,year").execute()

# uses supabase to upsert nfl player weekly stats into the database
def insert_nfl_player_weekly_stats_into_db(player_weekly_data, player_id_to_team_id_map, nfl_data_player_id_to_db_player_id_map, supabase_client, week, year):
    
    batch_data = []
    
    for player in player_weekly_data:
        
        if player not in nfl_data_player_id_to_db_player_id_map or len(player) == 0:
            continue
        
        player_id = nfl_data_player_id_to_db_player_id_map[player_weekly_data[player]["player_id"]]
        if not player_id:
            continue
        
        team_id = player_id_to_team_id_map[player_id]
        if team_id is None:
            continue
        
        game_id = get_game_id_for_team_in_week(supabase_client, team_id, week, year)
        if game_id is None:
            continue
        
        data_to_insert = {
            "player_id": player_id,
            "game_id": game_id,
            "week": week,
            "year": year
        }
        
        for stat in player_weekly_data[player]:
            if stat != "player_id":
                data_to_insert[stat] = player_weekly_data[player][stat]
        
        batch_data.append(data_to_insert)
    
    if batch_data:
        supabase_client.table("nfl_player_weekly_stats").upsert(batch_data, on_conflict="player_id,game_id,week,year").execute()
        print(f"Inserted {len(batch_data)} player weekly stats records")
    
# uses supabase to upsert nfl player season stats into the database
def insert_nfl_player_season_stats_into_db(player_season_data, nfl_data_player_id_to_db_player_id_map, supabase_client, year):
    batch_data = []
    
    for nfl_data_player_id in player_season_data:
        
        if nfl_data_player_id not in nfl_data_player_id_to_db_player_id_map or len(nfl_data_player_id) == 0:
            continue
                
        player_id = nfl_data_player_id_to_db_player_id_map[nfl_data_player_id]
        
        # Skip if mapped player_id is invalid
        if not player_id:
            continue
        
        data_to_insert = {
            "player_id": player_id,
            "year": year
        }
        
        for stat in player_season_data[nfl_data_player_id]:
            if stat != "player_id":
                data_to_insert[stat] = player_season_data[nfl_data_player_id][stat]
        
        batch_data.append(data_to_insert)
    
    if batch_data:
        supabase_client.table("nfl_player_season_stats").upsert(batch_data, on_conflict="player_id,year").execute()
        print(f"Inserted {len(batch_data)} player season stats records")
            
# returns a mapping of player_id to player_name, player_team, player_position
def get_weekly_roster_mapping(df, week):
    
    week_df = df[df['week'] == week]
    weekly_roster_mapping = {}
    
    for row in week_df.itertuples():
        player_name = row.player_name
        player_id = row.player_id
        
        if player_name not in weekly_roster_mapping:
            if row.position in ['TE', 'QB', 'WR', 'RB']:
                weekly_roster_mapping[player_id] = {
                    "player_name": player_name,
                    "player_id": player_id,
                    "player_team": row.team,
                    "player_position": row.position,
                }
                
    return weekly_roster_mapping

# gets nfl team weekly stats
def get_nfl_team_weekly_stats(df, weekly_roster_df, week):
    
    weekly_roster_mapping = get_weekly_roster_mapping(weekly_roster_df, week)
    week_df = df[df['week'] == week].copy()
    weekly_team_data = {}
    
    # Initialize team data
    for row in week_df.itertuples():
        home_team_abbrev = row.home_team
        away_team_abbrev = row.away_team
        
        if home_team_abbrev not in weekly_team_data:
            weekly_team_data[home_team_abbrev] = get_team_stat_schema()
        if away_team_abbrev not in weekly_team_data:
            weekly_team_data[away_team_abbrev] = get_team_stat_schema()
    
    # Track redzone trips and time of possession by team and game
    redzone_trips = {}
    game_drive_times = {}
    
    # Process each play
    for _, play in week_df.iterrows():
        home_team = play['home_team']
        away_team = play['away_team']
        posteam = play.get('posteam')
        defteam = play.get('defteam')
        
        # Skip plays without possession team
        if pd.isna(posteam) or pd.isna(defteam):
            continue
            
        # Determine if play counts (exclude timeouts, penalties without plays, etc.)
        play_type = play.get('play_type', '')
        if play_type in ['no_play', 'timeout', 'penalty']:
            continue
            
        # Get play details
        yardline_100 = play.get('yardline_100', 0) if pd.notna(play.get('yardline_100')) else 0
        yards_gained = play.get('yards_gained', 0) if pd.notna(play.get('yards_gained')) else 0
        pass_attempt = play.get('pass_attempt', 0) == 1
        rush_attempt = play.get('rush_attempt', 0) == 1
        
        # Basic play counting
        if pass_attempt or rush_attempt:
            weekly_team_data[posteam]['offense_total_plays'] += 1
            weekly_team_data[defteam]['defense_total_plays'] += 1
            
            # Pass vs Run plays
            if pass_attempt:
                weekly_team_data[posteam]['offense_pass_plays'] += 1
            elif rush_attempt:
                weekly_team_data[posteam]['offense_run_plays'] += 1
        
        # Redzone plays (inside 20 yard line)
        if yardline_100 <= 20 and yardline_100 > 0 and (pass_attempt or rush_attempt):
            weekly_team_data[posteam]['offense_redzone_plays'] += 1
            weekly_team_data[defteam]['defense_redzone_plays'] += 1
        
        # Track redzone trips
        game_id = play.get('game_id')
        drive_id = f"{game_id}_{play.get('drive')}"
        
        if yardline_100 <= 20 and yardline_100 > 0 and drive_id not in redzone_trips:
            redzone_trips[drive_id] = {
                'posteam': posteam,
                'defteam': defteam,
                'scored': False,
                'score_type': None
            }
        
        # Check for redzone success (touchdown or field goal)
        if drive_id in redzone_trips and not redzone_trips[drive_id]['scored']:
            if play.get('touchdown', 0) == 1:
                redzone_trips[drive_id]['scored'] = True
                redzone_trips[drive_id]['score_type'] = 'touchdown'
            elif play.get('field_goal_result') == 'made':
                redzone_trips[drive_id]['scored'] = True
                redzone_trips[drive_id]['score_type'] = 'field_goal'
        
        # Time of possession tracking using drive data
        drive_top = play.get('drive_time_of_possession')
        if pd.notna(drive_top) and drive_id not in game_drive_times:
            game_drive_times[drive_id] = {
                'posteam': posteam,
                'time': drive_top
            }
        
        # Passing statistics - need to infer position from player name patterns or use available data
        if pass_attempt:
            receiver_player_id = play.get('receiver_player_id')
            complete_pass = play.get('complete_pass', 0) == 1
            receiving_yards = play.get('receiving_yards', 0) if pd.notna(play.get('receiving_yards')) else 0
            passing_td = play.get('pass_touchdown', 0) == 1
            
            # Track completions
            if complete_pass:
                weekly_team_data[posteam]['offense_pass_completions'] += 1
            
            # Since position data isn't directly available, we'll aggregate all receiving stats
            # and assume they're distributed across positions (could be enhanced with player lookup)
            if pd.notna(receiver_player_id):  # Valid target
                if receiver_player_id in weekly_roster_mapping:
                    receiver_position = weekly_roster_mapping[receiver_player_id]['player_position']
                    if receiver_position == 'WR':
                        weekly_team_data[posteam]['offense_wide_receiver_targets'] += 1
                    elif receiver_position == 'TE':
                        weekly_team_data[posteam]['offense_tight_end_targets'] += 1
                    elif receiver_position == 'RB':
                        weekly_team_data[posteam]['offense_running_back_targets'] += 1
            
            # Total passing stats (we can definitely calculate these)
            if complete_pass:
                weekly_team_data[posteam]['offense_passing_yards'] += receiving_yards
                weekly_team_data[defteam]['defense_passing_yards_allowed'] += receiving_yards
                
                if receiver_player_id in weekly_roster_mapping:
                    receiver_position = weekly_roster_mapping[receiver_player_id]['player_position']
                    if receiver_position == 'WR':
                        weekly_team_data[posteam]['offense_wide_receiver_receptions'] += 1
                        weekly_team_data[posteam]['offense_wide_receiver_receiving_yards'] += receiving_yards
                        weekly_team_data[defteam]['defense_wide_receiver_receptions_allowed'] += 1
                        weekly_team_data[defteam]['defense_wide_receiver_receiving_yards_allowed'] += receiving_yards
                    elif receiver_position == 'TE':
                        weekly_team_data[posteam]['offense_tight_end_receptions'] += 1
                        weekly_team_data[posteam]['offense_tight_end_receiving_yards'] += receiving_yards
                        weekly_team_data[defteam]['defense_tight_end_receptions_allowed'] += 1
                        weekly_team_data[defteam]['defense_tight_end_receiving_yards_allowed'] += receiving_yards
                    elif receiver_position == 'RB':
                        weekly_team_data[posteam]['offense_running_back_receptions'] += 1
                        weekly_team_data[posteam]['offense_running_back_receiving_yards'] += receiving_yards
                        weekly_team_data[defteam]['defense_running_back_receptions_allowed'] += 1
                        weekly_team_data[defteam]['defense_running_back_receiving_yards_allowed'] += receiving_yards    
            
            if passing_td:
                weekly_team_data[posteam]['offense_total_passing_touchdowns'] += 1
                if receiver_player_id in weekly_roster_mapping:
                    receiver_position = weekly_roster_mapping[receiver_player_id]['player_position']
                    if receiver_position == 'WR':
                        weekly_team_data[posteam]['offense_wide_receiver_receiving_touchdowns'] += 1
                        weekly_team_data[defteam]['defense_wide_receiver_receiving_touchdowns_allowed'] += 1
                    elif receiver_position == 'TE':
                        weekly_team_data[posteam]['offense_tight_end_receiving_touchdowns'] += 1
                        weekly_team_data[defteam]['defense_tight_end_receiving_touchdowns_allowed'] += 1
                    elif receiver_position == 'RB':
                        weekly_team_data[posteam]['offense_running_back_receiving_touchdowns'] += 1
                        weekly_team_data[defteam]['defense_running_back_receiving_touchdowns_allowed'] += 1
        
        # Rushing statistics
        if rush_attempt:
            rusher_player_id = play.get('rusher_player_id')
            rushing_yards = play.get('rushing_yards', 0) if pd.notna(play.get('rushing_yards')) else 0
            rush_td = play.get('rush_touchdown', 0) == 1
            
            weekly_team_data[posteam]['offense_rushing_yards'] += rushing_yards
            weekly_team_data[defteam]['defense_rushing_yards_allowed'] += rushing_yards
            
            if rusher_player_id in weekly_roster_mapping:
                rusher_position = weekly_roster_mapping[rusher_player_id]['player_position']
                if rusher_position == 'RB':
                    weekly_team_data[posteam]['offense_running_back_rushing_yards'] += rushing_yards
                    weekly_team_data[defteam]['defense_running_back_rush_yards_allowed'] += rushing_yards
                elif rusher_position == 'QB':
                    weekly_team_data[posteam]['offense_quarterback_rushing_yards'] += rushing_yards
                    weekly_team_data[defteam]['defense_quarterback_rushing_yards_allowed'] += rushing_yards
            
            if rush_td:
                weekly_team_data[posteam]['offense_total_rushing_touchdowns'] += 1
                if rusher_player_id in weekly_roster_mapping:
                    rusher_position = weekly_roster_mapping[rusher_player_id]['player_position']
                    if rusher_position == 'RB':
                        weekly_team_data[posteam]['offense_running_back_rushing_touchdowns'] += 1
                        weekly_team_data[defteam]['defense_running_back_rushing_touchdowns_allowed'] += 1
                    elif rusher_position == 'QB':
                        weekly_team_data[posteam]['offense_quarterback_rushing_touchdowns'] += 1
                        weekly_team_data[defteam]['defense_quarterback_rushing_touchdowns_allowed'] += 1
        
        # Interceptions
        if play.get('interception', 0) == 1:
            weekly_team_data[posteam]['offense_interceptions_thrown'] += 1
            weekly_team_data[defteam]['defense_interceptions'] += 1
            
            # Interception touchdowns
            if play.get('return_touchdown', 0) == 1:
                weekly_team_data[defteam]['defense_interception_touchdowns'] += 1
        
        # Sacks
        if play.get('sack', 0) == 1:
            weekly_team_data[posteam]['offense_sacks_allowed'] += 1
            weekly_team_data[defteam]['defense_sacks'] += 1
        
        # Fumbles
        if play.get('fumble_lost', 0) == 1:
            weekly_team_data[posteam]['offense_fumbles_lost'] += 1
            weekly_team_data[defteam]['defense_fumbles_recovered'] += 1
            
            # Fumble touchdowns
            if play.get('return_touchdown', 0) == 1:
                weekly_team_data[defteam]['defense_fumble_touchdowns'] += 1
        
        # Scoring plays
        if play.get('touchdown', 0) == 1:
            weekly_team_data[posteam]['offense_touchdowns'] += 1
            weekly_team_data[defteam]['defense_touchdowns_allowed'] += 1
        
        if play.get('field_goal_result') == 'made':
            weekly_team_data[posteam]['offense_field_goals_made'] += 1
            weekly_team_data[defteam]['defense_field_goals_allowed'] += 1
            weekly_team_data[posteam]['offense_field_goals_attempted'] += 1
        if play.get('field_goal_result') == 'missed':
            weekly_team_data[posteam]['offense_field_goals_attempted'] += 1
        
        if play.get('extra_point_result') == 'good':
            weekly_team_data[posteam]['offense_extra_points'] += 1
        
        if play.get('two_point_conv_result') == 'success':
            weekly_team_data[posteam]['offense_two_point_conversions'] += 1
            
    
    # Calculate redzone trips and successes
    for trip_info in redzone_trips.values():
        posteam = trip_info['posteam']
        defteam = trip_info['defteam']
        
        weekly_team_data[posteam]['offense_redzone_trips'] += 1
        weekly_team_data[defteam]['defense_redzone_trips_allowed'] += 1
        
        if trip_info['scored']:
            if trip_info['score_type'] == 'touchdown':
                weekly_team_data[posteam]['offense_redzone_success_touchdown'] += 1
                weekly_team_data[defteam]['defense_redzone_touchdowns'] += 1
            elif trip_info['score_type'] == 'field_goal':
                weekly_team_data[posteam]['offense_redzone_success_field_goal'] += 1
                weekly_team_data[defteam]['defense_redzone_field_goals'] += 1
        else:
            weekly_team_data[defteam]['defense_redzone_no_points'] += 1
    
    # Calculate time of possession from drive data
    for drive_info in game_drive_times.values():
        posteam = drive_info['posteam']
        drive_time = drive_info['time']
        if drive_time and drive_time != '':
            # Parse time format (MM:SS) and convert to minutes
            try:
                if ':' in str(drive_time):
                    minutes, seconds = map(int, str(drive_time).split(':'))
                    total_minutes = minutes + (seconds / 60.0)
                    weekly_team_data[posteam]['offense_time_of_possession'] += total_minutes
            except (ValueError, AttributeError):
                pass
    
    # Calculate total points using actual game scores
    for team in weekly_team_data:
        # Get total points from final scores of games this team played
        team_games = week_df[
            (week_df['home_team'] == team) | (week_df['away_team'] == team)
        ]
        
        total_points_scored = 0
        total_points_allowed = 0
        
        # Group by game and get final scores
        for game_id in team_games['game_id'].unique():
            game_plays = team_games[team_games['game_id'] == game_id]
            
            # Get final score from last play of game
            last_play = game_plays.iloc[-1]
            home_team = last_play['home_team']
            away_team = last_play['away_team']
            home_score = last_play.get('total_home_score', 0) or 0
            away_score = last_play.get('total_away_score', 0) or 0
            
            if team == home_team:
                total_points_scored += home_score
                total_points_allowed += away_score
            else:
                total_points_scored += away_score
                total_points_allowed += home_score
        
        weekly_team_data[team]['offense_points_scored'] = total_points_scored
        weekly_team_data[team]['defense_points_allowed'] = total_points_allowed
    
    # Convert all stats to integers
    for team in weekly_team_data:
        for stat, value in weekly_team_data[team].items():
            weekly_team_data[team][stat] = int(value)
    
    return weekly_team_data

# gets nfl team season stats
def get_nfl_team_season_stats(df, weekly_roster_df, current_week):
    season_stats = {}
    
    # initialize all the teams with empty stat schemas
    for team in team_map:
        season_stats[team] = get_team_stat_schema()
        
    # iterate through each week and sum up the stats
    for week in range(1, current_week + 1):
        print(f"Processing week {week}")
        
        weekly_data = get_nfl_team_weekly_stats(df, weekly_roster_df, week)
        
        # add the weekly stats to the season stats
        for team, stats in weekly_data.items():
            for stat, value in stats.items():
                season_stats[team][stat] += value
                
    return season_stats    
    
# gets nfl player weekly stats
def get_nfl_weekly_player_stats(df, weekly_roster_df, week):
    
    weekly_player_stats = {}
    weekly_roster_mapping = get_weekly_roster_mapping(weekly_roster_df, week)
    
    for player_id in weekly_roster_mapping:
        weekly_player_stats[player_id] = get_player_stat_schema()
        # weekly_player_stats[player_id]["player_name"] = weekly_roster_mapping[player_id]["player_name"]
        weekly_player_stats[player_id]["player_id"] = player_id
    
    
    week_df = df[df['week'] == week].copy()
    
    for row in week_df.itertuples():
        # Passing statistics
        if hasattr(row, 'passer_player_id') and row.passer_player_id in weekly_player_stats:
            
            player_id = row.passer_player_id
            
            # Passing attempts (any pass attempt)
            if hasattr(row, 'pass_attempt') and row.pass_attempt == 1:
                weekly_player_stats[player_id]["passing_attempts"] += 1
            
            # Passing completions
            if hasattr(row, 'complete_pass') and row.complete_pass == 1:
                weekly_player_stats[player_id]["passing_completions"] += 1
            
            # Passing incompletions
            if hasattr(row, 'incomplete_pass') and row.incomplete_pass == 1:
                weekly_player_stats[player_id]["passing_incompletions"] += 1
            
            # Passing interceptions
            if hasattr(row, 'interception') and row.interception == 1:
                weekly_player_stats[player_id]["passing_interceptions"] += 1
            
            # Passing yards
            if hasattr(row, 'passing_yards') and not pd.isna(row.passing_yards):
                weekly_player_stats[player_id]["passing_yards"] += row.passing_yards
            
            # Passing touchdowns
            if hasattr(row, 'pass_touchdown') and row.pass_touchdown == 1:
                weekly_player_stats[player_id]["passing_touchdowns"] += 1
        
        # Rushing statistics
        if hasattr(row, 'rusher_player_id') and row.rusher_player_id in weekly_player_stats:
            player_id = row.rusher_player_id
            
            # Rush attempts
            if hasattr(row, 'rush_attempt') and row.rush_attempt == 1:
                weekly_player_stats[player_id]["rushing_attempts"] += 1
                
                # Rush yards
                if hasattr(row, 'rushing_yards') and not pd.isna(row.rushing_yards):
                    weekly_player_stats[player_id]["rushing_yards"] += row.rushing_yards
                
                # Rushes by down
                if hasattr(row, 'down'):
                    if row.down == 1:
                        weekly_player_stats[player_id]["rushes_on_1st_down"] += 1
                    elif row.down == 2:
                        weekly_player_stats[player_id]["rushes_on_2nd_down"] += 1
                    elif row.down == 3:
                        weekly_player_stats[player_id]["rushes_on_3rd_down"] += 1
                
                # Rush distance categories
                if hasattr(row, 'rushing_yards') and not pd.isna(row.rushing_yards):
                    if row.rushing_yards >= 10:
                        weekly_player_stats[player_id]["rushes_10_plus"] += 1
                    if row.rushing_yards >= 20:
                        weekly_player_stats[player_id]["rushes_20_plus"] += 1
                
                # Rush attempts by field position
                if hasattr(row, 'yardline_100'):
                    if row.yardline_100 <= 20:
                        weekly_player_stats[player_id]["rush_attempts_inside_20"] += 1
                    if row.yardline_100 <= 10:
                        weekly_player_stats[player_id]["rush_attempts_inside_10"] += 1
                    if row.yardline_100 <= 5:
                        weekly_player_stats[player_id]["rush_attempts_inside_5"] += 1
                    if row.yardline_100 <= 2:
                        weekly_player_stats[player_id]["rush_attempts_inside_2"] += 1
            
            # Rush touchdowns
            if hasattr(row, 'rush_touchdown') and row.rush_touchdown == 1:
                weekly_player_stats[player_id]["rushing_touchdowns"] += 1
        
        # Receiving statistics
        if hasattr(row, 'receiver_player_id') and row.receiver_player_id in weekly_player_stats:
            player_id = row.receiver_player_id
            
            # Targets (any pass attempt to this receiver)
            if hasattr(row, 'pass_attempt') and row.pass_attempt == 1:
                weekly_player_stats[player_id]["targets"] += 1
                
                # Targets by down
                if hasattr(row, 'down'):
                    if row.down == 1:
                        weekly_player_stats[player_id]["targets_on_1st_down"] += 1
                    elif row.down == 2:
                        weekly_player_stats[player_id]["targets_on_2nd_down"] += 1
                    elif row.down == 3:
                        weekly_player_stats[player_id]["targets_on_3rd_down"] += 1
                
                # Targets by field position
                if hasattr(row, 'yardline_100'):
                    if row.yardline_100 <= 20:
                        weekly_player_stats[player_id]["targets_inside_20"] += 1
                    if row.yardline_100 <= 10:
                        weekly_player_stats[player_id]["targets_inside_10"] += 1
                
                # Target distance categories (for completions)
                if hasattr(row, 'complete_pass') and row.complete_pass == 1:
                    if hasattr(row, 'receiving_yards') and not pd.isna(row.receiving_yards):
                        if row.receiving_yards >= 10:
                            weekly_player_stats[player_id]["targets_10_plus"] += 1
                        if row.receiving_yards >= 20:
                            weekly_player_stats[player_id]["targets_20_plus"] += 1
            
            # Receptions
            if hasattr(row, 'complete_pass') and row.complete_pass == 1:
                weekly_player_stats[player_id]["receptions"] += 1
                
                # Receiving yards
                if hasattr(row, 'receiving_yards') and not pd.isna(row.receiving_yards):
                    weekly_player_stats[player_id]["receiving_yards"] += row.receiving_yards
                
                # Yards after catch
                if hasattr(row, 'yards_after_catch') and not pd.isna(row.yards_after_catch):
                    weekly_player_stats[player_id]["receiving_yards_after_catch"] += row.yards_after_catch
            
            # Receiving touchdowns
            if hasattr(row, 'pass_touchdown') and row.pass_touchdown == 1:
                weekly_player_stats[player_id]["receiving_touchdowns"] += 1
    
    # Ensure all stats are integers
    for player_id in weekly_player_stats:
        for stat, value in weekly_player_stats[player_id].items():
            if stat != "player_id":  # Skip non-numeric fields
                weekly_player_stats[player_id][stat] = int(value) if value is not None else 0
    return weekly_player_stats

# gets nfl player season stats
def get_nfl_season_player_stats(df, weekly_roster_df, final_week):
    
    season_player_stats = {}
    
    for week in range(1, final_week+1):
        print(f"Processing week {week}")
        weekly_roster_mapping = get_weekly_roster_mapping(weekly_roster_df, week)
        
        for player_id in weekly_roster_mapping:
            if player_id not in season_player_stats:
                season_player_stats[player_id] = get_player_stat_schema()
                
        weekly_player_stats = get_nfl_weekly_player_stats(df, weekly_roster_df, week)
        
        for player_id, stats in weekly_player_stats.items():
            for stat, value in stats.items():
                if stat != "player_id":
                    season_player_stats[player_id][stat] += value
                
    return season_player_stats    
