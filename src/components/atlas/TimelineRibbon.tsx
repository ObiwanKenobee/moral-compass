import { motion } from "framer-motion";

interface TimelineEvent {
  year: string;
  positive: string;
  negative: string;
  confidence: "high" | "medium" | "low";
}

interface Props {
  events: TimelineEvent[];
  policyName: string;
}

const confidenceColors: Record<string, string> = {
  high: "bg-atlas-wellbeing",
  medium: "bg-primary",
  low: "bg-destructive",
};

const confidenceBorderColors: Record<string, string> = {
  high: "border-atlas-wellbeing",
  medium: "border-primary",
  low: "border-destructive",
};

const TimelineRibbon = ({ events, policyName }: Props) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6 atlas-glow">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-1">
        Tradeoff Simulator
      </h3>
      <p className="text-xs text-muted-foreground mb-6 font-mono">
        Policy: {policyName}
      </p>

      <div className="relative">
        {/* Central timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {events.map((event, i) => (
            <motion.div
              key={i}
              className="relative pl-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              {/* Dot */}
              <div className={`absolute left-[11px] top-1 w-[10px] h-[10px] rounded-full ${confidenceColors[event.confidence]} border-2 border-background`} />

              <div className="text-xs font-mono text-muted-foreground mb-1">{event.year}</div>

              <div className={`rounded-md border ${confidenceBorderColors[event.confidence]} border-opacity-30 bg-secondary p-3 space-y-1`}>
                <div className="flex items-start gap-2">
                  <span className="text-atlas-wellbeing text-xs">▲</span>
                  <span className="text-xs text-foreground">{event.positive}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-destructive text-xs">▼</span>
                  <span className="text-xs text-foreground">{event.negative}</span>
                </div>
              </div>

              <div className="text-[9px] font-mono text-muted-foreground mt-1">
                Confidence: {event.confidence}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineRibbon;
