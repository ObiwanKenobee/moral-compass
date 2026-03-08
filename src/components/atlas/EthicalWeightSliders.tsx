import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

interface Props {
  weights: {
    economic: number;
    wellbeing: number;
    ecological: number;
    intergenerational: number;
  };
  onChange: (key: string, value: number) => void;
}

const DIMENSIONS = [
  { key: "economic", label: "Economic Efficiency", colorClass: "text-atlas-economic" },
  { key: "wellbeing", label: "Human Wellbeing", colorClass: "text-atlas-wellbeing" },
  { key: "ecological", label: "Ecological Stability", colorClass: "text-atlas-ecological" },
  { key: "intergenerational", label: "Intergenerational Fairness", colorClass: "text-atlas-intergenerational" },
];

const PRESETS = [
  { name: "Balanced", weights: { economic: 0.5, wellbeing: 0.5, ecological: 0.5, intergenerational: 0.5 } },
  { name: "Growth-First", weights: { economic: 0.9, wellbeing: 0.4, ecological: 0.2, intergenerational: 0.2 } },
  { name: "Eco-Centric", weights: { economic: 0.2, wellbeing: 0.5, ecological: 0.9, intergenerational: 0.8 } },
  { name: "Social Equity", weights: { economic: 0.3, wellbeing: 0.9, ecological: 0.4, intergenerational: 0.6 } },
];

const EthicalWeightSliders = ({ weights, onChange }: Props) => {
  const applyPreset = (preset: typeof PRESETS[0]) => {
    // Apply with slight stagger for visual effect
    const entries = Object.entries(preset.weights);
    entries.forEach(([k, v], i) => {
      setTimeout(() => onChange(k, v), i * 50);
    });
  };

  const activePreset = PRESETS.find((p) =>
    Object.entries(p.weights).every(([k, v]) => Math.abs(weights[k as keyof typeof weights] - v) < 0.02)
  );

  return (
    <div className="rounded-lg border border-border bg-card p-6 atlas-glow">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-1">
        Ethical Diversity Mode
      </h3>
      <p className="text-[10px] text-muted-foreground mb-5 font-mono">
        Adjust value weightings to reveal how "best" changes with perspective
      </p>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((p) => (
          <motion.button
            key={p.name}
            onClick={() => applyPreset(p)}
            className={`px-3 py-1 text-[10px] font-mono rounded-full border transition-colors ${
              activePreset?.name === p.name
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {p.name}
          </motion.button>
        ))}
      </div>

      <div className="space-y-5">
        {DIMENSIONS.map((d) => (
          <motion.div
            key={d.key}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-mono ${d.colorClass}`}>{d.label}</span>
              <motion.span
                className="text-xs font-mono text-muted-foreground"
                key={(weights[d.key as keyof typeof weights] * 100).toFixed(0)}
                initial={{ opacity: 0.5, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                {(weights[d.key as keyof typeof weights] * 100).toFixed(0)}%
              </motion.span>
            </div>
            <Slider
              value={[weights[d.key as keyof typeof weights] * 100]}
              onValueChange={([v]) => onChange(d.key, v / 100)}
              max={100}
              min={0}
              step={1}
              className="cursor-pointer"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EthicalWeightSliders;
