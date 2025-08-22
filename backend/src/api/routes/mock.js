import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

router.post('/createFantasyMockDraft', async (req, res) => {
    const { leagueId, teamId, isSnakeDraft, rounds, title, description, allTeams } = req.body;

    // First initialize the mock draft
    const { data, error } = await supabase
        .from('fantasy_mock_drafts')
        .insert({
            league_id: leagueId,
            team_id: teamId,
            rounds: rounds,
            title: title,
            description: description
        })
        .select('*')

    if (error) {
        return res.status(500).json({ error: error.message })
    }
    
    const draftId = data[0].id;
    const mockDraftPicks = [];
    let overallPickNumber = 1;

    if (isSnakeDraft) {
        for (let i = 0; i < rounds; i++) {
            const roundNumber = i + 1;
            const isEvenRound = roundNumber % 2 === 0;
            
            for (let j = 0; j < allTeams.length; j++) {
                const teamIndex = isEvenRound ? allTeams.length - 1 - j : j;
                const currentTeamId = allTeams[teamIndex]; // Changed variable name
                
                mockDraftPicks.push({
                    fantasy_mock_draft_id: draftId,
                    round_number: roundNumber,
                    pick_number: j + 1,
                    overall_pick: overallPickNumber,
                    drafting_team_id: currentTeamId, // Use the renamed variable
                    player_id: null,
                    notes: "",
                });
                overallPickNumber++;
            }
        }
    } else {
        // Standard draft (same order each round)
        for (let i = 0; i < rounds; i++) {
            for (let j = 0; j < allTeams.length; j++) {
                mockDraftPicks.push({
                    fantasy_mock_draft_id: draftId,
                    round_number: i + 1,
                    pick_number: j + 1,
                    overall_pick: overallPickNumber,
                    drafting_team_id: allTeams[j], // Fixed: use allTeams[j] instead of teamId
                    player_id: null,
                    notes: "",
                });
                overallPickNumber++;
            }
        }
    }

    const { data: mockDraftPicksData, error: mockDraftPicksError } = await supabase
        .from('fantasy_mock_draft_picks')
        .insert(mockDraftPicks)

    if (mockDraftPicksError) {
        return res.status(500).json({ error: mockDraftPicksError.message })
    }
    
    return res.status(200).json({ data: mockDraftPicksData })
})

router.get('/getFantasyMockDrafts', async (req, res) => {
    const { leagueId, teamId } = req.query;
    const { data, error } = await supabase
        .from('fantasy_mock_drafts')
        .select('*')
        .eq('league_id', leagueId)
        .eq('team_id', teamId)
    
    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.get('/getFantasyMockDraftPicks', async (req, res) => {
    const { mockDraftId } = req.query;
    const { data, error } = await supabase
        .from('fantasy_mock_draft_picks')
        .select('*')
        .eq('fantasy_mock_draft_id', mockDraftId)
    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.post('/updateFantasyMockDraftPickTeam', async (req, res) => {
    const { mockDraftPickId, draftingTeamId } = req.body;
    const { data, error } = await supabase
        .from('fantasy_mock_draft_picks')
        .update({ drafting_team_id: draftingTeamId })
        .eq('id', mockDraftPickId)
        .select('*')

    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.post('/updateFantasyMockDraftPickPlayer', async (req, res) => {
    const { mockDraftPickId, playerId } = req.body;
    const { data, error } = await supabase
        .from('fantasy_mock_draft_picks')
        .update({ player_id: playerId })
        .eq('id', mockDraftPickId)
        .select('*')

    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.post('/updateFantasyMockDraftPickNotes', async (req, res) => {
    const { mockDraftPickId, notes } = req.body;
    const { data, error } = await supabase
        .from('fantasy_mock_draft_picks')
        .update({ notes: notes })
        .eq('id', mockDraftPickId)
        .select('*')

    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.delete('/deleteFantasyMockDraft', async (req, res) => {

    const { mockDraftId } = req.body;
    const { data, error } = await supabase
        .from('fantasy_mock_drafts')
        .delete()
        .eq('id', mockDraftId)
    
    if (error) {
        return res.status(500).json({ error: error.message })
    }

    const { data: mockDraftPicksData, error: mockDraftPicksError } = await supabase
        .from('fantasy_mock_draft_picks')
        .delete()
        .eq('fantasy_mock_draft_id', mockDraftId)

    if (mockDraftPicksError) {
        return res.status(500).json({ error: mockDraftPicksError.message })
    }

    return res.status(200).json({ data: mockDraftPicksData })
})

export default router;