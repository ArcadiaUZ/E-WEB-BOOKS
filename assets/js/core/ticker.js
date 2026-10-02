const tasks = new Set();
let running = false;
let last = performance.now();

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  tasks.forEach((task) => task(dt, now));
  if (tasks.size) requestAnimationFrame(loop);
  else running = false;
}

export function add(task) {
  tasks.add(task);
  if (!running) {
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  }
  return () => tasks.delete(task);
}

export function remove(task) {
  tasks.delete(task);
}

export function clear() {
  tasks.clear();
}

document.addEventListener('visibilitychange', () => {
  running = !document.hidden && tasks.size > 0;
  if (running) {
    last = performance.now();
    requestAnimationFrame(loop);
  }
});
