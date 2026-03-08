import { motion } from "framer-motion";

interface PolicyPoint {
  name: string;
  economic: number;
  wellbeing: number;
  ecological: number;
  intergenerational: number;
}

interface Props {
  policies: PolicyPoint[];
}

const TradeoffSurface = ({ policies }: Props) => {
  // Map to 2D: x = economic, y = ecological. Size = wellbeing, opacity = intergenerational
  return (
    <div className="rounded-lg border border-border bg-card p-6 atlas-glow">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Ethical Impact Surface
      </h3>
      <div className="relative w-full aspect-square max-w-[400px] mx-auto atlas-grid-bg rounded-md border border-border overflow-hidden">
        {/* Axis labels */}
        <span className="absolute bottom-1 right-2 text-[10px] font-mono text-atlas-economic">
          ECONOMIC →
        </span>
        <span className="absolute top-2 left-1 text-[10px] font-mono text-atlas-ecological writing-mode-vertical" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
          ← ECOLOGICAL
        </span>

        {/* Policy points */}
        {policies.map((p, i) => {
          const x = (p.economic / 100) * 85 + 5;
          const y = 95 - (p.ecological / 100) * 85;
          const size = 16 + (p.wellbeing / 100) * 30;
          return (
            <motion.div
              key={p.name}
              className="absolute flex items-center justify-center"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.2, type: "spring" }}
            >
              <div
                className="rounded-full border-2"
                style={{
                  width: "100%",
                  height: "100%",
                  borderColor: `hsl(var(--atlas-intergenerational) / ${0.3 + (p.intergenerational / 100) * 0.7})`,
                  background: `radial-gradient(circle, hsl(var(--primary) / ${0.2 + (p.wellbeing / 100) * 0.4}), transparent)`,
                }}
              />
              <span className="absolute -bottom-5 text-[9px] font-mono text-foreground whitespace-nowrap">
                {p.name}
              </span>
            </motion.div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 text-[8px] font-mono text-muted-foreground space-y-0.5">
          <div>Size = Wellbeing</div>
          <div>Glow = Intergenerational</div>
        </div>
      </div>
    </div>
  );
};

export default TradeoffSurface;
