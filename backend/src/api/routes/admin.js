import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

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

export default router;