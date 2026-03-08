import { Slider } from "@/components/ui/slider";

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
    Object.entries(preset.weights).forEach(([k, v]) => onChange(k, v));
  };

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
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="px-3 py-1 text-[10px] font-mono rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {DIMENSIONS.map((d) => (
          <div key={d.key}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-mono ${d.colorClass}`}>{d.label}</span>
              <span className="text-xs font-mono text-muted-foreground">
                {(weights[d.key as keyof typeof weights] * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[weights[d.key as keyof typeof weights] * 100]}
              onValueChange={([v]) => onChange(d.key, v / 100)}
              max={100}
              min={0}
              step={1}
              className="cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EthicalWeightSliders;
