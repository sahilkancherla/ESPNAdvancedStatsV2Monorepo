from espn_api.football import League

def get_best_lineup_for_teams_in_league(league, week, year):
    for team in league.teams:
        starters, bench_players = get_ids_of_starters(league, team.team_name, week)
        
        # Calculate optimal lineup with minimal swaps
        optimal_lineup = get_optimal_lineup_minimal_swaps(starters, bench_players)
        
        # Calculate points
        actual_points = sum(player[1].points for player in starters)
        optimal_points = sum(player[1].points for player in optimal_lineup)
        points_missed = optimal_points - actual_points
        swaps = get_swaps_needed(starters, optimal_lineup)
        minimized_swaps = minimize_swaps(swaps, starters, optimal_lineup)
        
        # Print results
        print(f"Team: {team.team_name}")
        print(f"Actual Points: {actual_points:.1f}")
        print(f"Optimal Points: {optimal_points:.1f}")
        print(f"Points Missed: {points_missed:.1f}")
        print(f"Number of Swaps Needed: {len(minimized_swaps)}")
        print()
        
        print("Current lineup:")
        current_lineup = [(starter[0], starter[1]) for starter in starters]
        for slot, player in sorted(current_lineup, key=lambda x: get_slot_priority(x[0])):
            print(f"  {slot}: {player.name} ({player.points:.1f} pts)")
        print()
        
        print("Bench lineup:")
        bench_lineup = [(bench_player[0], bench_player[1]) for bench_player in bench_players]
        for slot, player in sorted(bench_lineup, key=lambda x: get_slot_priority(x[0])):
            print(f"  {slot}: {player.name} ({player.eligibleSlots}) ({player.points:.1f} pts)")
        print()
        
        print("Swaps needed:")
        for swap in minimized_swaps:
            print(f"  {swap[0].name} -> {swap[1].name}")
        print()
        
        print("Optimal lineup:")
        for slot, player in sorted(optimal_lineup, key=lambda x: get_slot_priority(x[0])):
            print(f"  {slot}: {player.name} ({player.points:.1f} pts)")
        
        print("=" * 60)
        print()

def get_optimal_lineup_minimal_swaps(starters, bench_players):
    """
    Get the optimal lineup with minimal swaps
    """
    positions_to_fill = []
    optimal_lineup = []
    
    for starter in starters:
        positions_to_fill.append(starter[0])
    
    # sort positions_to_fill by priority
    positions_to_fill.sort(key=lambda x: get_slot_priority(x))

    all_players = starters + bench_players
    
    
    for position_to_fill in positions_to_fill:
        
        best_player_for_slot_idx = -1
        best_player_for_slot_points = -100
        
        for player in all_players:
            if can_play_slot(player[1], position_to_fill):
                if player[1].points > best_player_for_slot_points:
                    best_player_for_slot_points = player[1].points
                    best_player_for_slot_idx = all_players.index(player)
        
        if best_player_for_slot_idx != -1:
            best_player_for_slot = all_players[best_player_for_slot_idx][1]
            optimal_lineup.append((position_to_fill, best_player_for_slot))
            all_players.pop(best_player_for_slot_idx)
    
    return optimal_lineup

def get_swaps_needed(starters, optimal_lineup):
    """
    Get the swaps needed to get from the current lineup to the optimal lineup
    """
    starters.sort(key=lambda x: get_slot_priority(x[0]))
    optimal_lineup.sort(key=lambda x: get_slot_priority(x[0]))
    
    swaps = []
    for i, starter_tuple in enumerate(starters):
        starter = starter_tuple[1]
        optimal_player = optimal_lineup[i][1]
        if starter.name != optimal_player.name:
            swaps.append((starter, optimal_player))
            optimal_lineup[i] = (optimal_lineup[i][0], starter)
        
    return swaps

def minimize_swaps(swaps, starters, optimal_lineup):
    """
    Minimize the swaps needed to get from the current lineup to the optimal lineup
    """
    
    minimized_swaps = []
    
    # complete this
    for swap in swaps:
        starter = swap[0]
        optimal_player = swap[1]
        if starter.slot_position == optimal_player.slot_position:
            print(f"No swap needed for {starter.name} -> {optimal_player.name}")
        else:
            minimized_swaps.append(swap)
        
    return minimized_swaps

def can_play_slot(player, slot):
    """
    Check if a player can play in a specific slot
    """
    # Handle D/ST special case
    if slot == "D/ST":
        return "D/ST" in player.eligibleSlots
    
    # Handle FLEX slots (contains "/")
    if "/" in slot:
        slot_positions = slot.split("/")
        return any(pos in player.eligibleSlots for pos in slot_positions)
    
    # Handle specific positions
    return slot in player.eligibleSlots

def get_slot_priority(slot):
    """
    Return priority for slot ordering (lower number = higher priority)
    """
    priority_order = {
        "QB": 1,
        "RB": 2,
        "WR": 3, 
        "TE": 4,
        "FLEX": 5,
        "RB/WR": 5,
        "WR/TE": 5,
        "RB/WR/TE": 5,
        "K": 6,
        "D/ST": 7,
        "BE": 8,
        "IR": 9
    }
    return priority_order.get(slot, 10)

def get_ids_of_starters(league, team_name, week, non_starting_slots=["IR", "BE"]):
    """
    Get starters and bench players for a specific team and week
    """
    for box_score in league.box_scores(week=week):
        if box_score.home_team.team_name == team_name:
            lineup = box_score.home_lineup
        elif box_score.away_team.team_name == team_name:
            lineup = box_score.away_lineup
        else:
            continue

        starters = []
        bench_players = []

        for player in lineup:
            if player.slot_position not in non_starting_slots:
                starters.append((player.slot_position, player))
            else:
                bench_players.append((player.slot_position, player))
                
        return starters, bench_players

    return None, None

if __name__ == "__main__":
    LEAGUE_ID = '27289017'
    SWID = '864C6648-6746-42D3-A0D2-C2041D50FADD'
    ESPN_S2 = 'AEBLZmYmFB%2Fd0Ksi1rwg319dLQz44knGpDd6fp%2FhupuoLyJjsBxoeddNy1oBEkoMXeyDJJ6zycwok0PbMERfnC%2F5ZLD7JctADtj%2Fp8j9vmQNZZJqVTc7c4ki6qsxsK001kxqHgHQk8rIOu1Or4Qv4%2FR1BTUWfpRlQyfbfzRa%2FiQWgsqr8B%2BSdmLU0jS%2BDia%2BgXJjO2sz8QhEOzwqAhrJhyEv0RHx6vGjPdM%2Bm3ifgH1eZGknJr2fEXtS5NBezG5lm7cgfnktlWgvOFSMYuoHkAmv9Urb2G7x8u19b8fuJplODA%3D%3D'

    league = League(league_id=LEAGUE_ID, year=2024, espn_s2=ESPN_S2, swid=SWID)
    
    # Analyze all teams
    print("=== LEAGUE-WIDE LINEUP ANALYSIS ===")
    get_best_lineup_for_teams_in_league(league, 1, 2024)
    
    # Example: Analyze a specific team in detail
    # analyze_single_team(league, "Team Name", 1)