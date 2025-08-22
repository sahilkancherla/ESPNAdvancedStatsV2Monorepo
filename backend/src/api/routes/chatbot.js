import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();
const pythonBackendUrl = process.env.PYTHON_BACKEND_SERVICE;

router.post('/askChatbot', async (req, res) => {
    const { question, conversationHistory, verifiedSources } = req.body;

    const url = `${pythonBackendUrl}/api/askChatbot`;
    const body = {
        question: question,
        conversation_history: conversationHistory,
        verified_sources: verifiedSources
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        return res.status(400).json({ error: 'Failed to ask chatbot' });
    }

    const data = await response.json();

    // Return full JSON from Python, or just the answer
    return res.status(200).json({ 
        answer: data.answer,
        cleaned_query: data.cleaned_query,
        follow_up_questions: data.follow_up_questions,
        processing_steps: data.processing_steps,
        question: data.question,
        sources_found: data.sources_found,
        verified_sources: data.verified_sources
    });
})

export default router;