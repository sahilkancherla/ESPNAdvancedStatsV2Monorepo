import express from 'express';
import supabase from './supabaseClient.js';
import cors from 'cors';
import http from 'http';

// Create the Express app
const app = express();

// Create an HTTP server from the Express app
const server = http.createServer(app);

app.use(cors({
  origin: '*',   // or '*' for all origins
  methods: ['GET', 'POST', 'DELETE'],
}));
app.use(express.json());

// Import routes
import authRouter from './routes/auth.js';
import leagueRouter from './routes/league.js';
import nflRouter from './routes/nfl.js';
import teamRouter from './routes/team.js';
import chatbotRouter from './routes/chatbot.js';
import mockRouter from './routes/mock.js';
// Middleware to add Supabase client to all routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Use routes
app.use('/auth', authRouter);
app.use('/league', leagueRouter);
app.use('/nfl', nflRouter);
app.use('/team', teamRouter);
app.use('/chatbot', chatbotRouter);
app.use('/mock', mockRouter);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
