const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(bodyParser.json());

// In-memory data store
let tasks = [];

// GET /tasks - Get all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length
    });
});

// GET /tasks/:id - Get a single task by ID
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);

    if (!task) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }

    res.status(200).json({
        success: true,
        data: task
    });
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
    const { title, description, completed } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            error: 'Title is required'
        });
    }

    const newTask = {
        id: uuidv4(),
        title,
        description: description || '',
        completed: completed || false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    res.status(201).json({
        success: true,
        data: newTask
    });
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }

    const { title, description, completed } = req.body;

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: title !== undefined ? title : tasks[taskIndex].title,
        description: description !== undefined ? description : tasks[taskIndex].description,
        completed: completed !== undefined ? completed : tasks[taskIndex].completed,
        updatedAt: new Date().toISOString()
    };

    res.status(200).json({
        success: true,
        data: tasks[taskIndex]
    });
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.status(200).json({
        success: true,
        data: deletedTask
    });
});

// DELETE /tasks - Delete all tasks (useful for testing)
app.delete('/tasks', (req, res) => {
    const count = tasks.length;
    tasks = [];

    res.status(200).json({
        success: true,
        message: `Deleted ${count} tasks`
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

module.exports = app;

// Made with Bob
