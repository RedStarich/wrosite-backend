const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();


function readWroFile() {
    try {
        const data = fs.readFileSync('wro.txt', 'utf8');
        return data;
    } catch (error) {
        console.error('Error reading wro.txt file:', error);
        return '';
    }
}

const wroContext = readWroFile();


const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;


const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};




app.post('/api/gemini', async (req, res) => {
    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [{ text: wroContext }]
                }
            ],
        });

        console.log(req.body.contents[0].parts[0].text);
    
        const result = await chatSession.sendMessage(req.body.contents[0].parts[0].text);
        res.send(result.response.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error('Error response:', error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch Gemini response',
            details: error.response?.data || error.message
        });
    }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
