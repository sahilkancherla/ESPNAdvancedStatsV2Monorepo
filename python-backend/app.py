from flask import Flask, request, jsonify
from espn_api.football import League
from util.league_median_helper import get_current_and_projected_scores_for_week, get_league_median_not_including_league_median_opponent
from flask_cors import CORS
from espn_api.football.constant import SETTINGS_SCORING_FORMAT_MAP
from util.data_population.supabase_helper import get_supabase_client
from util.data_population.nfl_data_population import populate_nfl_data
from util.data_population.fantasy_data_population import populate_fantasy_data
from util.data_population.fantasy_draft_data_population import insert_league_draft_picks
from util.chatbot_processing.graph import FootballQASystem
import os

app = Flask(__name__)
CORS(app)

# Initialize the Q&A system
qa_system = None

def initialize_system():
    """Initialize the Q&A system with proper error handling"""
    global qa_system
    try:
        qa_system = FootballQASystem()
        return True
    except Exception as e:
        return False

initialize_system()

@app.route('/')
def home():
    return jsonify(message="Python Flask Backend is Running")

@app.route('/api/getLeagueDetails', methods=['GET'])
def get_league_details():
    
    print("got here")
    league_id = request.args.get('leagueId')
    espn_s2 = request.args.get('espnS2')
    swid = request.args.get('swid')
    year = int(request.args.get('year'))
    

    print("--------------------------------")
    print(league_id, espn_s2, swid, year)
    league = League(league_id=league_id, year=year, espn_s2=espn_s2, swid=swid)
    
    team_details = []
    
    for team in league.teams:
        team_details.append({
            "team_name": team.team_name,
            "team_id": team.team_id,
            "team_abbrev": team.team_abbrev,
        })

    league_details = {
        "league_name": league.settings.name,
        "team_details": team_details,
    }
    
    return jsonify(league_details=league_details)


# @app.route('/api/getLeagueMedianData', methods=['POST'])
# def fetch_data():
#     payload = request.get_json()
#     league_id = payload.get('leagueId')
#     swid = payload.get('swid')
#     espn_s2 = payload.get('espnS2')
#     year = payload.get('year')
#     week = payload.get('week')
#     league_median_name = payload.get('leagueMedianName')
#     against_league_median_team_id = payload.get('againstLeagueMedianTeamId')
    
#     print(league_id, swid, espn_s2, year, week, league_median_name, against_league_median_team_id)
    
#     league = League(league_id=league_id, year=year, espn_s2=espn_s2, swid=swid)
#     print(league)
#     teams_and_current_scores, teams_and_projected_scores = get_current_and_projected_scores_for_week(league=league, week=week, league_median_name=league_median_name)
#     current_median, projected_median, below_league_median_team_id, above_league_median_team_id = get_league_median_not_including_league_median_opponent(league, week, league_median_name, against_league_median_team_id)
    
#     data = {
#         "teams_and_current_scores": teams_and_current_scores,
#         "teams_and_projected_scores": teams_and_projected_scores,
#         "current_median": current_median,
#         "projected_median": projected_median,
#         "below_league_median_team_id": below_league_median_team_id,
#         "above_league_median_team_id": above_league_median_team_id
#     }

#     return jsonify(success=True, data=data)

# @app.route('/api/getLatestDraftPicks', methods=['GET'])
# def get_latest_draft_picks():
#     league_id = request.args.get('leagueId')
#     espn_s2 = request.args.get('espnS2')
#     swid = request.args.get('swid')
#     year = int(request.args.get('year'))
#     latest_draft_pick = int(request.args.get('latestDraftPick'))

    
#     league = League(league_id=league_id, year=year, espn_s2=espn_s2, swid=swid)
    
#     picks = []
#     team_count = len(league.teams)

#     for pick in league.draft[latest_draft_pick:]:
#         team = pick.team
#         team_id = team.team_id
#         playerId = pick.playerId
#         round_num = pick.round_num
#         round_pick = pick.round_pick
#         overall_pick_num = team_count * (round_num - 1) + round_pick
        
#         picks.append({"team_id": team_id, "playerId": playerId, "round_num": round_num, "round_pick": round_pick, "overall_pick_num": overall_pick_num})
    
#     return jsonify(success=True, picks=picks)

# @app.route('/api/getStatsAndProjectedBreakdown', methods=['GET'])
# def get_stats_and_projected_breakdown():
    
#     league_id = request.args.get('leagueId')
#     espn_s2 = request.args.get('espnS2')
#     swid = request.args.get('swid')
#     year = int(request.args.get('year'))
    
#     previous_season_league = League(league_id=league_id, year=year-1, espn_s2=espn_s2, swid=swid)
#     current_season_league = League(league_id=league_id, year=year, espn_s2=espn_s2, swid=swid)
    
#     current_free_agents = current_season_league.free_agents(size=2000)
#     current_season_all_rostered_players = []

#     for team in current_season_league.teams:
        
#         for player in team.roster:
#             current_season_all_rostered_players.append(player)

#     current_season_all_players = current_free_agents + current_season_all_rostered_players


#     previous_free_agents = previous_season_league.free_agents(size=2000)
#     previous_season_all_rostered_players = []

#     for team in previous_season_league.teams:
        
#         for player in team.roster:
#             previous_season_all_rostered_players.append(player)

#     previous_season_all_players = previous_free_agents + previous_season_all_rostered_players
    
#     last_season_weekly_stats = {}
#     current_season_projected_breakdown = {}

#     for player in current_season_all_players:
#         current_season_projected_breakdown[player.playerId] = player.projected_breakdown

#     for player in previous_season_all_players:
#         last_season_weekly_stats[player.playerId] = player.stats
    
#     projections = {}
#     for player in current_season_all_players:
#         projections[player.playerId] = {
#             "current_season_projected_points_total": player.projected_total_points,
#             "current_season_projected_points_per_game": player.projected_avg_points,
#             "last_season_points_total": 0,
#             "last_season_points_per_game": 0
#         }
    
#     for player in previous_season_all_players:
#         if player.playerId in projections:
#             projections[player.playerId]["last_season_points_total"] = player.total_points
#             projections[player.playerId]["last_season_points_per_game"] = player.avg_points

#     data = {
#         "last_season_weekly_stats": last_season_weekly_stats,
#         "current_season_projected_breakdown": current_season_projected_breakdown,
#         "projections": projections,
#         "settings_scoring_format": SETTINGS_SCORING_FORMAT_MAP
#     }

#     return jsonify(success=True, data=data)
    
@app.route('/api/updateNFLData', methods=['POST'])
def update_nfl_data():
    payload = request.get_json()
    current_week = payload.get('currentWeek')
    year = payload.get('year')
    updateWeeksBeforeCurrentWeek = payload.get('updateAllWeeks')
    
    supabase_client = get_supabase_client()
    
    populate_nfl_data(current_week, year, updateWeeksBeforeCurrentWeek, supabase_client)
    
    return jsonify(success=True)

@app.route('/api/updateFantasyData', methods=['POST'])
def update_fantasy_data():
    payload = request.get_json()
    current_week = payload.get('currentWeek')
    year = payload.get('year')
    updateAllWeeks = payload.get('updateAllWeeks')
    external_league_id = payload.get('externalLeagueId')
    swid = payload.get('swid')
    espn_s2 = payload.get('espnS2')
    
    supabase_client = get_supabase_client()
    
    populate_fantasy_data(external_league_id, swid, espn_s2, current_week, year, updateAllWeeks, supabase_client)
    
    return jsonify(success=True)
    
@app.route('/api/updateFantasyDraftData', methods=['POST'])
def update_fantasy_draft_data():
    payload = request.get_json()
    external_league_id = payload.get('externalLeagueId')
    swid = payload.get('swid')
    espn_s2 = payload.get('espnS2')
    year = payload.get('year')
    
    supabase_client = get_supabase_client()
        
    insert_league_draft_picks(external_league_id, swid, espn_s2, year, supabase_client)
    
    return jsonify(success=True)

@app.route('/api/askChatbot', methods=['POST'])
def ask_question():
    """Main endpoint to ask football questions"""
    try:
        # Check if system is initialized
        if qa_system is None:
            return jsonify({
                "error": "System not initialized",
                "message": "The Q&A system failed to initialize. Check server logs."
            }), 500
        
        # Get question from request
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({
                "error": "Missing question",
                "message": "Please provide a 'question' field in your JSON request"
            }), 400
        
        question = data['question'].strip()
        conversation_history = data.get('conversation_history', [])
        verified_sources = data.get('verified_sources', False)
        
        if not question:
            return jsonify({
                "error": "Empty question",
                "message": "Question cannot be empty"
            }), 400
        
        # Log the request
        print(f"Processing question: {question}")
        
        # Process the question
        result = qa_system.ask_question(question, conversation_history, verified_sources)
        
        # Log the response
        print(f"Successfully processed question")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"API error: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500
        
if __name__ == '__main__':
    if not os.getenv("OPENAI_API_KEY"):
        print("OPENAI_API_KEY not found in environment variables")
        exit(1)
    
    if not os.getenv("TAVILY_API_KEY"):
        print("TAVILY_API_KEY not found in environment variables")
        exit(1)
    
    # Initialize the system
    print("Starting Football Q&A API Server...")
    if initialize_system():
        print("System ready! Starting Flask server...")
        app.run(debug=True, port=5001, host="0.0.0.0")
    else:
        print("Failed to initialize system. Check server logs.")
        exit(1)
