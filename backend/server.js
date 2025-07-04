// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const google = require('google-it');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables for API keys (should be set in .env file)
const KANOON_API_KEY = process.env.KANOON_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log('Gemini API Key Loaded:', GEMINI_API_KEY ? 'Yes' : 'No');

// Proxy endpoint for Indian Kanoon API search
app.post('/proxy/kanoon/search', async (req, res) => {
    try {
        const { query, court, year } = req.body;
        console.log('Making request to Kanoon API with query:', query, 'court:', court, 'year:', year);
        console.log('Using API key from environment variable:', KANOON_API_KEY ? 'Key is set (hidden for security)' : 'Key is not set');
        // Use POST request with form-urlencoded data to match expected API format
        const url = 'https://api.indiankanoon.org/search/';
        let formData = `formInput=${encodeURIComponent(query)}&pagenum=0`;
        if (court) formData += `&court=${encodeURIComponent(court)}`;
        if (year) formData += `&year=${encodeURIComponent(year)}`;
        const response = await axios.post(url, formData, {
            headers: {
                'Authorization': `Token ${KANOON_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });
        console.log('Received response from Kanoon API:', response.status, response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying Kanoon API request:', error.message, error.response?.data || 'No additional data');
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch data from Kanoon API', details: error.response?.data || error.message });
    }
});

// Check if the message is asking about the bot's identity
function isIdentityQuestion(message) {
    const identityPhrases = [
        'who are you',
        'what is your name',
        'what are you',
        'are you a bot',
        'are you human',
        'your name',
        'introduce yourself'
    ];
    
    const messageLower = message.toLowerCase();
    return identityPhrases.some(phrase => messageLower.includes(phrase));
}

// Proxy endpoint for Gemini API chat
app.post('/proxy/gemini/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Handle identity questions directly
        if (isIdentityQuestion(message.content)) {
            return res.json({
                candidates: [{
                    content: {
                        parts: [{
                            text: "I am Neethi, your AI-powered legal research assistant. I'm here to help you with legal information and research related to Indian law."
                        }]
                    }
                }]
            });
        }

        // Perform a Google search for the user's message content
        const searchResults = await google({ query: message.content });

        // Augment the message with search results
        const augmentedMessage = {
            ...message,
            content: `${message.content}\n\nHere are some relevant search results:\n${searchResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}`
        };

        const contents = history.map(h => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.message }]
        }));
        contents.push({
            role: 'user',
            parts: [{ text: augmentedMessage.content }]
        });

        console.log('Sending request to Gemini API...');
        const modelName = 'gemini-2.5-flash'; // Using Gemini 2.5 Flash model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await axios.post(url, {
            contents
        }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            }
        );
        console.log('Received response from Gemini API');
        res.json(response.data);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            headers: error.response?.headers,
            data: error.response?.data
        });
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch data from Gemini API', 
            details: error.response?.data || error.message 
        });
    }
});

// Start the server
module.exports = app;
