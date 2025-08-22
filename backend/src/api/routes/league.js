import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();
const pythonBackendUrl = process.env.PYTHON_BACKEND_SERVICE;

router.get('/getLeagueDetailsRegister', async (req, res) => {
    try {
        const { leagueId, espnS2, swid, year } = req.query;

        // Use the possibly updated values
        if (!leagueId || !espnS2 || !swid || !year) {
            return res.status(400).json({ error: 'Missing required query parameters' });
        }

        const url = `${pythonBackendUrl}/api/getLeagueDetails?leagueId=${leagueId}&espnS2=${espnS2}&swid=${swid}&year=${year}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: `Could not fetch league details` });
        }

        const { league_details } = await response.json();

        return res.status(200).json({ leagueDetails: league_details });
    } catch (error) {
        console.error('Error fetching league details:', error);
        return res.status(500).json({ error: 'Failed to fetch league details', details: error.message });
    }
});

router.get('/getLeagueDetailsJoin', async (req, res) => {
    const { externalLeagueId } = req.query;

    const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .eq('external_league_id', externalLeagueId)
        .maybeSingle();

    if (leagueError) return res.status(404).json({ error: 'League not found' });

    // Find all teams in the league
    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, espn_team_id, team_abbrev, team_name, user_id')
        .eq('league_id', league.id);

    if (teamsError) {
        return res.status(500).json({ error: 'Failed to fetch teams for league', details: teamsError.message });
    }

    // Format the response to match frontend expectations
    const leagueDetails = {
        league_name: league.league_name || league.name || '', // fallback if column name varies
        league_id: league.id,
        team_details: (teams || []).map(team => ({
            team_id: team.id,
            espn_team_id: team.espn_team_id,
            team_abbrev: team.team_abbrev,
            team_name: team.team_name,
            user_id: team.user_id,
        })),
    };

    return res.status(200).json({ leagueDetails });

});

// POST /registerLeague
// TODO: Add validation checks and make sure multiple leagues aren't registered with the same details
// TODO: make this more atomic if possible
router.post('/registerLeague', async (req, res) => {
    const { adminUserId, adminTeamId, leagueId, espnS2, swid, allTeams } = req.body;
  
    try {
      // Step 1: Check if the league already exists
      const { data: leagueExists, error: leagueError } = await supabase
        .from('leagues')
        .select('id')
        .eq('external_league_id', leagueId)
        .maybeSingle(); // ✅ don't throw if no match
  
      if (leagueError) throw leagueError;
      
      if (leagueExists) {
        return res.status(400).json({ error: 'League already exists, please join instead' });
      }
  
      // Step 2: Create the league
      const { data: newLeague, error: insertLeagueError } = await supabase
        .from('leagues')
        .insert({
          admin_user_id: adminUserId,
          external_league_id: leagueId,
          espn_s2: espnS2,
          swid: swid,
        })
        .select()
        .single();
  
      if (insertLeagueError) throw insertLeagueError;
  
      // Step 3: Create ALL the teams, with the team names and team ids
      const teamsToInsert = allTeams.map(team => ({
        user_id: null,
        league_id: newLeague.id,
        team_name: team.teamName,
        espn_team_id: team.teamId,
        team_abbrev: team.teamAbbrev,
      }));

      // Ensure the admin's team is assigned to the admin user
      teamsToInsert.forEach(team => {
        if (String(team.espn_team_id) === String(adminTeamId)) {
          team.user_id = adminUserId;
        }
      });

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert(teamsToInsert)
        .select();
  
      if (teamError) throw teamError;
  
      res.status(200).json({ league: newLeague, team: teamData });
  
    } catch (err) {
      console.error('Error registering league and team:', err);
      res.status(500).json({ error: err.message || 'Unknown error' });
    }
});
  

// POST /joinLeague
// TODO: Add validation checks and make sure team hasn't already joined the league before joining
router.post('/joinLeague', async (req, res) => {
    const { userId, leagueId, teamId} = req.body;

    try {
    // Find the team with the given leagueId and teamId, and update its user_id to userId
    const { data: team, error: findError } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId)
        .eq('id', teamId)
        .maybeSingle();

    if (findError) {
        return res.status(400).json({ error: findError.message });
    }
    if (!team) {
        return res.status(404).json({ error: 'Team not found in this league' });
    }
    if (team.user_id) {
        return res.status(400).json({ error: 'This team is already claimed by another user' });
    }

    // Check if this user already has a team in this league
    const { data: existingTeam, error: existingTeamError } = await supabase
        .from('teams')
        .select('id')
        .eq('league_id', leagueId)
        .eq('user_id', userId)
        .maybeSingle();

    if (existingTeamError) {
        return res.status(400).json({ error: existingTeamError.message });
    }
    if (existingTeam) {
        return res.status(400).json({ error: 'User already has a team in this league' });
    }

    // Update the team to assign the user
    const { data: updatedTeam, error: updateError } = await supabase
        .from('teams')
        .update({ user_id: userId })
        .eq('id', teamId)
        .eq('league_id', leagueId)
        .select()
        .maybeSingle();

    if (updateError) {
        return res.status(400).json({ error: updateError.message });
    }

    res.status(200).json({ team: updatedTeam });
    } catch (err) {
        console.error('Error finding team:', err);
        res.status(500).json({ error: err.message || 'Unknown error' });
    }
});

// GET /getAllLeaguesForUser
router.get('/getAllLeaguesForUser', async (req, res) => {
    const { userId } = req.query;

    // Get all teams for this user
    const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', userId);

    if (teamError) {
        return res.status(400).json({ error: teamError.message });
    }

    const leagueIds = teamData.map(team => team.league_id);

    // Get all leagues for these leagueIds
    const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .in('id', leagueIds);

    if (leagueError) {
        return res.status(400).json({ error: leagueError.message });
    }

    // Get all teams for each league
    const { data: leagueTeams, error: leagueTeamsError } = await supabase
        .from('teams')
        .select('*')
        .in('league_id', leagueIds);

    if (leagueTeamsError) {
        return res.status(500).json({ error: 'Failed to fetch league teams', details: leagueTeamsError.message });
    }

    // For each league, attach the user's team in that league
    const leaguesWithTeams = leagueData.map(league => {
        const team = teamData.find(t => t.league_id === league.id);
        return {
            ...league,
            teamId: team.id,
            teams: leagueTeams.filter(t => t.league_id === league.id)
        };
    });

    res.status(200).json({ data: leaguesWithTeams });
});

// router.post('/updateLatestDraftPicks', async (req, res) => {
//     const { leagueId, year, latestDraftPick } = req.body;


//     // Find all the players from nfl_players
//     const { data: nflPlayers, error: nflPlayersError } = await supabase
//         .from('nfl_players')
//         .select('*');

//     if (nflPlayersError) {
//         return res.status(500).json({ error: 'Failed to fetch NFL players', details: nflPlayersError.message });
//     }

//     const { data: league, error: leagueError } = await supabase
//         .from('leagues')
//         .select('external_league_id, espn_s2, swid')
//         .eq('id', leagueId)
//         .maybeSingle();

//     if (leagueError || !league) {
//         return res.status(404).json({ error: 'League not found' });
//     }

//     // Get all teams for this league
//     const { data: teams, error: teamsError } = await supabase
//         .from('teams')
//         .select('*')
//         .eq('league_id', leagueId);

//     if (teamsError) {
//         return res.status(500).json({ error: 'Failed to fetch teams for league', details: teamsError.message });
//     }

//     const { external_league_id, espn_s2, swid } = league;

//     const url = `${pythonBackendUrl}/api/getLatestDraftPicks?leagueId=${external_league_id}&espnS2=${espn_s2}&swid=${swid}&year=${year}&latestDraftPick=${latestDraftPick}`;

//     const response = await fetch(url);

//     if (!response.ok) {
//         return res.status(400).json({ error: 'Failed to fetch latest draft picks' });
//     }

//     const { picks } = await response.json();

//     // Map espn_team_id to team.id for quick lookup
//     const espnTeamIdToTeamId = {};
//     for (const team of teams) {
//         espnTeamIdToTeamId[team.espn_team_id] = team.id;
//     }

//     // Map espn_player_id to player.id for quick lookup
//     const espnPlayerIdToPlayerId = {};
//     for (const player of nflPlayers) {
//         espnPlayerIdToPlayerId[player.espn_player_id] = player.id;
//     }

//     // Build the draft picks array as specified
//     const draftPicks = picks.map(pick => {
//         const { team_id, playerId, overall_pick_num } = pick;
//         return {
//             team_id: espnTeamIdToTeamId[team_id] || null,
//             nfl_player_id: espnPlayerIdToPlayerId[playerId] || null,
//             pick_number: overall_pick_num
//         };
//     });

//     // Overwrite (upsert) draftPicks into pick_history for speed
//     const pickHistoryRows = draftPicks
//         .filter(pick => pick.team_id && pick.nfl_player_id && pick.pick_number != null)
//         .map(pick => ({
//             team_id: pick.team_id,
//             nfl_player_id: pick.nfl_player_id,
//             pick_number: pick.pick_number,
//             league_id: leagueId,
//             year: year
//         }));

//     if (pickHistoryRows.length > 0) {
//         const { error: upsertError } = await supabase
//             .from('pick_history')
//             .upsert(pickHistoryRows, { onConflict: ['team_id', 'nfl_player_id', 'pick_number', 'league_id', 'year'] });

//         if (upsertError) {
//             console.error('Error upserting into pick_history:', upsertError);
//         }
//     }

//     return res.status(200).json({ draftPicks });
// });

// router.get('/getLatestDraftPicks', async (req, res) => {
//     const { leagueId, year } = req.query;

//     const { data: draftPicks, error: draftPicksError } = await supabase
//         .from('pick_history')
//         .select('*')
//         .eq('league_id', leagueId)
//         .eq('year', year)
//         .order('pick_number', { ascending: true });

//     if (draftPicksError) {
//         return res.status(500).json({ error: 'Failed to fetch draft picks', details: draftPicksError.message });
//     }

//     return res.status(200).json({ draftPicks });
// });

router.get('/getAllTeamsForLeague', async (req, res) => {
    const { leagueId } = req.query;
    const { data: leagueTeams, error: leagueTeamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId);
    
    if (leagueTeamsError) {
        return res.status(500).json({ error: 'Failed to fetch league teams', details: leagueTeamsError.message });
    }

    return res.status(200).json({ leagueTeams });
});

// router.post('/configureDraftOrder', async (req, res) => {
//     try {

//     // draftOrder is an array of objects with team_id and pick_number
//       const { leagueId, year, draftOrder } = req.body;
  
//       if (!leagueId || !year || !Array.isArray(draftOrder)) {
//         return res.status(400).json({ error: 'Missing or invalid parameters' });
//       }
  
//       // Delete any existing draft order for this league/year
//       const { error: deleteError } = await supabase
//         .from('draft_order')
//         .delete()
//         .eq('league_id', leagueId)
//         .eq('year', year);
  
//       if (deleteError) {
//         return res.status(500).json({
//           error: 'Failed to clear existing draft order',
//           details: deleteError.message
//         });
//       }
  
//       // Prepare rows for insert
//       const rows = draftOrder.map(({ teamId, pickNumber }) => ({
//         team_id: teamId,
//         pick_number: pickNumber,
//         league_id: leagueId,
//         year
//       }));
  
//       // Insert the new draft order
//       const { error: insertError } = await supabase
//         .from('draft_order')
//         .insert(rows);
  
//       if (insertError) {
//         return res.status(500).json({
//           error: 'Failed to insert draft order',
//           details: insertError.message
//         });
//       }
  
//       return res.status(200).json({ message: 'Draft order overwritten successfully' });
//     } catch (err) {
//       return res.status(500).json({
//         error: 'Unexpected server error',
//         details: err.message
//       });
//     }
// });

// router.get('/getDraftOrder', async (req, res) => {
//     const { leagueId, year } = req.query;

//     const { data: draftOrder, error: draftOrderError } = await supabase
//         .from('draft_order')
//         .select('*')
//         .eq('league_id', leagueId)
//         .eq('year', year);

//     if (draftOrderError) {
//         return res.status(500).json({ error: 'Failed to fetch draft order', details: draftOrderError.message });
//     }

//     if (Array.isArray(draftOrder)) {
//         draftOrder.sort((a, b) => a.pick_number - b.pick_number);
//     }

//     return res.status(200).json({ draftOrder });
// });

// router.get('/getStatsAndProjectedBreakdown', async (req, res) => {
//     const { leagueId, espnS2, swid, year } = req.query;

//     const url = `${pythonBackendUrl}/api/getStatsAndProjectedBreakdown?leagueId=${leagueId}&espnS2=${espnS2}&swid=${swid}&year=${year}`;

//     const response = await fetch(url);

//     if (!response.ok) {
//         return res.status(400).json({ error: 'Failed to fetch stats and projected breakdown' });
//     }

//     const { data } = await response.json();

//     return res.status(200).json({ data });
// });
  
router.get('/getFantasyLeagueStats', async (req, res) => {
    const { leagueId, year } = req.query;
    const { data: weeklyStats, error: weeklyStatsError } = await supabase
        .from('fantasy_team_weekly_stats')
        .select('*')
        .eq('league_id', leagueId)
        .eq('year', year);

    if (weeklyStatsError) {
        return res.status(500).json({ error: 'Failed to fetch weekly stats', details: weeklyStatsError.message });
    }

    // Separate by week
    const statsByWeek = {};
    weeklyStats.forEach(stat => {
        if (!statsByWeek[stat.week]) {
            statsByWeek[stat.week] = [];
        }
        statsByWeek[stat.week].push(stat);
    });

    return res.status(200).json({ statsByWeek });
});

router.get('/getFantasyTeams', async (req, res) => {
    const { leagueId } = req.query;
    const { data: fantasyTeams, error: fantasyTeamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId)

    if (fantasyTeamsError) {
        return res.status(500).json({ error: 'Failed to fetch fantasy teams', details: fantasyTeamsError.message });
    }

    return res.status(200).json({ data: fantasyTeams });
});

router.get('/getFantasyTeamsWeeklyStats', async (req, res) => {
    const { leagueId, year } = req.query;
    const { data: fantasyTeamsWeeklyStats, error: fantasyTeamsWeeklyStatsError } = await supabase
        .from('fantasy_team_weekly_stats')
        .select('*')
        .eq('league_id', leagueId)
        .eq('year', year);

    if (fantasyTeamsWeeklyStatsError) {
        return res.status(500).json({ error: 'Failed to fetch fantasy players', details: fantasyTeamsWeeklyStatsError.message });
    }

    return res.status(200).json({ data: fantasyTeamsWeeklyStats });
});

router.get('/getFantasyTeamsSeasonStats', async (req, res) => {
    const { leagueId, year } = req.query;
    const { data: fantasyTeamsSeasonStats, error: fantasyTeamsSeasonStatsError } = await supabase
        .from('fantasy_team_season_stats')
        .select('*')
        .eq('league_id', leagueId)
        .eq('year', year);

    if (fantasyTeamsSeasonStatsError) {
        return res.status(500).json({ error: 'Failed to fetch fantasy teams season stats', details: fantasyTeamsSeasonStatsError.message });
    }

    return res.status(200).json({ data: fantasyTeamsSeasonStats });
});

router.get('/getFantasyPlayersWeeklyStats', async (req, res) => {
    const { leagueId, year } = req.query;
    const { data: fantasyPlayersWeeklyStats, error: fantasyPlayersWeeklyStatsError } = await supabase
        .from('fantasy_player_weekly_stats')
        .select('*')
        .eq('league_id', leagueId)
        .eq('year', year);


    if (fantasyPlayersWeeklyStatsError) {
        return res.status(500).json({ error: 'Failed to fetch fantasy players weekly stats', details: fantasyPlayersWeeklyStatsError.message });
    }

    return res.status(200).json({ data: fantasyPlayersWeeklyStats });
});

router.get('/getFantasyPlayersSeasonStats', async (req, res) => {
    const { leagueId, year } = req.query;
    const { data: fantasyPlayersSeasonStats, error: fantasyPlayersSeasonStatsError } = await supabase
        .from('fantasy_player_season_stats')
        .select('*')
        .eq('league_id', leagueId)
        .eq('year', year);

    if (fantasyPlayersSeasonStatsError) {
        return res.status(500).json({ error: 'Failed to fetch fantasy players season stats', details: fantasyPlayersSeasonStatsError.message });
    }

    return res.status(200).json({ data: fantasyPlayersSeasonStats });
});

router.get('/getFantasyDraftPicks', async (req, res) => {
    const { leagueId, year } = req.query;
    const { data: fantasyDraftPicks, error: fantasyDraftPicksError } = await supabase
        .from('fantasy_league_draft_picks')
        .select('*')
        .eq('league_id', leagueId)
        .eq('year', year);

    if (fantasyDraftPicksError) {
        return res.status(500).json({ error: 'Failed to fetch fantasy draft picks', details: fantasyDraftPicksError.message });
    }

    return res.status(200).json({ data: fantasyDraftPicks });
});

router.post('/updateBigBoardPlayerDraftStatus', async (req, res) => {
    const { playerId, drafted } = req.body;
    console.log('playerId', playerId)
    console.log('drafted', drafted)
    const { error: updateError } = await supabase
        .from('big_board')
        .update({ drafted })
        .eq('id', playerId);

    if (updateError) {
        return res.status(500).json({ error: 'Failed to update big board player draft status', details: updateError.message });
    }

    return res.status(200).json({ message: 'Big board player draft status updated successfully' });
});

router.post('/updateBigBoardPlayerLabel', async (req, res) => {
    const { playerId, label } = req.body;
    const { error: updateError } = await supabase
        .from('big_board')
        .update({ label })
        .eq('id', playerId);

    if (updateError) {
        return res.status(500).json({ error: 'Failed to add label to big board player', details: updateError.message });
    }

    return res.status(200).json({ message: 'Label added to big board player successfully' });
});

router.post('/updateBigBoardPlayerNotes', async (req, res) => {
    const { playerId, notes } = req.body;
    const { error: updateError } = await supabase
        .from('big_board')
        .update({ notes })
        .eq('id', playerId);

    if (updateError) {
        return res.status(500).json({ error: 'Failed to add notes to big board player', details: updateError.message });
    }

    return res.status(200).json({ message: 'Notes added to big board player successfully' });
});

export default router;