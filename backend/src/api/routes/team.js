import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

router.get('/getBigBoard', async (req, res) => {
    const teamId = req.query.teamId;

    const { data, error } = await supabase
        .from('big_board')
        .select('*')
        .eq('team_id', teamId)

    if (error) {
        return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ nflPlayers: data })
})

// DELETE /team/clearBigBoard
router.delete('/clearBigBoard', async (req, res) => {
    const { teamId } = req.body;
  
    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }
  
    const { error } = await supabase
      .from('big_board')
      .delete()
      .eq('team_id', teamId);
  
    if (error) {
      return res.status(500).json({ error: 'Failed to clear big board' });
    }
  
    return res.status(200).json({ message: 'Big board cleared' });
});
  
router.post('/setBigBoard', async (req, res) => {
    const { bigBoardChunk } = req.body;
  
    if (!bigBoardChunk || !Array.isArray(bigBoardChunk)) {
      return res.status(400).json({ error: 'Invalid bigBoardChunk' });
    }
  
    console.log("got here");

    const { data, error } = await supabase
      .from('big_board')
      .upsert(bigBoardChunk);
  
      console.log("got here 2");

    if (error) {
        console.error('Supabase upsert error:', error);

      return res.status(500).json({ error: 'Failed to upsert big board chunk', details: error });
    }
  
    return res.status(200).json({ message: 'Big board chunk saved', data });
  });
  
  

export default router;