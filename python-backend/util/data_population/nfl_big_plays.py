from supabase import create_client, Client
import nfl_data_py as nfl
import pandas as pd
from .supabase_helper import get_supabase_client, get_espn_player_id_to_player_id_map

def get_nfl_player_id_to_espn_id_map(years):
    try:
        roster_data = nfl.import_seasonal_rosters(years)
        player_id_to_espn_id_map = {}
        for index, row in roster_data.iterrows():
            if pd.notna(row['player_id']) and pd.notna(row['espn_id']):
                player_id_to_espn_id_map[row['player_id']] = row['espn_id']
        return player_id_to_espn_id_map
    except Exception as e:
        return {}

def get_big_play_schema():
    return {
        'player_id': '',
        'timestamp': '',
        'description': '',
        'week': '',
        'year': '',
    }

def safe_get_espn_id(nfl_player_id, nfl_to_espn_map, player_type=""):
    """Safely get ESPN ID from NFL player ID with error handling"""
    if not nfl_player_id or pd.isna(nfl_player_id):
        return None
    
    if nfl_player_id not in nfl_to_espn_map:
        return None
    
    return nfl_to_espn_map[nfl_player_id]

def safe_get_db_id(espn_player_id, espn_to_db_map, player_type=""):
    """Safely get DB ID from ESPN player ID with error handling"""
    if not espn_player_id:
        return None
    
    if espn_player_id not in espn_to_db_map:
        return None
    
    return espn_to_db_map[espn_player_id]

def create_big_play(db_player_id, timestamp, description, week, year):
    """Create a big play entry with proper validation"""
    if not db_player_id or not timestamp:
        return None
    
    big_play = get_big_play_schema()
    big_play['player_id'] = db_player_id
    big_play['timestamp'] = timestamp
    big_play['description'] = description
    big_play['week'] = week
    big_play['year'] = year
    return big_play

def get_all_big_play_timestamps(week, year):
    try:
        years = [year]
        
        # Import play-by-play data
        pbp_df = nfl.import_pbp_data(years, downcast=True, cache=False, alt_path=None)
        
        # Get client and mappings
        supabase_client = get_supabase_client()
        espn_player_id_to_player_id_map = get_espn_player_id_to_player_id_map(supabase_client)
        nfl_player_id_to_espn_id_map = get_nfl_player_id_to_espn_id_map(years)
        
        print("Espn player id to player id map: " + str(espn_player_id_to_player_id_map))
        
        # Filter for specific week
        week_pbp_df = pbp_df[pbp_df['week'] == week]
        
        big_plays = []
        skipped_plays = 0
        
        for index, row in week_pbp_df.iterrows():
            try:
                if row['pass_attempt'] == 1:
                    # Check for passing big plays (TD or 30+ yards)
                    if row.get('pass_touchdown') == 1 or (pd.notna(row.get('yards_gained')) and row['yards_gained'] > 30):
                        
                        # Process passer
                        passer_espn_id = safe_get_espn_id(row.get('passer_player_id'), nfl_player_id_to_espn_id_map, "passer")
                        passer_db_id = safe_get_db_id(int(passer_espn_id), espn_player_id_to_player_id_map, "passer")
                        
                        # Process receiver
                        receiver_espn_id = safe_get_espn_id(row.get('receiver_player_id'), nfl_player_id_to_espn_id_map, "receiver")
                        receiver_db_id = safe_get_db_id(int(receiver_espn_id), espn_player_id_to_player_id_map, "receiver")
                        
                        yards_gained = row.get('yards_gained', 0)
                        is_touchdown = row.get('pass_touchdown') == 1
                        
                        # Create passer big play if valid
                        if passer_db_id:
                            description = f"Passing {'touchdown' if is_touchdown else 'completion'} ({int(yards_gained)} yards)"
                            qb_big_play = create_big_play(passer_db_id, row.get('time_of_day'), description, week, year)
                            if qb_big_play:
                                big_plays.append(qb_big_play)
                        else:
                            skipped_plays += 1
                        
                        # Create receiver big play if valid
                        if receiver_db_id:
                            description = f"Receiving {'touchdown' if is_touchdown else 'completion'} ({int(yards_gained)} yards)"
                            wr_big_play = create_big_play(receiver_db_id, row.get('time_of_day'), description, week, year)
                            if wr_big_play:
                                big_plays.append(wr_big_play)
                        else:
                            skipped_plays += 1
                
                elif row['rush_attempt'] == 1:
                    # Check for rushing big plays (TD or 20+ yards)
                    if row.get('rush_touchdown') == 1 or (pd.notna(row.get('yards_gained')) and row['yards_gained'] > 20):
                        
                        # Process rusher
                        rusher_espn_id = safe_get_espn_id(row.get('rusher_player_id'), nfl_player_id_to_espn_id_map, "rusher")
                        rusher_db_id = safe_get_db_id(int(rusher_espn_id), espn_player_id_to_player_id_map, "rusher")
                        
                        if rusher_db_id:
                            yards_gained = row.get('yards_gained', 0)
                            is_touchdown = row.get('rush_touchdown') == 1
                            description = f"Rushing {'touchdown' if is_touchdown else 'play'} ({int(yards_gained)} yards)"
                            
                            running_big_play = create_big_play(rusher_db_id, row.get('time_of_day'), description, week, year)
                            if running_big_play:
                                big_plays.append(running_big_play)
                        else:
                            skipped_plays += 1
            
            except Exception as e:
                skipped_plays += 1
                continue
        
        return big_plays
    
    except Exception as e:
        return []

def insert_big_plays(big_plays):
    try:
        supabase_client = get_supabase_client()
        supabase_client.table("nfl_big_plays").insert(big_plays).execute()
        return True
    except Exception as e:
        print(e)
        return False