const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'SNOOZED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: null,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    notes: {
      type: String,
      default: '',
    },
    // Time-of-day for the task, "HH:mm" 24h format. Optional — most
    // ad-hoc tasks won't set this, but routine-generated tasks do.
    time: {
      type: String,
      default: null,
    },
    // Present when this task was generated from a Routine (see Routine
    // model). routineTaskId identifies which task template within the
    // routine this instance came from, so generation can stay idempotent.
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      default: null,
      index: true,
    },
    routineTaskId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);