// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const google = require('google-it');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

const allowedOrigins = [
    'http://localhost:3000',
    'https://lawyer-app-orcin.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());

// Environment variables for API keys (should be set in .env file)
const KANOON_API_KEY = process.env.KANOON_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log('Gemini API Key Loaded:', GEMINI_API_KEY ? 'Yes' : 'No');

// Proxy endpoint for Indian Kanoon API search
app.post('/proxy/kanoon/search', async (req, res) => {
    console.log('Received request for /proxy/kanoon/search');
    console.log('Request body:', req.body);
    console.log('KANOON_API_KEY available:', !!process.env.KANOON_API_KEY);

    try {
        const { query, court, year } = req.body;
        
        if (!query) {
            console.error('Validation Error: Search query is required.');
            return res.status(400).json({ error: 'Search query is required' });
        }

        console.log(`Making request to Kanoon API with query: "${query}", court: "${court}", year: "${year}"`);

        const url = 'https://api.indiankanoon.org/search/';
        const formData = new URLSearchParams();
        formData.append('formInput', query);
        formData.append('pagenum', '0');
        if (court) formData.append('court', court);
        if (year) formData.append('year', year);

        const response = await axios.post(url, formData.toString(), {
            headers: {
                'Authorization': `Token ${process.env.KANOON_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });

        console.log('Successfully received response from Kanoon API:', response.status);
        res.json(response.data);

    } catch (error) {
        console.error('--- Kanoon API Proxy Error ---');
        console.error('Timestamp:', new Date().toISOString());
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('Error Request:', 'No response received from Kanoon API.');
            console.error(error.request);
        } else {
            console.error('Error Message:', error.message);
        }
        console.error('Stack Trace:', error.stack);
        console.error('--- End of Error Report ---');

        res.status(500).json({ 
            error: 'Failed to fetch data from Kanoon API.', 
            details: error.response ? error.response.data : error.message 
        });
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
