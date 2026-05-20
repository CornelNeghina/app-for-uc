const request = require('supertest');
const app = require('../../src/app');

describe('Tasks API Integration Tests', () => {
    // Clear all tasks before each test
    beforeEach(async () => {
        await request(app).delete('/tasks');
    });

    describe('GET /health', () => {
        it('should return health check status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'API is running'
            });
        });
    });

    describe('POST /tasks', () => {
        it('should create a new task with all fields', async () => {
            const newTask = {
                title: 'Test Task',
                description: 'This is a test task',
                completed: false
            };

            const response = await request(app)
                .post('/tasks')
                .send(newTask)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                title: newTask.title,
                description: newTask.description,
                completed: newTask.completed
            });
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('createdAt');
        });

        it('should create a task with only title', async () => {
            const newTask = {
                title: 'Minimal Task'
            };

            const response = await request(app)
                .post('/tasks')
                .send(newTask)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(newTask.title);
            expect(response.body.data.description).toBe('');
            expect(response.body.data.completed).toBe(false);
        });

        it('should return 400 when title is missing', async () => {
            const response = await request(app)
                .post('/tasks')
                .send({ description: 'No title' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Title is required');
        });
    });

    describe('GET /tasks', () => {
        it('should return empty array when no tasks exist', async () => {
            const response = await request(app)
                .get('/tasks')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
            expect(response.body.count).toBe(0);
        });

        it('should return all tasks', async () => {
            // Create multiple tasks
            await request(app).post('/tasks').send({ title: 'Task 1' });
            await request(app).post('/tasks').send({ title: 'Task 2' });
            await request(app).post('/tasks').send({ title: 'Task 3' });

            const response = await request(app)
                .get('/tasks')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(3);
            expect(response.body.count).toBe(3);
        });
    });

    describe('GET /tasks/:id', () => {
        it('should return a specific task by id', async () => {
            // Create a task
            const createResponse = await request(app)
                .post('/tasks')
                .send({ title: 'Specific Task' });

            const taskId = createResponse.body.data.id;

            // Get the task
            const response = await request(app)
                .get(`/tasks/${taskId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(taskId);
            expect(response.body.data.title).toBe('Specific Task');
        });

        it('should return 404 for non-existent task', async () => {
            const response = await request(app)
                .get('/tasks/non-existent-id')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Task not found');
        });
    });

    describe('PUT /tasks/:id', () => {
        it('should update a task completely', async () => {
            // Create a task
            const createResponse = await request(app)
                .post('/tasks')
                .send({ title: 'Original Task', description: 'Original description' });

            const taskId = createResponse.body.data.id;

            // Update the task
            const updateData = {
                title: 'Updated Task',
                description: 'Updated description',
                completed: true
            };

            const response = await request(app)
                .put(`/tasks/${taskId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(taskId);
            expect(response.body.data.title).toBe(updateData.title);
            expect(response.body.data.description).toBe(updateData.description);
            expect(response.body.data.completed).toBe(updateData.completed);
            expect(response.body.data).toHaveProperty('updatedAt');
        });

        it('should update only specific fields', async () => {
            // Create a task
            const createResponse = await request(app)
                .post('/tasks')
                .send({ title: 'Original Task', description: 'Original description' });

            const taskId = createResponse.body.data.id;

            // Update only completed status
            const response = await request(app)
                .put(`/tasks/${taskId}`)
                .send({ completed: true })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Original Task');
            expect(response.body.data.description).toBe('Original description');
            expect(response.body.data.completed).toBe(true);
        });

        it('should return 404 when updating non-existent task', async () => {
            const response = await request(app)
                .put('/tasks/non-existent-id')
                .send({ title: 'Updated' })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Task not found');
        });
    });

    describe('DELETE /tasks/:id', () => {
        it('should delete a specific task', async () => {
            // Create a task
            const createResponse = await request(app)
                .post('/tasks')
                .send({ title: 'Task to Delete' });

            const taskId = createResponse.body.data.id;

            // Delete the task
            const deleteResponse = await request(app)
                .delete(`/tasks/${taskId}`)
                .expect(200);

            expect(deleteResponse.body.success).toBe(true);
            expect(deleteResponse.body.data.id).toBe(taskId);

            // Verify task is deleted
            await request(app)
                .get(`/tasks/${taskId}`)
                .expect(404);
        });

        it('should return 404 when deleting non-existent task', async () => {
            const response = await request(app)
                .delete('/tasks/non-existent-id')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Task not found');
        });
    });

    describe('DELETE /tasks', () => {
        it('should delete all tasks', async () => {
            // Create multiple tasks
            await request(app).post('/tasks').send({ title: 'Task 1' });
            await request(app).post('/tasks').send({ title: 'Task 2' });
            await request(app).post('/tasks').send({ title: 'Task 3' });

            // Delete all tasks
            const response = await request(app)
                .delete('/tasks')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Deleted 3 tasks');

            // Verify all tasks are deleted
            const getResponse = await request(app).get('/tasks');
            expect(getResponse.body.count).toBe(0);
        });
    });

    describe('Integration Workflow', () => {
        it('should handle complete CRUD workflow', async () => {
            // 1. Create a task
            const createResponse = await request(app)
                .post('/tasks')
                .send({ title: 'Workflow Task', description: 'Test workflow' })
                .expect(201);

            const taskId = createResponse.body.data.id;

            // 2. Read the task
            const getResponse = await request(app)
                .get(`/tasks/${taskId}`)
                .expect(200);

            expect(getResponse.body.data.title).toBe('Workflow Task');

            // 3. Update the task
            const updateResponse = await request(app)
                .put(`/tasks/${taskId}`)
                .send({ completed: true })
                .expect(200);

            expect(updateResponse.body.data.completed).toBe(true);

            // 4. Delete the task
            await request(app)
                .delete(`/tasks/${taskId}`)
                .expect(200);

            // 5. Verify deletion
            await request(app)
                .get(`/tasks/${taskId}`)
                .expect(404);
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/non-existent-route')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Route not found');
        });
    });
});

// Made with Bob
