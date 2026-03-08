import { motion } from "framer-motion";
import { useMemo } from "react";

interface CompassProps {
  weights: {
    economic: number;
    wellbeing: number;
    ecological: number;
    intergenerational: number;
  };
}

const DIMENSIONS = [
  { key: "economic" as const, label: "Economic", angle: 0, color: "var(--atlas-economic)" },
  { key: "wellbeing" as const, label: "Wellbeing", angle: 90, color: "var(--atlas-wellbeing)" },
  { key: "ecological" as const, label: "Ecological", angle: 180, color: "var(--atlas-ecological)" },
  { key: "intergenerational" as const, label: "Intergenerational", angle: 270, color: "var(--atlas-intergenerational)" },
];

const MoralCompass = ({ weights }: CompassProps) => {
  const needle = useMemo(() => {
    let x = 0, y = 0;
    DIMENSIONS.forEach((d) => {
      const rad = (d.angle * Math.PI) / 180;
      x += Math.cos(rad) * weights[d.key];
      y += Math.sin(rad) * weights[d.key];
    });
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    const magnitude = Math.min(Math.sqrt(x * x + y * y) / 2, 1);
    return { angle, magnitude };
  }, [weights]);

  const cx = 150, cy = 150, r = 120;

  const polygonPoints = DIMENSIONS.map((d) => {
    const rad = (d.angle * Math.PI) / 180;
    return `${cx + Math.cos(rad) * r * weights[d.key]},${cy + Math.sin(rad) * r * weights[d.key]}`;
  }).join(" ");

  const needleX = cx + Math.cos((needle.angle * Math.PI) / 180) * r * needle.magnitude;
  const needleY = cy + Math.sin((needle.angle * Math.PI) / 180) * r * needle.magnitude;

  return (
    <div className="rounded-lg border border-border bg-card p-6 atlas-glow">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Moral Compass
      </h3>
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((s) => (
          <circle key={s} cx={cx} cy={cy} r={r * s} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity={0.5} />
        ))}

        {/* Axes */}
        {DIMENSIONS.map((d) => {
          const rad = (d.angle * Math.PI) / 180;
          const x2 = cx + Math.cos(rad) * r;
          const y2 = cy + Math.sin(rad) * r;
          const lx = cx + Math.cos(rad) * (r + 20);
          const ly = cy + Math.sin(rad) * (r + 20);
          const dotX = cx + Math.cos(rad) * r * weights[d.key];
          const dotY = cy + Math.sin(rad) * r * weights[d.key];
          return (
            <g key={d.key}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={`hsl(${d.color})`} strokeWidth="0.5" opacity={0.4} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill={`hsl(${d.color})`} fontSize="8" fontFamily="var(--font-mono)">
                {d.label.slice(0, 4).toUpperCase()}
              </text>
              <motion.circle
                animate={{ cx: dotX, cy: dotY }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                r={4}
                fill={`hsl(${d.color})`}
              />
            </g>
          );
        })}

        {/* Filled polygon */}
        <motion.polygon
          animate={{ points: polygonPoints }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          fill="hsl(var(--primary) / 0.1)"
          stroke="hsl(var(--primary) / 0.4)"
          strokeWidth="1"
        />

        {/* Needle */}
        <motion.line
          x1={cx} y1={cy}
          animate={{ x2: needleX, y2: needleY }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={3} fill="hsl(var(--primary))" />
      </svg>
      <motion.p
        className="text-xs text-muted-foreground text-center mt-2 font-mono"
        key={`${needle.angle.toFixed(0)}-${needle.magnitude.toFixed(0)}`}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        Directional pull: {needle.angle > 0 ? "+" : ""}{needle.angle.toFixed(0)}° · Magnitude: {(needle.magnitude * 100).toFixed(0)}%
      </motion.p>
    </div>
  );
};

export default MoralCompass;
