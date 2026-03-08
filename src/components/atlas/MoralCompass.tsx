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

  return (
    <div className="rounded-lg border border-border bg-card p-6 atlas-glow">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Moral Compass
      </h3>
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((s) => (
          <circle
            key={s}
            cx={cx} cy={cy} r={r * s}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            opacity={0.5}
          />
        ))}

        {/* Axes */}
        {DIMENSIONS.map((d) => {
          const rad = (d.angle * Math.PI) / 180;
          const x2 = cx + Math.cos(rad) * r;
          const y2 = cy + Math.sin(rad) * r;
          const lx = cx + Math.cos(rad) * (r + 20);
          const ly = cy + Math.sin(rad) * (r + 20);
          return (
            <g key={d.key}>
              <line
                x1={cx} y1={cy} x2={x2} y2={y2}
                stroke={`hsl(${d.color})`}
                strokeWidth="0.5"
                opacity={0.4}
              />
              <text
                x={lx} y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={`hsl(${d.color})`}
                fontSize="8"
                fontFamily="var(--font-mono)"
              >
                {d.label.slice(0, 4).toUpperCase()}
              </text>
              {/* Value dot on axis */}
              <motion.circle
                cx={cx + Math.cos(rad) * r * weights[d.key]}
                cy={cy + Math.sin(rad) * r * weights[d.key]}
                r={4}
                fill={`hsl(${d.color})`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              />
            </g>
          );
        })}

        {/* Filled polygon */}
        <motion.polygon
          points={DIMENSIONS.map((d) => {
            const rad = (d.angle * Math.PI) / 180;
            return `${cx + Math.cos(rad) * r * weights[d.key]},${cy + Math.sin(rad) * r * weights[d.key]}`;
          }).join(" ")}
          fill="hsl(var(--primary) / 0.1)"
          stroke="hsl(var(--primary) / 0.4)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Needle */}
        <motion.line
          x1={cx} y1={cy}
          x2={cx + Math.cos((needle.angle * Math.PI) / 180) * r * needle.magnitude}
          y2={cy + Math.sin((needle.angle * Math.PI) / 180) * r * needle.magnitude}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <circle cx={cx} cy={cy} r={3} fill="hsl(var(--primary))" />
      </svg>
      <p className="text-xs text-muted-foreground text-center mt-2 font-mono">
        Directional pull: {needle.angle > 0 ? "+" : ""}{needle.angle.toFixed(0)}° · Magnitude: {(needle.magnitude * 100).toFixed(0)}%
      </p>
    </div>
  );
};

export default MoralCompass;
