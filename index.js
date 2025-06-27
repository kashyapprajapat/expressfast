const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;
const Apidocify = require('apidocify');

// Middleware to parse JSON requests
app.use(express.json());

const OPENAI_API_KEY = ""

// Function to call OpenAI API
async function callOpenAI(userQuery) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // You can change this to 'gpt-4' if you have access
        messages: [
          {
            role: 'user',
            content: userQuery
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    throw new Error('Failed to get response from OpenAI');
  }
}

// Route 1: whoisfast (sum from 1 to 100,000,000)
app.get('/whoisfast', (req, res) => {
  const total = sumRange(1, 100000000);  // Sum from 1 to 100,000,000
  res.json({ route: 'whoisfast', sum: total });
});

// Route 2: secondfast (sum from 1 to 1,000,000,000)
app.get('/secondfast', (req, res) => {
  const total = sumRange(1, 1000000000);  // Sum from 1 to 1,000,000,000
  res.json({ route: 'secondfast', sum: total });
});

// Route 3: OpenAI Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { query } = req.body;

    // Validate input
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required in request body',
        example: { query: "What is Node.js?" }
      });
    }

    // Call OpenAI API
    const aiResponse = await callOpenAI(query);

    // Send response
    res.json({
      success: true,
      route: 'chat',
      query: query,
      response: aiResponse
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      route: 'chat',
      error: error.message
    });
  }
});

// Route 4: GET version of chat (for testing via browser)
app.get('/chat/:query', async (req, res) => {
  try {
    const { query } = req.params;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required',
        example: '/chat/What is Node.js?'
      });
    }

    // Decode URL parameter
    const decodedQuery = decodeURIComponent(query);
    const aiResponse = await callOpenAI(decodedQuery);

    res.json({
      success: true,
      route: 'chat-get',
      query: decodedQuery,
      response: aiResponse
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      route: 'chat-get',
      error: error.message
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    openai_configured: !!OPENAI_API_KEY,
    routes: ['/whoisfast', '/secondfast', '/chat (POST)', '/chat/:query (GET)', '/health', '/docs']
  });
});

// Function to sum numbers in a range
function sumRange(start, end) {
  let total = 0;
  for (let i = start; i <= end; i++) {
    total += i;
  }
  return total;
}

// Initialize apidocify after defining routes
new Apidocify(app, {
  docsPath: '/docs',
  title: 'Express Fast API - Calculate Sums & OpenAI Chat',
  version: '1.0.0',
  description: 'API for fast calculations and OpenAI ChatGPT integration'
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/docs`);
  console.log(`Health Check: http://localhost:${port}/health`);
  console.log(`\nAvailable routes:`);
  console.log(`- GET  /whoisfast (sum 1 to 100M)`);
  console.log(`- GET  /secondfast (sum 1 to 1B)`);
  console.log(`- POST /chat (OpenAI chat)`);
  console.log(`- GET  /chat/:query (OpenAI chat via URL)`);
  console.log(`- GET  /health (server status)`);
  console.log(`- GET  /docs (API documentation)`);
});