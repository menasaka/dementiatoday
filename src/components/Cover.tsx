/**
 * Generative "memory threads" covers for articles without a photo (most of the archive).
 * Each cover is a small constellation of neurons: soft cell bodies joined by curved threads,
 * a few of them lit, one or two fading out. The palette follows the category, so a topic
 * keeps its colour; the network (positions, links, style) follows the article, so no two match.
 */

type Palette = { bg: [string, string]; thread: string; node: string; lit: string; ink: string };

const PALETTES: Palette[] = [
  { bg: ["#0a5a8c", "#003e63"], thread: "#bfe0f2", node: "#ffffff", lit: "#b6e3a5", ink: "#ffffff" }, // logo navy
  { bg: ["#eef6e8", "#d6ebcb"], thread: "#2f7d32", node: "#1f5e22", lit: "#00507f", ink: "#1f5e22" }, // leaf mist
  { bg: ["#f7f3e8", "#ebe3cf"], thread: "#00507f", node: "#0f2230", lit: "#4fae44", ink: "#0f2230" }, // linen
  { bg: ["#052a42", "#021827"], thread: "#8fc7e6", node: "#d9ecf6", lit: "#b6e3a5", ink: "#8fc7e6" }, // night
  { bg: ["#3f8f3a", "#2a6b28"], thread: "#e8f7df", node: "#ffffff", lit: "#ffe9a8", ink: "#ffffff" }, // leaf
  { bg: ["#e2eef6", "#c6dcea"], thread: "#1d6c9e", node: "#00507f", lit: "#4fae44", ink: "#00507f" }, // sky
  { bg: ["#f3ebe4", "#e6d5c6"], thread: "#7a4b32", node: "#4a2c1d", lit: "#2f7d32", ink: "#4a2c1d" }, // sand
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small deterministic PRNG so server and client render the same art. */
function rng(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(1);

export function paletteFor(categorySlug?: string | null) {
  return PALETTES[hash(categorySlug ?? "dementia") % PALETTES.length];
}

/** Each category owns a palette plus its two neighbours, so a topic feels related without repeating. */
function paletteForPost(category: string | null | undefined, seed: string) {
  const base = hash(category ?? "dementia") % PALETTES.length;
  const shift = [0, 0, 1, PALETTES.length - 1][hash(seed + "p") % 4];
  return PALETTES[(base + shift) % PALETTES.length];
}

type Node = { x: number; y: number; r: number; lit: boolean; fade: boolean };

/** Neurons spread over a jittered grid, so they never clump. */
function network(rand: () => number, W: number, H: number) {
  const cols = 5;
  const rows = 3;
  const nodes: Node[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (rand() < 0.22) continue;
      nodes.push({
        x: ((c + 0.5 + (rand() - 0.5) * 0.75) / cols) * W,
        y: ((r + 0.5 + (rand() - 0.5) * 0.7) / rows) * H,
        r: 7 + rand() * 9,
        lit: rand() < 0.22,
        fade: rand() < 0.18,
      });
    }
  }
  // Link each node to its two nearest neighbours.
  const links = new Set<string>();
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => links.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  return { nodes, links: [...links].map((k) => k.split("-").map(Number) as [number, number]) };
}

export function Cover({ seed, category, className = "", label }: { seed: string; category?: string | null; className?: string; label?: string }) {
  const p = paletteForPost(category, seed);
  const rand = rng(hash(seed));
  const W = 800;
  const H = 500;
  const id = `cv${hash(seed + (category ?? "")).toString(36)}`;
  const variant = hash(seed + "v") % 3; // 0 threads, 1 threads + dendrites, 2 dotted threads
  const { nodes, links } = network(rand, W, H);

  const curve = (a: Node, b: Node) => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const bend = (rand() - 0.5) * 120;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return `M${f(a.x)} ${f(a.y)} Q${f(mx - (dy / len) * bend)} ${f(my + (dx / len) * bend)} ${f(b.x)} ${f(b.y)}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg[0]} />
          <stop offset="1" stopColor={p.bg[1]} />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor={p.lit} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.lit} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}d`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="13" cy="13" r="1.2" fill={p.ink} fillOpacity="0.1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}b)`} />
      <rect width={W} height={H} fill={`url(#${id}d)`} />

      {/* Threads */}
      {links.map(([i, j]) => {
        const faded = nodes[i].fade || nodes[j].fade;
        return (
          <path
            key={`${i}-${j}`}
            d={curve(nodes[i], nodes[j])}
            fill="none"
            stroke={p.thread}
            strokeWidth={variant === 2 ? 3 : 2.4}
            strokeOpacity={faded ? 0.18 : 0.55}
            strokeDasharray={variant === 2 || faded ? "2 9" : undefined}
            strokeLinecap="round"
          />
        );
      })}

      {/* Short dendrites */}
      {variant === 1 &&
        nodes.map((n, i) =>
          Array.from({ length: 3 }, (_, k) => {
            const a = rand() * Math.PI * 2;
            const l = 26 + rand() * 30;
            return (
              <path
                key={`${i}d${k}`}
                d={`M${f(n.x)} ${f(n.y)} q${f(Math.cos(a + 0.6) * l * 0.5)} ${f(Math.sin(a + 0.6) * l * 0.5)} ${f(Math.cos(a) * l)} ${f(Math.sin(a) * l)}`}
                fill="none"
                stroke={p.thread}
                strokeOpacity={n.fade ? 0.15 : 0.4}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            );
          }),
        )}

      {/* Cell bodies */}
      {nodes.map((n, i) => (
        <g key={i} opacity={n.fade ? 0.3 : 1}>
          {n.lit && <circle cx={n.x} cy={n.y} r={n.r * 4.2} fill={`url(#${id}g)`} />}
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.lit ? p.lit : p.bg[0]} stroke={n.lit ? p.lit : p.node} strokeWidth="2.6" />
          {!n.lit && <circle cx={n.x} cy={n.y} r={n.r * 0.38} fill={p.node} />}
        </g>
      ))}
    </svg>
  );
}
