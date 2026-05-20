# ICA Agent Integration Guide

## Linking IBM watsonx Code Assistant Agents to Your Agentic App

This guide explains how to integrate agents created in IBM watsonx Code Assistant (ICA) into your application to create an agentic app.

## Overview

An **agentic app** is an application that uses AI agents to autonomously perform tasks, make decisions, and interact with users or systems. When you create an agent in ICA, you can integrate it into your application through various methods.

## Prerequisites

1. **IBM watsonx Account** - Access to IBM watsonx platform
2. **ICA Agent Created** - An agent configured in IBM watsonx Code Assistant
3. **API Credentials** - API key and endpoint URL from IBM watsonx
4. **Node.js Application** - Your existing application (like this Task API)

## Integration Methods

### Method 1: REST API Integration (Recommended)

#### Step 1: Get Your ICA Agent Credentials

1. Log into IBM watsonx platform
2. Navigate to your agent in ICA
3. Get the following credentials:
   - **API Key** (or IAM token)
   - **Agent ID** or **Model ID**
   - **Endpoint URL** (e.g., `https://us-south.ml.cloud.ibm.com`)
   - **Project ID** or **Space ID**

#### Step 2: Install Required Dependencies

```bash
npm install axios dotenv
```

#### Step 3: Create Environment Configuration

Create a `.env` file in your project root:

```env
# IBM watsonx Configuration
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_AGENT_ID=your_agent_id_here
WATSONX_ENDPOINT=https://us-south.ml.cloud.ibm.com
WATSONX_VERSION=2024-05-31
```

#### Step 4: Create ICA Agent Service

Create `src/services/icaAgent.js`:

```javascript
const axios = require('axios');
require('dotenv').config();

class ICAAgentService {
    constructor() {
        this.apiKey = process.env.WATSONX_API_KEY;
        this.projectId = process.env.WATSONX_PROJECT_ID;
        this.agentId = process.env.WATSONX_AGENT_ID;
        this.endpoint = process.env.WATSONX_ENDPOINT;
        this.version = process.env.WATSONX_VERSION;
    }

    /**
     * Get IAM access token from API key
     */
    async getAccessToken() {
        try {
            const response = await axios.post(
                'https://iam.cloud.ibm.com/identity/token',
                new URLSearchParams({
                    grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
                    apikey: this.apiKey
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return response.data.access_token;
        } catch (error) {
            console.error('Error getting access token:', error.message);
            throw error;
        }
    }

    /**
     * Send a message to the ICA agent
     */
    async sendMessage(message, conversationId = null) {
        try {
            const accessToken = await this.getAccessToken();

            const payload = {
                input: {
                    message_type: 'text',
                    text: message
                },
                context: {
                    global: {
                        system: {
                            turn_count: 1
                        }
                    }
                }
            };

            if (conversationId) {
                payload.context.conversation_id = conversationId;
            }

            const response = await axios.post(
                `${this.endpoint}/ml/v1/deployments/${this.agentId}/text/generation?version=${this.version}`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    params: {
                        project_id: this.projectId
                    }
                }
            );

            return {
                response: response.data.results[0].generated_text,
                conversationId: response.data.conversation_id || conversationId
            };
        } catch (error) {
            console.error('Error sending message to ICA agent:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Process task with ICA agent
     */
    async processTask(taskData) {
        const message = `Process this task: ${JSON.stringify(taskData)}`;
        return await this.sendMessage(message);
    }

    /**
     * Get agent suggestions for task management
     */
    async getTaskSuggestions(tasks) {
        const message = `Analyze these tasks and provide suggestions: ${JSON.stringify(tasks)}`;
        return await this.sendMessage(message);
    }

    /**
     * Generate task description using agent
     */
    async generateTaskDescription(title) {
        const message = `Generate a detailed description for a task titled: "${title}"`;
        return await this.sendMessage(message);
    }
}

module.exports = new ICAAgentService();
```

#### Step 5: Integrate Agent into Your API

Update `src/app.js` to include agent endpoints:

```javascript
const icaAgent = require('./services/icaAgent');

// Agent endpoint - Get AI suggestions for tasks
app.post('/agent/suggestions', async (req, res) => {
    try {
        const result = await icaAgent.getTaskSuggestions(tasks);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get agent suggestions'
        });
    }
});

// Agent endpoint - Generate task description
app.post('/agent/generate-description', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        const result = await icaAgent.generateTaskDescription(title);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate description'
        });
    }
});

// Agent endpoint - Process task with AI
app.post('/agent/process-task', async (req, res) => {
    try {
        const taskData = req.body;
        const result = await icaAgent.processTask(taskData);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to process task with agent'
        });
    }
});

// Agent endpoint - Chat with agent
app.post('/agent/chat', async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const result = await icaAgent.sendMessage(message, conversationId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to chat with agent'
        });
    }
});
```

### Method 2: IBM watsonx SDK Integration

#### Install IBM watsonx SDK

```bash
npm install @ibm-cloud/watsonx-ai
```

#### Create Agent Service with SDK

```javascript
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');

class ICAAgentSDK {
    constructor() {
        this.client = new WatsonXAI({
            version: '2024-05-31',
            serviceUrl: process.env.WATSONX_ENDPOINT,
            authenticator: {
                apikey: process.env.WATSONX_API_KEY
            }
        });
    }

    async generateText(prompt) {
        const params = {
            input: prompt,
            modelId: process.env.WATSONX_AGENT_ID,
            projectId: process.env.WATSONX_PROJECT_ID,
            parameters: {
                max_new_tokens: 200,
                temperature: 0.7
            }
        };

        const response = await this.client.generateText(params);
        return response.result.results[0].generated_text;
    }
}

module.exports = new ICAAgentSDK();
```

## Usage Examples

### Example 1: Generate Task Description

```bash
curl -X POST http://localhost:3000/agent/generate-description \
  -H "Content-Type: application/json" \
  -d '{"title": "Implement user authentication"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "response": "Implement a secure user authentication system with login, registration, password reset, and session management. Include JWT tokens, bcrypt password hashing, and rate limiting.",
    "conversationId": "abc123..."
  }
}
```

### Example 2: Get Task Suggestions

```bash
curl -X POST http://localhost:3000/agent/suggestions \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "data": {
    "response": "Based on your current tasks, I suggest: 1) Prioritize security-related tasks, 2) Break down large tasks into smaller subtasks, 3) Add deadlines to time-sensitive items",
    "conversationId": "def456..."
  }
}
```

### Example 3: Chat with Agent

```bash
curl -X POST http://localhost:3000/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What should I work on first?",
    "conversationId": "abc123..."
  }'
```

## Advanced Integration Patterns

### Pattern 1: Autonomous Task Creation

```javascript
// Agent automatically creates tasks based on project analysis
app.post('/agent/auto-create-tasks', async (req, res) => {
    const { projectDescription } = req.body;
    
    const prompt = `Analyze this project and create a list of tasks: ${projectDescription}`;
    const result = await icaAgent.sendMessage(prompt);
    
    // Parse agent response and create tasks
    const suggestedTasks = parseAgentResponse(result.response);
    
    for (const task of suggestedTasks) {
        tasks.push({
            id: uuidv4(),
            ...task,
            createdAt: new Date().toISOString(),
            createdBy: 'agent'
        });
    }
    
    res.json({ success: true, data: tasks });
});
```

### Pattern 2: Task Priority Recommendation

```javascript
// Agent analyzes and recommends task priorities
app.post('/agent/prioritize-tasks', async (req, res) => {
    const prompt = `Analyze these tasks and recommend priorities: ${JSON.stringify(tasks)}`;
    const result = await icaAgent.sendMessage(prompt);
    
    res.json({ success: true, data: result });
});
```

### Pattern 3: Intelligent Task Assignment

```javascript
// Agent assigns tasks to team members based on skills
app.post('/agent/assign-tasks', async (req, res) => {
    const { teamMembers } = req.body;
    
    const prompt = `Assign these tasks to team members based on their skills: 
        Tasks: ${JSON.stringify(tasks)}
        Team: ${JSON.stringify(teamMembers)}`;
    
    const result = await icaAgent.sendMessage(prompt);
    
    res.json({ success: true, data: result });
});
```

## Best Practices

### 1. Error Handling
```javascript
try {
    const result = await icaAgent.sendMessage(message);
    // Handle success
} catch (error) {
    if (error.response?.status === 401) {
        // Handle authentication error
    } else if (error.response?.status === 429) {
        // Handle rate limiting
    } else {
        // Handle other errors
    }
}
```

### 2. Caching Responses
```javascript
const cache = new Map();

async function getCachedResponse(key, fetchFn) {
    if (cache.has(key)) {
        return cache.get(key);
    }
    
    const result = await fetchFn();
    cache.set(key, result);
    return result;
}
```

### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const agentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/agent/', agentLimiter);
```

### 4. Conversation Management
```javascript
// Store conversation context
const conversations = new Map();

app.post('/agent/chat', async (req, res) => {
    const { message, userId } = req.body;
    
    let conversationId = conversations.get(userId);
    
    const result = await icaAgent.sendMessage(message, conversationId);
    
    conversations.set(userId, result.conversationId);
    
    res.json({ success: true, data: result });
});
```

## Testing Your Agent Integration

Create `tests/integration/agent.test.js`:

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('ICA Agent Integration', () => {
    it('should generate task description', async () => {
        const response = await request(app)
            .post('/agent/generate-description')
            .send({ title: 'Test Task' })
            .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.response).toBeDefined();
    });
    
    it('should chat with agent', async () => {
        const response = await request(app)
            .post('/agent/chat')
            .send({ message: 'Hello' })
            .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.conversationId).toBeDefined();
    });
});
```

## Security Considerations

1. **Never expose API keys** - Use environment variables
2. **Validate input** - Sanitize all user input before sending to agent
3. **Rate limiting** - Prevent abuse of agent endpoints
4. **Authentication** - Require authentication for agent endpoints
5. **Audit logging** - Log all agent interactions

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify API key is correct
   - Check if token has expired
   - Ensure proper IAM permissions

2. **Rate Limiting**
   - Implement exponential backoff
   - Cache responses when possible
   - Use batch requests

3. **Timeout Errors**
   - Increase timeout settings
   - Implement retry logic
   - Use async processing for long operations

## Next Steps

1. ✅ Set up IBM watsonx account and create agent
2. ✅ Get API credentials
3. ✅ Install dependencies
4. ✅ Create agent service
5. ✅ Integrate into your app
6. ✅ Test the integration
7. ✅ Deploy to production

## Resources

- [IBM watsonx Documentation](https://www.ibm.com/docs/en/watsonx)
- [IBM watsonx Code Assistant](https://www.ibm.com/products/watsonx-code-assistant)
- [IBM Cloud API Docs](https://cloud.ibm.com/apidocs)
- [Node.js SDK](https://github.com/IBM/node-sdk-core)

## Support

For issues with:
- **ICA Agent Creation**: Contact IBM watsonx support
- **API Integration**: Check IBM Cloud documentation
- **This Implementation**: Review the code examples above

---

**Made with Bob** 🤖