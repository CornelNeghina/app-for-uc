# Task API - Integration Testing Example

A simple REST API for managing tasks, designed specifically for learning and practicing integration testing.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ RESTful API design
- ✅ In-memory data storage (perfect for testing)
- ✅ Comprehensive integration tests
- ✅ Error handling
- ✅ Health check endpoint

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Jest** - Testing framework
- **Supertest** - HTTP assertions for integration tests
- **UUID** - Unique ID generation

## Project Structure

```
app-for-uc/
├── src/
│   ├── app.js          # Express app and routes
│   └── server.js       # Server entry point
├── tests/
│   └── integration/
│       └── tasks.test.js  # Integration tests
├── package.json
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/health` - Check if API is running

### Tasks
- **GET** `/tasks` - Get all tasks
- **GET** `/tasks/:id` - Get a specific task
- **POST** `/tasks` - Create a new task
- **PUT** `/tasks/:id` - Update a task
- **DELETE** `/tasks/:id` - Delete a specific task
- **DELETE** `/tasks` - Delete all tasks

## API Examples

### Create a Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Integration Testing",
    "description": "Master integration testing with Jest and Supertest",
    "completed": false
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Learn Integration Testing",
    "description": "Master integration testing with Jest and Supertest",
    "completed": false,
    "createdAt": "2026-05-20T13:44:00.000Z"
  }
}
```

### Get All Tasks
```bash
curl http://localhost:3000/tasks
```

### Get a Specific Task
```bash
curl http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000
```

### Update a Task
```bash
curl -X PUT http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

### Delete a Task
```bash
curl -X DELETE http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run only integration tests:
```bash
npm run test:integration
```

### Run tests with coverage:
```bash
npm test -- --coverage
```

## Integration Tests Overview

The integration tests cover:

1. **Health Check** - Verify API is running
2. **Create Tasks** - Test POST endpoint with various scenarios
3. **Read Tasks** - Test GET endpoints (all tasks and specific task)
4. **Update Tasks** - Test PUT endpoint with full and partial updates
5. **Delete Tasks** - Test DELETE endpoints
6. **Complete Workflow** - Test full CRUD cycle
7. **Error Handling** - Test error responses (404, 400, etc.)

### Test Structure

Each test suite follows this pattern:
- **Setup**: Clear data before each test
- **Action**: Perform API operation
- **Assertion**: Verify response and side effects

### Example Test

```javascript
it('should create a new task', async () => {
  const newTask = {
    title: 'Test Task',
    description: 'This is a test'
  };

  const response = await request(app)
    .post('/tasks')
    .send(newTask)
    .expect(201);

  expect(response.body.success).toBe(true);
  expect(response.body.data.title).toBe(newTask.title);
});
```

## Writing Your Own Integration Tests

### Key Concepts

1. **Use Supertest**: Makes HTTP requests to your Express app without starting a server
2. **Test Isolation**: Each test should be independent (use `beforeEach` to reset state)
3. **Test Real Scenarios**: Test complete workflows, not just individual endpoints
4. **Verify Side Effects**: Check that operations actually changed the data
5. **Test Error Cases**: Ensure proper error handling

### Best Practices

- ✅ Test happy paths and error cases
- ✅ Use descriptive test names
- ✅ Group related tests with `describe` blocks
- ✅ Clean up data between tests
- ✅ Test the full request/response cycle
- ✅ Verify HTTP status codes
- ✅ Check response structure and data

## Task Model

```javascript
{
  id: string,           // UUID v4
  title: string,        // Required
  description: string,  // Optional, defaults to ''
  completed: boolean,   // Optional, defaults to false
  createdAt: string,    // ISO 8601 timestamp
  updatedAt: string     // ISO 8601 timestamp (only on updates)
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Learning Resources

### Integration Testing
- Test complete user workflows
- Verify API contracts
- Ensure components work together
- Test with real HTTP requests

### Why This Example?
- Simple enough to understand quickly
- Complex enough to demonstrate real patterns
- In-memory storage makes tests fast and isolated
- Covers all CRUD operations
- Includes error handling scenarios

## Next Steps

1. Run the application: `npm start`
2. Test the API manually with curl or Postman
3. Run the integration tests: `npm test`
4. Study the test file to understand patterns
5. Add your own tests for new scenarios
6. Extend the API with new features and test them

## License

ISC