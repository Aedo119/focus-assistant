function toDateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  return toDateOnly(a).getTime() === toDateOnly(b).getTime();
}

module.exports = { toDateOnly, isSameDay };