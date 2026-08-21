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
      const alreadyExists = await Task.findOne({
        routineId: routine._id,
        routineTaskId: routineTask._id.toString(),
        deadline: { $gte: date, $lt: dayEnd },
      });
      if (alreadyExists) continue;

      const task = await Task.create({
        title: routineTask.title,
        deadline: combineDateAndTime(date, routineTask.time),
        time: routineTask.time || null,
        estimatedDuration: routineTask.duration || null,
        routineId: routine._id,
        routineTaskId: routineTask._id.toString(),
        status: 'PENDING',
      });
      created.push(task);
    }
  }

  return created;
}

module.exports = { generateForDate };