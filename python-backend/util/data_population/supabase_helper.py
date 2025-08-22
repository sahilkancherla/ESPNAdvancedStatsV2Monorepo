from dotenv import load_dotenv
import os
from supabase import create_client, Client
import json

load_dotenv()

def get_supabase_client():
    # load supabase client    
    supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    return supabase

# supabase helper functions
def get_league_id_from_espn_league_id(supabase_client, external_league_id):
    response = supabase_client.table("leagues").select("id").eq("external_league_id", external_league_id).execute()
    return response.data[0]["id"]

def get_external_team_id_to_team_id_map(supabase_client, league_id):
    response = supabase_client.table("teams").select("id", "espn_team_id").eq("league_id", league_id).execute()
    team_map = {}
    for team in response.data:
        team_map[team["espn_team_id"]] = team["id"]
    return team_map

def get_external_player_id_to_player_id_map(supabase_client):
    response = supabase_client.table("nfl_players").select("id, espn_player_id").execute()
    player_map = {}
    for player in response.data:
        player_map[player["espn_player_id"]] = player["id"] 
    return player_map

def get_game_id_for_team_in_week(supabase_client, team_id, week, year):
    response = supabase_client.table("nfl_schedule").select("id").or_(f"home_team_id.eq.{team_id},away_team_id.eq.{team_id}").eq("week", week).eq("year", year).execute()
    
    if len(response.data) == 0:
        return None
    
    return response.data[0]["id"]

def get_team_abbrev_to_team_id_map(supabase_client):
    response = supabase_client.table("nfl_teams").select("id, team_abbrev").execute()
    team_map = {}
    for team in response.data:
        team_map[team["team_abbrev"]] = team["id"]
    return team_map

def get_player_id_to_team_id_map(supabase_client):
    response = supabase_client.table("nfl_players").select("id, team_id").execute()
    player_map = {}
    for player in response.data:
        player_map[player["id"]] = player["team_id"]
    return player_map

def get_nfl_data_player_id_to_db_player_id_map(supabase_client, nfl_data_player_id_to_espn_id_map):
    response = supabase_client.table("nfl_players").select("id, espn_player_id").execute()
    
    espn_player_id_to_id_map = {}
    nfl_data_player_id_to_id_map = {}
    for player in response.data:
        espn_player_id_to_id_map[str(player["espn_player_id"])] = player["id"]
    
    for player_id in nfl_data_player_id_to_espn_id_map:
        espn_player_id = nfl_data_player_id_to_espn_id_map[player_id]
        if espn_player_id in espn_player_id_to_id_map:
            nfl_data_player_id_to_id_map[player_id] = espn_player_id_to_id_map[espn_player_id]
        # else:
        #     print(f"Player {espn_player_id} not found in nfl_data_player_id_to_espn_id_map")
    
    return nfl_data_player_id_to_id_map
    
def get_teams_in_league(supabase_client, league_id):
    response = supabase_client.table("teams").select("id, team_name, espn_team_id").eq("league_id", league_id).execute()
    return response.data

def get_espn_player_id_to_player_id_map(supabase_client):
    response = supabase_client.table("nfl_players").select("id, espn_player_id").execute()
    player_map = {}
    for player in response.data:
        player_map[player["espn_player_id"]] = player["id"]
    return player_map