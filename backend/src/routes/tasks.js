const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// GET all tasks (optionally filter by status)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single task by id
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, deadline, estimatedDuration, priority, notes } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = new Task({
      title,
      description,
      status,
      deadline,
      estimatedDuration,
      priority,
      notes,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, deadline, estimatedDuration, priority, notes } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        deadline,
        estimatedDuration,
        priority,
        notes,
      },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;