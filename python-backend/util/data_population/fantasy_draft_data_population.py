from .supabase_helper import get_supabase_client, get_league_id_from_espn_league_id, get_teams_in_league, get_espn_player_id_to_player_id_map
from espn_api.football import League

def insert_league_draft_picks(external_league_id, swid, espn_s2, year, supabase_client):
    
    league = League(league_id=external_league_id, year=year, espn_s2=espn_s2, swid=swid)
    
    if league.draft is None or len(league.draft) == 0:
        return

    league_id = get_league_id_from_espn_league_id(supabase_client, external_league_id)
    teams_in_league = get_teams_in_league(supabase_client, league_id)
    espn_player_id_to_player_id_map = get_espn_player_id_to_player_id_map(supabase_client)
    
    draft_picks = []

    for draft_pick in league.draft:
        try:
            espn_team_id = draft_pick.team.team_id
            team_id = next(team["id"] for team in teams_in_league if team["espn_team_id"] == espn_team_id)
            player_id = espn_player_id_to_player_id_map[draft_pick.playerId]
            draft_picks.append({
                "league_id": league_id,
                "team_id": team_id,
                "player_id": player_id,
                "round_number": draft_pick.round_num,
                "pick_number": draft_pick.round_pick,
                "year": year
            })
        except:
            draft_picks.append({
                "league_id": league_id,
                "team_id": None,
                "player_id": None,
                "round_number": draft_pick.round_num,
                "pick_number": draft_pick.round_pick,
                "year": year
            })

    supabase_client.table("fantasy_league_draft_picks").insert(draft_picks).execute() 