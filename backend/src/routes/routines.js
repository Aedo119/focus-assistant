const express = require('express');
const Routine = require('../models/Routine');
const { generateForDate, reconcileOverride } = require('../services/routineGenerator');
const { toDateOnly } = require('../utils/date');
const router = express.Router();

// GET all routines
router.get('/', async (req, res) => {
  try {
    const routines = await Routine.find().sort({ createdAt: -1 });
    res.json(routines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single routine by id
router.get('/:id', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    res.json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new routine
router.post('/', async (req, res) => {
  try {
    const { name, days, tasks } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const routine = new Routine({ name, days: days || [], tasks: tasks || [] });
    await routine.save();
    res.status(201).json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a routine (name / days / tasks / active)
router.put('/:id', async (req, res) => {
  try {
    const { name, days, tasks, active } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (days !== undefined) update.days = days;
    if (tasks !== undefined) update.tasks = tasks;
    if (active !== undefined) update.active = active;

    const routine = await Routine.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    res.json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle a routine's active/enabled state
router.patch('/:id/toggle', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    routine.active = !routine.active;
    await routine.save();
    res.json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a routine
router.delete('/:id', async (req, res) => {
  try {
    const routine = await Routine.findByIdAndDelete(req.params.id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    res.json({ message: 'Routine deleted', routine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST pause this routine for one specific date only ("pause once").
// The routine itself is untouched and still fires on every other date.
router.post('/:id/pause', async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'date is required' });

    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });

    const target = toDateOnly(date);
    const alreadyPaused = routine.pausedDates.some(
      (p) => toDateOnly(p).getTime() === target.getTime()
    );
    if (!alreadyPaused) {
      routine.pausedDates.push(target);
      await routine.save();
    }
    res.json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a paused date — undoes a "pause once" so the routine resumes
// firing on that date again.
router.delete('/:id/pause', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date is required' });

    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });

    const target = toDateOnly(date).getTime();
    routine.pausedDates = routine.pausedDates.filter(
      (p) => toDateOnly(p).getTime() !== target
    );
    await routine.save();
    res.json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create or replace a per-task, per-date override (skip/move/replace
// a single occurrence of a single routine task, without touching the
// routine template). Reconciles immediately against an already-generated
// task for that date, if one exists.
router.post('/:id/task-overrides', async (req, res) => {
  try {
    const { date, routineTaskId, action, newTime, newTitle, newDuration } = req.body;
    if (!date || !routineTaskId || !action) {
      return res.status(400).json({ error: 'date, routineTaskId, and action are required' });
    }
    if (!['SKIP', 'MOVE', 'REPLACE'].includes(action)) {
      return res.status(400).json({ error: 'action must be SKIP, MOVE, or REPLACE' });
    }
    if (action === 'MOVE' && !newTime) {
      return res.status(400).json({ error: 'newTime is required for a MOVE override' });
    }
    if (action === 'REPLACE' && !newTitle) {
      return res.status(400).json({ error: 'newTitle is required for a REPLACE override' });
    }

    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });

    const routineTaskExists = routine.tasks.some((t) => t._id.toString() === routineTaskId);
    if (!routineTaskExists) return res.status(404).json({ error: 'Routine task not found' });

    const target = toDateOnly(date);

    // Replace any existing override for this same task + date rather than stacking them.
    routine.taskOverrides = routine.taskOverrides.filter(
      (o) => !(o.routineTaskId === routineTaskId && toDateOnly(o.date).getTime() === target.getTime())
    );
    const override = {
      date: target,
      routineTaskId,
      action,
      newTime: action === 'MOVE' ? newTime : null,
      newTitle: action === 'REPLACE' ? newTitle : null,
      newDuration: action === 'REPLACE' && newDuration !== undefined ? newDuration : null,
    };
    routine.taskOverrides.push(override);
    await routine.save();

    await reconcileOverride(routine, override);

    res.json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove a per-task, per-date override, reverting that occurrence
// back to the routine's normal template. Does not undo whatever already
// happened to an already-generated task (e.g. a skip that already
// deleted it) — it only stops the override from applying going forward.
router.delete('/:id/task-overrides', async (req, res) => {
  try {
    const { date, routineTaskId } = req.query;
    if (!date || !routineTaskId) {
      return res.status(400).json({ error: 'date and routineTaskId are required' });
    }

    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });

    const target = toDateOnly(date).getTime();
    routine.taskOverrides = routine.taskOverrides.filter(
      (o) => !(o.routineTaskId === routineTaskId && toDateOnly(o.date).getTime() === target)
    );
    await routine.save();
    res.json(routine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate task instances for a given date (defaults to today).
// Idempotent — safe to call every time the dashboard loads.
router.post('/generate', async (req, res) => {
  try {
    const { date } = req.body;
    const created = await generateForDate(date ? new Date(date) : new Date());
    res.json({ created: created.length, tasks: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;