import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

router.get('/getNFLTeams', async (req, res) => {
    const { data, error } = await supabase
        .from('nfl_teams')
        .select('*')
    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.get('/getNFLPlayers', async (req, res) => {
    const { data, error } = await supabase
        .from('nfl_players')
        .select('*')
        .order('fp_adp_half_ppr_avg', { ascending: true })
    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.get('/getNFLSchedule', async (req, res) => {
    const { year } = req.query;
    const { data, error } = await supabase
        .from('nfl_schedule')
        .select('*')
        .eq('year', year)
    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.get('/getNFLPlayerWeeklyStats', async (req, res) => {
    const { year } = req.query;
    const { data, error } = await supabase
        .from('nfl_player_weekly_stats')
        .select('*')
        .eq('year', year)
    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.get('/getNFLPlayerSeasonStats', async (req, res) => {
    const { year } = req.query;
    const { data, error } = await supabase
        .from('nfl_player_season_stats')
        .select('*')
        .eq('year', year)
    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.get('/getNFLTeamWeeklyStats', async (req, res) => {
    const { year } = req.query;
    const { data, error } = await supabase
        .from('nfl_team_weekly_stats')
        .select('*')
        .eq('year', year)
    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.get('/getNFLTeamSeasonStats', async (req, res) => {
    const { year } = req.query;
    const { data, error } = await supabase
        .from('nfl_team_season_stats')
        .select('*')
        .eq('year', year)
    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data })
})

router.get('/getNFLPlayersTeamsStatsSchedule', async (req, res) => {
    const { data, error } = await supabase
        .from('nfl_teams')
        .select('*')
    if (error) {
        return res.status(500).json({ error: error.message })
    }

    const { data: nflPlayers, error: nflPlayersError } = await supabase
        .from('nfl_players')
        .select('*')
        .not('team_id', 'is', null)

    const { data: schedule, error: scheduleError } = await supabase
        .from('nfl_schedule')
        .select('*')
        .eq('year', 2025)

    const { data: playerStats, error: playerStatsError } = await supabase
        .from('nfl_player_weekly_stats')
        .select('*')

    if (playerStatsError) {
        return res.status(500).json({ error: playerStatsError.message })
    }
    if (nflPlayersError) {
        return res.status(500).json({ error: nflPlayersError.message })
    }
    return res.status(200).json({ nflPlayers: nflPlayers, nflTeams: data, nflSchedule: schedule, nflPlayerWeeklyStatsLastSeason: playerStats })
})

router.get('/getNFLSchedule', async (req, res) => {
    const { year } = req.query;

    const { data: schedule, error: scheduleError } = await supabase
        .from('nfl_schedule')
        .select('*')
        .eq('year', year);

    if (scheduleError) {
        return res.status(500).json({ error: 'Failed to fetch NFL schedule', details: scheduleError.message });
    }

    return res.status(200).json({ schedule });
});

export default router;