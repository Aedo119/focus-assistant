const Routine = require('../models/Routine');
const Task = require('../models/Task');
const { toDateOnly, isSameDay } = require('../utils/date');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function combineDateAndTime(dateOnly, time) {
  const combined = new Date(dateOnly);
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    if (!Number.isNaN(hours)) combined.setHours(hours, minutes || 0, 0, 0);
  }
  return combined;
}

function findTaskOverride(routine, routineTaskId, date) {
  return routine.taskOverrides.find(
    (o) => o.routineTaskId === routineTaskId && isSameDay(o.date, date)
  );
}

/**
 * Ensures every active routine scheduled for `inputDate` has a matching
 * Task for each of its routine tasks. Safe to call repeatedly for the
 * same date — already-generated tasks are detected and skipped, so this
 * can just be called whenever the dashboard loads rather than needing a
 * background scheduler yet.
 */
async function generateForDate(inputDate = new Date()) {
  const date = toDateOnly(inputDate);
  const weekday = date.getDay();
  const dayEnd = new Date(date.getTime() + ONE_DAY_MS);

  const routines = await Routine.find({ active: true, days: weekday });
  const created = [];

  for (const routine of routines) {
    const isPaused = routine.pausedDates.some((p) => isSameDay(p, date));
    if (isPaused) continue;

    for (const routineTask of routine.tasks) {
      const routineTaskId = routineTask._id.toString();
      const override = findTaskOverride(routine, routineTaskId, date);

      // A SKIP override means this occurrence simply doesn't get generated.
      if (override?.action === 'SKIP') continue;

      const alreadyExists = await Task.findOne({
        routineId: routine._id,
        routineTaskId,
        deadline: { $gte: date, $lt: dayEnd },
      });
      if (alreadyExists) continue;

      let title = routineTask.title;
      let time = routineTask.time;
      let duration = routineTask.duration;

      if (override?.action === 'MOVE' && override.newTime) {
        time = override.newTime;
      }
      if (override?.action === 'REPLACE') {
        if (override.newTitle) title = override.newTitle;
        if (override.newDuration !== null && override.newDuration !== undefined) {
          duration = override.newDuration;
        }
      }

      const task = await Task.create({
        title,
        deadline: combineDateAndTime(date, time),
        time: time || null,
        estimatedDuration: duration || null,
        routineId: routine._id,
        routineTaskId,
        status: 'PENDING',
      });
      created.push(task);
    }
  }

  return created;
}

/**
 * When an override is set for a date whose task has already been
 * generated (a Task document already exists), the override should take
 * effect immediately rather than waiting for a future generation call
 * that will never re-run for a past "now". This reconciles that one
 * existing Task in place. Safe to call even if no such Task exists yet —
 * it's a no-op, and the override will simply apply the next time
 * generateForDate runs for that date.
 */
async function reconcileOverride(routine, override) {
  const date = toDateOnly(override.date);
  const dayEnd = new Date(date.getTime() + ONE_DAY_MS);

  const existing = await Task.findOne({
    routineId: routine._id,
    routineTaskId: override.routineTaskId,
    deadline: { $gte: date, $lt: dayEnd },
  });
  if (!existing) return null;

  if (override.action === 'SKIP') {
    // Don't destroy something the person already finished — leave
    // completed history alone even if a skip is set after the fact.
    if (existing.status === 'COMPLETED') return existing;
    await Task.findByIdAndDelete(existing._id);
    return null;
  }

  const update = {};
  if (override.action === 'MOVE' && override.newTime) {
    const newDeadline = combineDateAndTime(date, override.newTime);
    update.time = override.newTime;
    update.deadline = newDeadline;
  }
  if (override.action === 'REPLACE') {
    if (override.newTitle) update.title = override.newTitle;
    if (override.newDuration !== null && override.newDuration !== undefined) {
      update.estimatedDuration = override.newDuration;
    }
  }

  if (Object.keys(update).length === 0) return existing;
  return Task.findByIdAndUpdate(existing._id, update, { new: true });
}

module.exports = { generateForDate, reconcileOverride };