import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// POST /signup
router.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;
  
    // 1. Sign up via Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
  
    if (error) return res.status(400).json({ error: error.message });
  
    // 2. Save user info in your database
    const userId = data.user.id;
  
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([{ id: userId, email: email, username: username }])
      .select()
      .single();
  
    if (dbError) return res.status(500).json({ error: dbError.message });
  
    res.status(200).json({ user: userData });
});
  
// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (authError) return res.status(400).json({ error: authError.message });
  
    const userId = authData.user.id;
  
    // 2. Fetch user details from 'users' table using the ID from Supabase Auth
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single(); // ensures only one row is returned
  
    if (dbError) return res.status(500).json({ error: dbError.message });
  
    // 3. Return session and user info
    res.status(200).json({
      session: authData.session,
      user: userData,
    });
});

export default router;