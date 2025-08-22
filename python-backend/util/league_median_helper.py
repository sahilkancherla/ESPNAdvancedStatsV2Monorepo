def get_current_and_projected_scores_for_week(league, week, league_median_name):
    box_scores = league.box_scores(week = week)
    teams_and_current_scores = {}
    teams_and_projected_scores = {}
    for box_score in box_scores:
        team_one = box_score.home_team
        team_two = box_score.away_team
        team_one_score = box_score.home_score
        team_two_score = box_score.away_score
        team_one_projected_score = box_score.home_projected
        team_two_projected_score = box_score.away_projected

        if team_one.team_name != league_median_name:
            teams_and_current_scores[team_one.team_id] =  team_one_score
            teams_and_projected_scores[team_one.team_id] = team_one_projected_score
        
        if team_two.team_name != league_median_name:
            teams_and_current_scores[team_two.team_id] = team_two_score
            teams_and_projected_scores[team_two.team_id] = team_two_projected_score

    print(teams_and_current_scores)
    print(teams_and_projected_scores)
    return teams_and_current_scores, teams_and_projected_scores

def get_league_median_not_including_league_median_opponent(league, week, league_median_name, against_league_median_id):
    teams_and_current_scores, teams_and_projected_scores = get_current_and_projected_scores_for_week(league, week, league_median_name)

    # Convert dict to list of tuples and sort by score
    sorted_teams_and_current_scores = sorted(teams_and_current_scores.items(), key=lambda pair: pair[1])
    sorted_teams_and_projected_scores = sorted(teams_and_projected_scores.items(), key=lambda pair: pair[1])

    # Filter out the team playing against the league median
    filtered_sorted_teams_and_current_scores = [t for t in sorted_teams_and_current_scores if t[0] != against_league_median_id]
    filtered_sorted_teams_and_projected_scores = [t for t in sorted_teams_and_projected_scores if t[0] != against_league_median_id]

    n = len(filtered_sorted_teams_and_current_scores)
    if n == 0:
        raise ValueError("No teams left after filtering")
    
    # Determine median index(es)
    if n % 2 == 1:
        median_index = n // 2
        current_median = filtered_sorted_teams_and_current_scores[median_index][1]
        projected_median = filtered_sorted_teams_and_projected_scores[median_index][1]
        below_league_median_team_id = filtered_sorted_teams_and_current_scores[median_index][0]
        above_league_median_team_id = filtered_sorted_teams_and_current_scores[median_index][0]
    else:
        lower_index = n // 2 - 1
        upper_index = n // 2
        current_median = (filtered_sorted_teams_and_current_scores[lower_index][1] +
                          filtered_sorted_teams_and_current_scores[upper_index][1]) / 2
        projected_median = (filtered_sorted_teams_and_projected_scores[lower_index][1] +
                            filtered_sorted_teams_and_projected_scores[upper_index][1]) / 2
        below_league_median_team_id = filtered_sorted_teams_and_current_scores[lower_index][0]
        above_league_median_team_id = filtered_sorted_teams_and_current_scores[upper_index][0]

    return current_median, projected_median, below_league_median_team_id, above_league_median_team_id


def get_current_data(league, current_week, league_median_name):
    teams_and_current_scores, teams_and_projected_scores = get_current_and_projected_scores_for_week(league, current_week, league_median_name)
    current_week_scores = {}

    for current_score_info, projected_score_info in zip(teams_and_current_scores, teams_and_projected_scores):
        team_id = current_score_info[0]
        current_score = current_score_info[1]
        projected_score = projected_score_info[1]

        info = {}
        info["currentScore"] = current_score
        info["projectedScore"] = projected_score
        current_week_scores[team_id] = info
    return current_week_scores