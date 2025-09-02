from datetime import datetime, timezone
from util.data_population.supabase_helper import get_league_id_from_espn_league_id, get_external_team_id_to_team_id_map

def get_and_insert_current_scores(league, week, supabase_client):
    current_scores = []
    db_league_id = get_league_id_from_espn_league_id(supabase_client, league.league_id)
    espn_team_id_to_team_id_map = get_external_team_id_to_team_id_map(supabase_client, db_league_id)
    for box_score in league.box_scores(week):
        home_team_id = box_score.home_team.team_id
        away_team_id = box_score.away_team.team_id
        
        db_home_team_id = espn_team_id_to_team_id_map[home_team_id]
        db_away_team_id = espn_team_id_to_team_id_map[away_team_id]
        
        home_team_points = box_score.home_score
        away_team_points = box_score.away_score
        
        current_scores.append({
            "league_id": db_league_id,
            "team_id": db_home_team_id,
            "points": home_team_points,
            "week": week,
            "year": league.year,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        current_scores.append({
            "league_id": db_league_id,
            "team_id": db_away_team_id,
            "points": away_team_points,
            "week": week,
            "year": league.year,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
    supabase_client.table("fantasy_team_points_live_tracking").insert(current_scores).execute()
    return current_scores