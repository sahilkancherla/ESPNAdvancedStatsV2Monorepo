import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

router.get('/keepAlive', async (req, res) => {
    return res.status(200).json({ message: 'Alive' });
});

router.get('/getCurrentWeekCurrentYear', async (req, res) => {
    const { data, error } = await supabase
        .from('admin_settings')
        .select('current_week, current_year')
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ current_week: data.current_week, current_year: data.current_year });
});

router.post('/updateNFLData', async (req, res) => {
    const { week, year } = req.body;
    
    console.log(week, year)
    try {
        // Call the Python backend to update NFL data
        const response = await fetch(`${process.env.PYTHON_BACKEND_SERVICE}/api/updateNFLData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentWeek: week,
                year: year
            })
        });

        if (!response.ok) {
            throw new Error(`Python backend returned status: ${response.status}`);
        }

        const result = await response.json();
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error calling Python backend:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.post('/updateFantasyData', async (req, res) => {
    const { week, year, leagueId, swid, espnS2 } = req.body;
    
    try {
        // Call the Python backend to update fantasy data
        const response = await fetch(`${process.env.PYTHON_BACKEND_SERVICE}/api/updateFantasyData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentWeek: week,
                year: year,
                externalLeagueId: leagueId,
                swid: swid,
                espnS2: espnS2
            })
        });

        if (!response.ok) {
            throw new Error(`Python backend returned status: ${response.status}`);
        }

        const result = await response.json();
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error calling Python backend:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.post('/updateFantasyDraftData', async (req, res) => {
    const { leagueId, swid, espnS2, year } = req.body;
    
    try {
        // Call the Python backend to update fantasy draft data
        const response = await fetch(`${process.env.PYTHON_BACKEND_SERVICE}/api/updateFantasyDraftData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                externalLeagueId: leagueId,
                swid: swid,
                espnS2: espnS2,
                year: year
            })
        });

        if (!response.ok) {
            throw new Error(`Python backend returned status: ${response.status}`);
        }

        const result = await response.json();
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error calling Python backend:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.post('/updateLeagueCurrentRosters', async (req, res) => {
    const { leagueId, swid, espnS2, year } = req.body;
    
    try {
        // Call the Python backend to update current rosters
        const response = await fetch(`${process.env.PYTHON_BACKEND_SERVICE}/api/updateLeagueCurrentRosters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                leagueId: leagueId,
                swid: swid,
                espnS2: espnS2,
                year: year
            })
        });

        if (!response.ok) {
            throw new Error(`Python backend returned status: ${response.status}`);
        }

        const result = await response.json();
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error calling Python backend:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.post('/updateNFLBigPlays', async (req, res) => {
    const { week, year } = req.body;
    
    try {
        // Call the Python backend to update NFL big plays
        const response = await fetch(`${process.env.PYTHON_BACKEND_SERVICE}/api/updateNFLBigPlays`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                week: week,
                year: year
            })
        });

        if (!response.ok) {
            throw new Error(`Python backend returned status: ${response.status}`);
        }

        const result = await response.json();
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error calling Python backend:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.post('/addNewTimeWindow', async (req, res) => {
    const { startTime, endTime, week, year } = req.body;
    
    try {
        // Insert new time window into Supabase
        const { data, error } = await supabase
            .from('admin_point_tracking_time_windows')
            .insert([
                {
                    start_time: startTime,
                    end_time: endTime,
                    week: week,
                    year: year
                }
            ])
            .select();

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error('Error adding time window:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.post('/deleteTimeWindow', async (req, res) => {
    const { id } = req.body;
    
    try {
        // Delete time window from Supabase
        const { data, error } = await supabase
            .from('admin_point_tracking_time_windows')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error('Error deleting time window:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.post('/updateTimeWindow', async (req, res) => {
    const { id, startTime, endTime, week, year } = req.body;
    
    try {
        // Update time window in Supabase
        const { data, error } = await supabase
            .from('admin_point_tracking_time_windows')
            .update({
                start_time: startTime,
                end_time: endTime,
                week: week,
                year: year
            })
            .eq('id', id)
            .select();

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error('Error updating time window:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.get('/getTimeWindows', async (req, res) => {
    const { year } = req.query;
    
    const { data, error } = await supabase
        .from('admin_point_tracking_time_windows')
        .select('*')
        .eq('year', year)
        .order('end_time', { ascending: true });
    
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ data: data });
});

export default router;