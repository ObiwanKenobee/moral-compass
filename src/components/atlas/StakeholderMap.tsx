import { motion } from "framer-motion";

interface StakeholderImpact {
  group: string;
  benefit: number; // -100 to 100
  population: string;
  detail: string;
}

interface Props {
  stakeholders: StakeholderImpact[];
  policyName: string;
}

const StakeholderMap = ({ stakeholders, policyName }: Props) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6 atlas-glow">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-1">
        Stakeholder Impact Map
      </h3>
      <p className="text-xs text-muted-foreground mb-5 font-mono">
        Policy: {policyName}
      </p>

      <div className="space-y-3">
        {stakeholders.map((s, i) => {
          const isPositive = s.benefit >= 0;
          const absWidth = Math.abs(s.benefit);

          return (
            <motion.div
              key={s.group}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-foreground">{s.group}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{s.population}</span>
              </div>

              <div className="relative h-5 bg-secondary rounded-sm overflow-hidden">
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />

                <motion.div
                  className={`absolute top-0 bottom-0 rounded-sm ${isPositive ? "bg-atlas-wellbeing/40" : "bg-destructive/40"}`}
                  style={{
                    left: isPositive ? "50%" : `${50 - absWidth / 2}%`,
                    width: 0,
                  }}
                  animate={{
                    width: `${absWidth / 2}%`,
                  }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                />

                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-muted-foreground z-20">
                  {isPositive ? "+" : ""}{s.benefit}%
                </span>
              </div>

              <p className="text-[10px] text-muted-foreground mt-0.5">{s.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StakeholderMap;
