const mongoose = require('mongoose');

// A single task template within a routine, e.g. "07:30 Wake up".
const routineTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: String, // "HH:mm", 24h. Optional — a routine task doesn't have to be time-bound.
    default: null,
  },
  duration: {
    type: Number, // minutes
    default: null,
  },
  order: {
    type: Number,
    default: 0,
  },
  optional: {
    type: Boolean,
    default: false,
  },
});

// A one-off change to a single routine task on a single date, without
// touching the routine template itself:
//   SKIP    - don't generate this task on this date
//   MOVE    - generate it at a different time this date only
//   REPLACE - generate a different title (and optionally duration) this date only
const taskOverrideSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  routineTaskId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['SKIP', 'MOVE', 'REPLACE'],
    required: true,
  },
  newTime: {
    type: String, // used by MOVE
    default: null,
  },
  newTitle: {
    type: String, // used by REPLACE
    default: null,
  },
  newDuration: {
    type: Number, // used by REPLACE, optional
    default: null,
  },
});

const routineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Days this routine recurs on. 0 = Sunday ... 6 = Saturday, matching
    // JS Date#getDay(), so generation can check `days.includes(date.getDay())`.
    days: {
      type: [Number],
      default: [],
      validate: {
        validator: (arr) => arr.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: 'days must be integers between 0 (Sunday) and 6 (Saturday)',
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    tasks: {
      type: [routineTaskSchema],
      default: [],
    },
    // Specific calendar dates (day-granularity) this routine should be
    // skipped for — the "pause once" override. The routine itself stays
    // saved and active for every other occurrence.
    pausedDates: {
      type: [Date],
      default: [],
    },
    // Per-task, per-date overrides — skip/move/replace a single occurrence
    // of a single routine task without editing the routine template.
    taskOverrides: {
      type: [taskOverrideSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Routine', routineSchema);