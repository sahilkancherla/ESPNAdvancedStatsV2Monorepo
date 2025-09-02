from util.data_population.supabase_helper import (
    get_league_id_from_espn_league_id, 
    get_espn_player_id_to_player_id_map, 
    get_external_team_id_to_team_id_map, 
    get_current_player_id_to_team_id_roster_map
)
from datetime import datetime, timezone

def update_current_roster_for_all_teams(league, supabase_client):
    """Update the current roster for all teams in a league"""
    db_league_id = get_league_id_from_espn_league_id(supabase_client, league.league_id)
    current_rostered_players = get_current_roster_for_all_teams(db_league_id, league, supabase_client)
    
    # Check if this is the first time setting up rosters for this league/year
    is_initial_setup = is_first_roster_setup(supabase_client, league.year, db_league_id)
    
    if is_initial_setup:
        print(f"Initial roster setup for league {db_league_id}, year {league.year}")
        # For initial setup, initialize status history for all current players
        initialize_player_status_history(supabase_client, league.year, db_league_id, current_rostered_players)
    else:
        # For subsequent updates, track changes and record history
        changes_since_last_roster_update = get_changes_since_last_roster_update(
            supabase_client, league.year, db_league_id, current_rostered_players
        )
        
        # Record status history for changes before clearing
        if changes_since_last_roster_update:
            record_player_status_history(supabase_client, league.year, db_league_id, changes_since_last_roster_update)
    
    clear_current_roster_for_all_teams(supabase_client, league.year, db_league_id)
    insert_current_roster_for_all_teams(current_rostered_players, supabase_client, league.year, db_league_id)
    
    if not is_initial_setup:
        return changes_since_last_roster_update
    else:
        return {}

def get_current_roster_for_all_teams(db_league_id, league, supabase_client):
    """Get current roster mapping from ESPN league data"""
    current_rostered_players = {}
    
    espn_player_id_to_player_id_map = get_espn_player_id_to_player_id_map(supabase_client)
    espn_team_id_to_team_id_map = get_external_team_id_to_team_id_map(supabase_client, db_league_id)
    
    for team in league.teams:
        db_team_id = espn_team_id_to_team_id_map[team.team_id]
        
        for player in team.roster:
            if player.playerId in espn_player_id_to_player_id_map:
                db_player_id = espn_player_id_to_player_id_map[player.playerId]
                current_rostered_players[db_player_id] = db_team_id
            else:
                print(f"Warning: Player ID {player.playerId} not found in mapping")
    
    return current_rostered_players

def clear_current_roster_for_all_teams(supabase_client, year, league_id):
    """Clear all current roster entries for a league/year"""
    try:
        supabase_client.table("fantasy_team_roster").delete().eq("year", year).eq("league_id", league_id).execute()
        return True
    except Exception as e:
        print(f"Error clearing current roster for league {league_id}, year {year}: {e}")
        return False

def get_changes_since_last_roster_update(supabase_client, year, league_id, current_player_id_to_team_id_map):
    """Compare current roster with last known roster to find changes"""
    last_player_id_to_team_id_map = get_current_player_id_to_team_id_roster_map(supabase_client, league_id, year)
    
    changes_since_last_roster_update = {}
    
    # Check for new players or team changes
    for player_id in current_player_id_to_team_id_map:
        if player_id not in last_player_id_to_team_id_map:
            # New player added
            changes_since_last_roster_update[player_id] = {
                'old_team_id': None,
                'new_team_id': current_player_id_to_team_id_map[player_id],
                'change_type': 'added'
            }
        else:
            # Check if player changed teams
            if current_player_id_to_team_id_map[player_id] != last_player_id_to_team_id_map[player_id]:
                changes_since_last_roster_update[player_id] = {
                    'old_team_id': last_player_id_to_team_id_map[player_id],
                    'new_team_id': current_player_id_to_team_id_map[player_id],
                    'change_type': 'traded'
                }
    
    # Check for dropped players
    for player_id in last_player_id_to_team_id_map:
        if player_id not in current_player_id_to_team_id_map:
            changes_since_last_roster_update[player_id] = {
                'old_team_id': last_player_id_to_team_id_map[player_id],
                'new_team_id': None,
                'change_type': 'dropped'
            }
    
    return changes_since_last_roster_update

def insert_current_roster_for_all_teams(current_rostered_players, supabase_client, year, league_id):
    """Insert current roster data into the database"""
    try:
        roster_data = []
        
        for player_id in current_rostered_players:
            roster_data.append({
                "league_id": league_id,
                "team_id": current_rostered_players[player_id],
                "player_id": player_id,
                "year": year,
            })
        
        if roster_data:
            print(f"Inserting {len(roster_data)} rows into fantasy_team_roster")
            supabase_client.table("fantasy_team_roster").insert(roster_data).execute()
        
        return True
    except Exception as e:
        print(f"Error inserting current roster for league {league_id}, year {year}: {e}")
        return False

def record_player_status_history(supabase_client, year, league_id, changes):
    """Record player status changes in the history table"""
    try:
        # Use ISO format string that Supabase can parse
        current_timestamp = datetime.now(timezone.utc).isoformat()
        history_data = []
        
        for player_id, change_info in changes.items():
            if change_info['change_type'] == 'added':
                # Player was added to a team
                history_data.append({
                    "league_id": league_id,
                    "team_id": change_info['new_team_id'],
                    "player_id": player_id,
                    "year": year,
                    "start_timestamp": current_timestamp,
                    "end_timestamp": None  # Current status, no end date
                })
            
            elif change_info['change_type'] == 'traded':
                # End the previous team assignment
                end_previous_status(supabase_client, league_id, player_id, year, current_timestamp)
                
                # Start new team assignment
                history_data.append({
                    "league_id": league_id,
                    "team_id": change_info['new_team_id'],
                    "player_id": player_id,
                    "year": year,
                    "start_timestamp": current_timestamp,
                    "end_timestamp": None
                })
            
            elif change_info['change_type'] == 'dropped':
                # End the team assignment (player becomes free agent)
                end_previous_status(supabase_client, league_id, player_id, year, current_timestamp)
        
        if history_data:
            print(f"Inserting {len(history_data)} rows into fantasy_player_status_history")
            supabase_client.table("fantasy_player_status_history").insert(history_data).execute()
        
        return True
    except Exception as e:
        print(f"Error recording player status history for league {league_id}, year {year}: {e}")
        return False

def end_previous_status(supabase_client, league_id, player_id, year, end_timestamp):
    """End the previous status record for a player"""
    try:
        supabase_client.table("fantasy_player_status_history").update({
            "end_timestamp": end_timestamp
        }).eq("league_id", league_id).eq("player_id", player_id).eq("year", year).is_("end_timestamp", "null").execute()
        
        return True
    except Exception as e:
        print(f"Error ending previous status for player {player_id}: {e}")
        return False

def get_player_status_history(supabase_client, league_id, player_id, year):
    """Get the status history for a specific player in a league/year"""
    try:
        response = supabase_client.table("fantasy_player_status_history").select("*").eq(
            "league_id", league_id
        ).eq("player_id", player_id).eq("year", year).order("start_timestamp").execute()
        
        return response.data
    except Exception as e:
        print(f"Error getting player status history for player {player_id}: {e}")
        return []

def get_team_roster_history(supabase_client, league_id, team_id, year):
    """Get all roster changes for a specific team in a league/year"""
    try:
        response = supabase_client.table("fantasy_player_status_history").select("*").eq(
            "league_id", league_id
        ).eq("team_id", team_id).eq("year", year).order("start_timestamp").execute()
        
        return response.data
    except Exception as e:
        print(f"Error getting team roster history for team {team_id}: {e}")
        return []

def is_first_roster_setup(supabase_client, year, league_id):
    """Check if this is the first time setting up rosters for this league/year"""
    try:
        # Check if there are any existing roster records for this league/year
        roster_response = supabase_client.table("fantasy_team_roster").select("id").eq(
            "year", year
        ).eq("league_id", league_id).limit(1).execute()
        
        # Check if there are any existing status history records for this league/year
        history_response = supabase_client.table("fantasy_player_status_history").select("id").eq(
            "year", year
        ).eq("league_id", league_id).limit(1).execute()
        
        # If neither table has records, this is the first setup
        return len(roster_response.data) == 0 and len(history_response.data) == 0
        
    except Exception as e:
        print(f"Error checking if first roster setup for league {league_id}, year {year}: {e}")
        # Default to treating as update if we can't determine
        return False

def initialize_player_status_history(supabase_client, year, league_id, current_rostered_players):
    """Initialize status history for all players in their current teams (first time setup)"""
    try:
        # Use ISO format string that Supabase can parse
        current_timestamp = datetime.now(timezone.utc).isoformat()
        history_data = []
        
        for player_id, team_id in current_rostered_players.items():
            history_data.append({
                "league_id": league_id,
                "team_id": team_id,
                "player_id": player_id,
                "year": year,
                "start_timestamp": current_timestamp,
                "end_timestamp": None  # Current status, no end date
            })
        
        if history_data:
            print(f"Initializing status history with {len(history_data)} players for league {league_id}, year {year}")
            supabase_client.table("fantasy_player_status_history").insert(history_data).execute()
        
        return True
    except Exception as e:
        print(f"Error initializing player status history for league {league_id}, year {year}: {e}")
        return False