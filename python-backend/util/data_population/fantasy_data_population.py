from dotenv import load_dotenv
from espn_api.football import League
from supabase import create_client, Client
import nfl_data_py as nfl
import pandas as pd
import statistics
from .supabase_helper import get_league_id_from_espn_league_id, get_external_team_id_to_team_id_map, get_external_player_id_to_player_id_map, get_game_id_for_team_in_week

load_dotenv()

def populate_fantasy_data(external_league_id, swid, espn_s2, current_week, year, updateAllWeeks, supabase_client):
    print(f"Starting fantasy data population for league {external_league_id}, year {year}, current week {current_week}")
    
    league = League(league_id=external_league_id, year=year, espn_s2=espn_s2, swid=swid)
    print("ESPN League object created successfully")
    
    league_id = get_league_id_from_espn_league_id(supabase_client, external_league_id)
    print(f"Retrieved league_id: {league_id}")
    
    team_id_mapping = get_external_team_id_to_team_id_map(supabase_client, league_id)
    print(f"Retrieved team ID mapping for {len(team_id_mapping)} teams")
    
    player_id_mapping = get_external_player_id_to_player_id_map(supabase_client)
    print(f"Retrieved player ID mapping for {len(player_id_mapping)} players")

    if updateAllWeeks:
        print(f"Updating all weeks from 1 to {current_week}")
        # Update from week 1 to current_week
        for week in range(1, current_week + 1):
            print(f"Processing week {week}")
            
            fantasy_team_weekly_stats = get_fantasy_team_weekly_stats(league, team_id_mapping, week, year)
            print(f"Retrieved team weekly stats for week {week}")
            
            fantasy_player_weekly_stats = get_fantasy_player_weekly_stats(league, team_id_mapping, player_id_mapping, week, year)
            print(f"Retrieved player weekly stats for week {week}")
            
            insert_fantasy_team_weekly_stats_into_db(fantasy_team_weekly_stats, league_id, week, year, supabase_client)
            print(f"Inserted team weekly stats for week {week}")
            
            insert_fantasy_player_weekly_stats_into_db(fantasy_player_weekly_stats, league_id, week, year, supabase_client)
            print(f"Inserted player weekly stats for week {week}")
    else:
        print(f"Updating only current week: {current_week}")
        # Update only current week
        fantasy_team_weekly_stats = get_fantasy_team_weekly_stats(league, team_id_mapping, current_week, year)
        print(f"Retrieved team weekly stats for current week {current_week}")
        
        fantasy_player_weekly_stats = get_fantasy_player_weekly_stats(league, team_id_mapping, player_id_mapping, current_week, year)
        print(f"Retrieved player weekly stats for current week {current_week}")
        
        insert_fantasy_team_weekly_stats_into_db(fantasy_team_weekly_stats, league_id, current_week, year, supabase_client)
        print(f"Inserted team weekly stats for current week {current_week}")
        
        insert_fantasy_player_weekly_stats_into_db(fantasy_player_weekly_stats, league_id, current_week, year, supabase_client)
        print(f"Inserted player weekly stats for current week {current_week}")

    # Always update season stats
    print("Processing season stats")
    fantasy_team_season_stats = get_fantasy_team_season_stats(league, team_id_mapping, current_week, year)
    print("Retrieved team season stats")
    
    fantasy_player_yearly_stats = get_fantasy_player_yearly_stats(league, team_id_mapping, player_id_mapping, current_week, year)
    print("Retrieved player yearly stats")
    
    insert_fantasy_team_season_stats_into_db(fantasy_team_season_stats, league_id, year, supabase_client)
    print("Inserted team season stats")
    
    insert_fantasy_player_yearly_stats_into_db(fantasy_player_yearly_stats, league_id, year, supabase_client)
    print("Inserted player yearly stats")
    
    print("Fantasy data population completed successfully")


def insert_fantasy_team_weekly_stats_into_db(fantasy_team_weekly_stats, league_id, week, year, supabase_client):
    
    data_to_insert = []
    for team in fantasy_team_weekly_stats:
        data_to_insert.append({
            "league_id": league_id,
            "team_id": fantasy_team_weekly_stats[team]["team_id"],
            "projected_points": fantasy_team_weekly_stats[team]["projected_points"],
            "week": week,
            "year": year,
            "points_for": fantasy_team_weekly_stats[team]["points_for"],
            "points_against": fantasy_team_weekly_stats[team]["points_against"],
            "win": fantasy_team_weekly_stats[team]["win"],
            "opponent_team_id": fantasy_team_weekly_stats[team]["opponent_id"],
            "max_possible_points": fantasy_team_weekly_stats[team]["maximum_possible_points"]
        })
        
    supabase_client.table("fantasy_team_weekly_stats").upsert(data_to_insert, on_conflict="league_id,team_id,week,year").execute()

def insert_fantasy_team_season_stats_into_db(fantasy_team_season_stats, league_id, year, supabase_client):
    data_to_insert = []
    for team in fantasy_team_season_stats:
        data_to_insert.append({
            "league_id": league_id,
            "team_id": fantasy_team_season_stats[team]["team_id"],
            "year": year,
            "points_for": fantasy_team_season_stats[team]["points_for"],
            "points_against": fantasy_team_season_stats[team]["points_against"],
            "wins": fantasy_team_season_stats[team]["wins"],
            "losses": fantasy_team_season_stats[team]["losses"],
            "max_possible_points": fantasy_team_season_stats[team]["maximum_possible_points"]
        })
        
    supabase_client.table("fantasy_team_season_stats").upsert(data_to_insert, on_conflict="league_id,team_id,year").execute()

def insert_fantasy_player_weekly_stats_into_db(fantasy_player_weekly_stats, league_id, week, year, supabase_client):
    data_to_insert = []
    for player in fantasy_player_weekly_stats:        
        team_id = fantasy_player_weekly_stats[player].get("fantasy_team_id")
        
        data_to_insert.append({
            "league_id": league_id,
            "team_id": team_id,
            "player_id": fantasy_player_weekly_stats[player]["player_id"],
            "game_id": None,
            "week": week,
            "year": year,
            "actual_fantasy_points": fantasy_player_weekly_stats[player]["total_points"],
            "projected_fantasy_points": fantasy_player_weekly_stats[player]["projected_points"],
            "slot": fantasy_player_weekly_stats[player]["slot"]
        })
    
    supabase_client.table("fantasy_player_weekly_stats").upsert(data_to_insert, on_conflict="league_id,player_id,week,year").execute()

def insert_fantasy_player_yearly_stats_into_db(fantasy_player_yearly_stats, league_id, year, supabase_client):
    data_to_insert = []
    for player in fantasy_player_yearly_stats:
        data_to_insert.append({
            "league_id": league_id,
            "player_id": fantasy_player_yearly_stats[player]["player_id"],
            "year": year,
            "games_played": fantasy_player_yearly_stats[player]["games_played"],
            "total_points": round(fantasy_player_yearly_stats[player]["total_points"], 2),
            "avg_projected_fantasy_points": fantasy_player_yearly_stats[player]["avg_projected_points"],
            "std_dev_projected_fantasy_points": fantasy_player_yearly_stats[player]["std_dev_projected_points"],
            "avg_actual_fantasy_points": fantasy_player_yearly_stats[player]["avg_points"],
            "std_dev_actual_fantasy_points": fantasy_player_yearly_stats[player]["std_dev_points"]
        })
        
    supabase_client.table("fantasy_player_season_stats").upsert(data_to_insert, on_conflict="league_id,player_id,year").execute()

# get the overall stats for each team in the league for the week
def get_fantasy_team_weekly_stats(league, team_id_mapping, week, year):
    fantasy_team_weekly_stats = {}
    box_scores = league.box_scores(week=week)
    for box_score in box_scores:
        team_1 = box_score.home_team
        team_2 = box_score.away_team
        
        fantasy_team_weekly_stats[team_id_mapping[team_1.team_id]] = {
            "league_id": league.league_id,
            "team_id": team_id_mapping[team_1.team_id],
            "projected_points": box_score.home_projected,
            "points_for": box_score.home_score,
            "points_against": box_score.away_score,
            "maximum_possible_points": 0,
            "opponent_id": team_id_mapping[team_2.team_id],
            "win": 1 if box_score.home_score > box_score.away_score else 0,
            "week": week,
            "year": year
        }
        
        fantasy_team_weekly_stats[team_id_mapping[team_2.team_id]] = {
            "league_id": league.league_id,
            "team_id": team_id_mapping[team_2.team_id],
            "projected_points": box_score.away_projected,
            "points_for": box_score.away_score,
            "points_against": box_score.home_score,
            "maximum_possible_points": 0,
            "win": 1 if box_score.away_score > box_score.home_score else 0,
            "opponent_id": team_id_mapping[team_1.team_id],
            "week": week,
            "year": year
        }
    
    return fantasy_team_weekly_stats

# get the overall stats for each team in the league for the entire season so far (denoted by current_week)
def get_fantasy_team_season_stats(league, team_id_mapping, current_week, year):
    fantasy_team_season_stats = {}
    for week in range(1, current_week+1):
        fantasy_team_weekly_stats = get_fantasy_team_weekly_stats(league, team_id_mapping, week, year)
        for team_id, stats in fantasy_team_weekly_stats.items():
            if team_id not in fantasy_team_season_stats:
                fantasy_team_season_stats[team_id] = {
                    "league_id": stats["league_id"],
                    "team_id": stats["team_id"],
                    "points_for": stats["points_for"],
                    "points_against": stats["points_against"],
                    "projected_points": stats["projected_points"],
                    "wins": stats["win"],
                    "losses": 1 if stats["win"] == 0 else 0,
                    "maximum_possible_points": stats["maximum_possible_points"],
                    "year": stats["year"]
                }
            else:
                fantasy_team_season_stats[team_id]["projected_points"] = stats["projected_points"]
                fantasy_team_season_stats[team_id]["points_for"] += stats["points_for"]
                fantasy_team_season_stats[team_id]["points_against"] += stats["points_against"]
                fantasy_team_season_stats[team_id]["maximum_possible_points"] += stats["maximum_possible_points"]
                fantasy_team_season_stats[team_id]["wins"] += stats["win"]
                fantasy_team_season_stats[team_id]["losses"] += 1 if stats["win"] == 0 else 0

    return fantasy_team_season_stats
    
# get the stats for each player in the league for the week
def get_fantasy_player_weekly_stats(league, team_id_mapping, player_id_mapping, week, year):
    fantasy_player_weekly_stats = {}
    box_scores = league.box_scores(week=week)
    for box_score in box_scores:
        team_1_id = box_score.home_team.team_id
        team_2_id = box_score.away_team.team_id
        lineup_1 = box_score.home_lineup
        lineup_2 = box_score.away_lineup
        
        for player in lineup_1:
                
            if player.playerId not in player_id_mapping:
                continue
            
            fantasy_player_weekly_stats[player_id_mapping[player.playerId]] = {
                "player_name": player.name,
                "league_id": league.league_id,
                "fantasy_team_id": team_id_mapping[team_1_id],
                "week": week,
                "year": year,
                "player_id": player_id_mapping[player.playerId],
                "total_points": player.points,
                "projected_points": player.projected_points,
                "slot": player.slot_position
            }
        
        for player in lineup_2:
                
            if player.playerId not in player_id_mapping:
                continue
            
            fantasy_player_weekly_stats[player_id_mapping[player.playerId]] = {
                "player_name": player.name,
                "league_id": league.league_id,
                "fantasy_team_id": team_id_mapping[team_2_id],
                "week": week,
                "year": year,
                "player_id": player_id_mapping[player.playerId],
                "total_points": player.points,
                "projected_points": player.projected_points,
                "slot": player.slot_position
            }
    
    free_agents = league.free_agents(week=week, size=5000)
    
    for player in free_agents:
        
        if player.playerId not in player_id_mapping:
            continue
                
        fantasy_player_weekly_stats[player_id_mapping[player.playerId]] = {
            "player_name": player.name,
            "league_id": league.league_id,
            "fantasy_team_id": None,
            "week": week,
            "year": year,
            "player_id": player_id_mapping[player.playerId],
            "total_points": player.points,
            "projected_points": player.projected_points,
            "slot": player.slot_position
        }
    
    return fantasy_player_weekly_stats

def get_fantasy_player_yearly_stats(league, team_id_mapping, player_id_mapping, current_week, year):
    fantasy_player_yearly_stats = {}
    weekly_points_by_player = {}
    weekly_projected_points_by_player = {}
    
    for week in range(1, current_week+1):
        fantasy_player_weekly_stats = get_fantasy_player_weekly_stats(league, team_id_mapping, player_id_mapping, week, year)
        for player_id, stats in fantasy_player_weekly_stats.items():
            if player_id not in fantasy_player_yearly_stats:
                fantasy_player_yearly_stats[player_id] = {k: v for k, v in stats.items() if k != "week"}
                fantasy_player_yearly_stats[player_id]["games_played"] = 1
                weekly_points_by_player[player_id] = [stats["total_points"]]
                weekly_projected_points_by_player[player_id] = [stats["projected_points"]]
            else:
                fantasy_player_yearly_stats[player_id]["total_points"] += stats["total_points"]
                fantasy_player_yearly_stats[player_id]["projected_points"] += stats["projected_points"]
                fantasy_player_yearly_stats[player_id]["games_played"] += 1
                weekly_points_by_player[player_id].append(stats["total_points"])
                weekly_projected_points_by_player[player_id].append(stats["projected_points"])
    
    # Calculate averages and standard deviations
    for player_id in fantasy_player_yearly_stats:
        points_list = weekly_points_by_player[player_id]
        projected_points_list = weekly_projected_points_by_player[player_id]
        
        fantasy_player_yearly_stats[player_id]["avg_points"] = statistics.mean(points_list)
        fantasy_player_yearly_stats[player_id]["std_dev_points"] = statistics.stdev(points_list) if len(points_list) > 1 else 0
        fantasy_player_yearly_stats[player_id]["avg_projected_points"] = statistics.mean(projected_points_list)
        fantasy_player_yearly_stats[player_id]["std_dev_projected_points"] = statistics.stdev(projected_points_list) if len(projected_points_list) > 1 else 0
    
    return fantasy_player_yearly_stats