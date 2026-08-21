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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Routine', routineSchema);