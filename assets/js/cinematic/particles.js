export function createDust(canvas, options = {}) {
  const count = options.count ?? 70;
  const ctx = canvas.getContext('2d');
  let dpr = 1;
  let width = 0;
  let height = 0;
  let particles = [];
  let seed = 1;

  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    build();
  }

  function build() {
    const total = Math.round(count * clampArea());
    particles = Array.from({ length: total }, () => ({
      x: rand() * width,
      y: rand() * height,
      r: 0.4 + rand() * 1.5,
      z: 0.25 + rand() * 0.9,
      drift: (rand() - 0.5) * 0.06,
      phase: rand() * Math.PI * 2,
      speed: 0.1 + rand() * 0.35,
    }));
  }

  const clampArea = () => (width < 720 ? 0.55 : width < 1200 ? 0.8 : 1);

  let progress = 0;

  return {
    resize,
    setProgress(p) {
      progress = p;
    },
    update(dt, velocity = 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const boost = Math.min(3, 1 + Math.abs(velocity) * 900);
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach((p) => {
        p.y -= (0.08 + p.speed * 0.16) * p.z * dt * 60 * 0.35 * boost;
        p.x += (p.drift + velocity * 42 * p.z) * dt;
        p.phase += dt * 0.6;
        if (p.y < -6) {
          p.y = height + 6;
          p.x = rand() * width;
        }
        if (p.x < -6) p.x = width + 6;
        if (p.x > width + 6) p.x = -6;
        const alpha = (0.1 + p.z * 0.28) * (0.55 + 0.45 * Math.sin(p.phase)) * (0.5 + progress * 0.7);
        ctx.beginPath();
        ctx.fillStyle = `rgba(214, 226, 240, ${alpha.toFixed(3)})`;
        ctx.arc(p.x * dpr, p.y * dpr, p.r * p.z * dpr, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    },
    destroy() {
      particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
