import { motion } from "framer-motion";

interface UncertaintyItem {
  dimension: string;
  confidence: number; // 0-100
  dataGaps: string;
  modelDisagreement: string;
}

interface Props {
  items: UncertaintyItem[];
}

const UncertaintyPanel = ({ items }: Props) => {
  const getConfidenceColor = (c: number) => {
    if (c >= 70) return "bg-atlas-wellbeing";
    if (c >= 40) return "bg-primary";
    return "bg-destructive";
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 atlas-glow">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-1">
        Ethical Uncertainty
      </h3>
      <p className="text-[10px] text-muted-foreground mb-5 font-mono">
        Confidence intervals · Data gaps · Model disagreements
      </p>

      <div className="space-y-4">
        {items.map((item, i) => (
          <motion.div
            key={item.dimension}
            className="border border-border rounded-md p-3 bg-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-foreground">{item.dimension}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${getConfidenceColor(item.confidence)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.confidence}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">{item.confidence}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-muted-foreground">
              <div>
                <span className="text-destructive/70">Gaps:</span> {item.dataGaps}
              </div>
              <div>
                <span className="text-primary/70">Disagreement:</span> {item.modelDisagreement}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UncertaintyPanel;
