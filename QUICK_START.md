# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Server

```bash
npm start
```

You should see:
```
Server is running on port 3000
Health check: http://localhost:3000/health
Tasks API: http://localhost:3000/tasks
```

## Step 3: Test the API

### Option A: Using curl (Command Line)

#### 1. Create a Task (POST)
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread", "completed": false}'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "abc123...",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "createdAt": "2026-05-20T13:46:00.000Z"
  }
}
```

#### 2. Get All Tasks (GET)
```bash
curl http://localhost:3000/tasks
```

#### 3. Get a Specific Task (GET)
```bash
curl http://localhost:3000/tasks/abc123...
```
(Replace `abc123...` with the actual ID from step 1)

#### 4. Update a Task (PUT)
```bash
curl -X PUT http://localhost:3000/tasks/abc123... \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

#### 5. Delete a Task (DELETE)
```bash
curl -X DELETE http://localhost:3000/tasks/abc123...
```

### Option B: Using Postman or Thunder Client (VS Code Extension)

1. **Install Thunder Client** (VS Code Extension) or use Postman
2. Create a new request
3. Set method to **POST**
4. Set URL to: `http://localhost:3000/tasks`
5. Go to **Body** tab
6. Select **JSON**
7. Enter:
```json
{
  "title": "My First Task",
  "description": "This is a test task",
  "completed": false
}
```
8. Click **Send**

### Option C: Using JavaScript/Node.js

Create a file `test-api.js`:

```javascript
const http = require('http');

// Function to make POST request
function createTask(task) {
  const data = JSON.stringify(task);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/tasks',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', JSON.parse(body));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(data);
  req.end();
}

// Create a task
createTask({
  title: 'Learn Node.js',
  description: 'Complete the tutorial',
  completed: false
});
```

Run it:
```bash
node test-api.js
```

### Option D: Using fetch (Browser or Node.js 18+)

```javascript
// Create a task
async function createTask() {
  const response = await fetch('http://localhost:3000/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'My Task',
      description: 'Task description',
      completed: false
    })
  });
  
  const data = await response.json();
  console.log('Created task:', data);
  return data.data.id; // Return the task ID
}

// Get all tasks
async function getAllTasks() {
  const response = await fetch('http://localhost:3000/tasks');
  const data = await response.json();
  console.log('All tasks:', data);
}

// Update a task
async function updateTask(taskId) {
  const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      completed: true
    })
  });
  
  const data = await response.json();
  console.log('Updated task:', data);
}

// Delete a task
async function deleteTask(taskId) {
  const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
    method: 'DELETE'
  });
  
  const data = await response.json();
  console.log('Deleted task:', data);
}

// Run the workflow
async function runWorkflow() {
  const taskId = await createTask();
  await getAllTasks();
  await updateTask(taskId);
  await deleteTask(taskId);
}

runWorkflow();
```

## Step 4: Run Integration Tests

```bash
npm test
```

This will run all the integration tests and show you:
- Which tests passed ✓
- Test coverage
- Any failures

## Common Examples

### Create a Simple Task (Only Title Required)
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Simple Task"}'
```

### Create a Complete Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Project",
    "description": "Finish the integration tests",
    "completed": false
  }'
```

### Mark Task as Complete
```bash
curl -X PUT http://localhost:3000/tasks/YOUR_TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Delete All Tasks (Useful for Testing)
```bash
curl -X DELETE http://localhost:3000/tasks
```

## Troubleshooting

### Port Already in Use
If you see "Port 3000 is already in use":
```bash
# Find the process using port 3000
lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 PID

# Or use a different port
PORT=3001 npm start
```

### Cannot POST /tasks
Make sure:
1. Server is running (`npm start`)
2. URL is correct: `http://localhost:3000/tasks`
3. Content-Type header is set to `application/json`
4. Body is valid JSON

### Title is Required Error
The API requires at least a `title` field:
```json
{
  "title": "Your task title"
}
```

## Next Steps

1. ✅ Start the server
2. ✅ Create some tasks using curl or Postman
3. ✅ Run the integration tests
4. ✅ Study the test file to understand patterns
5. ✅ Add your own endpoints and tests

Happy testing! 🚀