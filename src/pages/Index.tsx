import { useState } from "react";
import { motion } from "framer-motion";
import MoralCompass from "@/components/atlas/MoralCompass";
import EthicalLensRadar from "@/components/atlas/EthicalLensRadar";
import TradeoffSurface from "@/components/atlas/TradeoffSurface";
import TimelineRibbon from "@/components/atlas/TimelineRibbon";
import StakeholderMap from "@/components/atlas/StakeholderMap";
import EthicalWeightSliders from "@/components/atlas/EthicalWeightSliders";
import UncertaintyPanel from "@/components/atlas/UncertaintyPanel";

const POLICIES = [
  { name: "Dam Project", economic: 82, wellbeing: 45, ecological: 25, intergenerational: 60 },
  { name: "Wetland Restore", economic: 48, wellbeing: 68, ecological: 90, intergenerational: 85 },
  { name: "Solar Grid", economic: 65, wellbeing: 72, ecological: 78, intergenerational: 88 },
];

const TIMELINE_EVENTS = [
  { year: "Year 1–3", positive: "Infrastructure jobs created; construction stimulus", negative: "River biodiversity declines 30%", confidence: "high" as const },
  { year: "Year 5–10", positive: "Urban electricity stable; industrial growth", negative: "Fishery collapse begins; 2,400 displaced", confidence: "medium" as const },
  { year: "Year 20–40", positive: "Energy infrastructure amortized", negative: "Sediment buildup reduces efficiency 40%; flood risk returns", confidence: "low" as const },
  { year: "Year 50+", positive: "Dam decommission creates restoration opportunity", negative: "Irreversible species loss; downstream soil degradation", confidence: "low" as const },
];

const STAKEHOLDERS = [
  { group: "Urban Residents", benefit: 72, population: "4.2M", detail: "Stable electricity, economic growth, improved infrastructure" },
  { group: "Rural Farmers", benefit: -45, population: "180K", detail: "Water access disrupted, farmland flooding, forced relocation" },
  { group: "Indigenous Communities", benefit: -68, population: "12K", detail: "Sacred sites submerged, cultural heritage loss, displacement" },
  { group: "Future Generations", benefit: -30, population: "Est. 8M+", detail: "Climate debt, reduced biodiversity inheritance, sediment costs" },
  { group: "Aquatic Ecosystems", benefit: -82, population: "N/A", detail: "Fish migration blocked, water temperature shifts, habitat loss" },
];

const UNCERTAINTY = [
  { dimension: "Economic Growth", confidence: 78, dataGaps: "Trade policy shifts", modelDisagreement: "Low (±8%)" },
  { dimension: "Human Displacement", confidence: 62, dataGaps: "Migration modeling", modelDisagreement: "Moderate (±22%)" },
  { dimension: "Ecosystem Damage", confidence: 41, dataGaps: "Downstream cascades unknown", modelDisagreement: "High (±38%)" },
  { dimension: "Long-term Energy", confidence: 55, dataGaps: "Sediment rate uncertain", modelDisagreement: "Moderate (±25%)" },
];

const Index = () => {
  const [weights, setWeights] = useState({
    economic: 0.5,
    wellbeing: 0.5,
    ecological: 0.5,
    intergenerational: 0.5,
  });

  const handleWeightChange = (key: string, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  // Compute weighted scores for display
  const weightedPolicies = POLICIES.map((p) => ({
    ...p,
    score: (
      p.economic * weights.economic +
      p.wellbeing * weights.wellbeing +
      p.ecological * weights.ecological +
      p.intergenerational * weights.intergenerational
    ) / ((weights.economic + weights.wellbeing + weights.ecological + weights.intergenerational) || 1),
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-7xl py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <h1 className="text-2xl font-display font-bold tracking-tight atlas-gradient-text">
                ATLAS
              </h1>
              <span className="text-xs font-mono text-muted-foreground border border-border rounded-full px-2 py-0.5">
                Ethical Reasoning Engine
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-mono max-w-2xl">
              Multi-lens ethical analysis system. The machine reveals the terrain — humans choose the direction.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="container max-w-7xl py-8 space-y-8">
        {/* Weighted ranking bar */}
        <motion.div
          className="rounded-lg border border-border bg-card p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Weighted Ranking
            </span>
            {weightedPolicies.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{i + 1}.</span>
                <span className="text-sm font-mono text-foreground">{p.name}</span>
                <span className="text-xs font-mono text-primary">{p.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 1: Compass + Radar + Weight Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MoralCompass weights={weights} />
          <EthicalLensRadar policies={POLICIES} />
          <EthicalWeightSliders weights={weights} onChange={handleWeightChange} />
        </div>

        {/* Row 2: Tradeoff Surface + Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TradeoffSurface policies={POLICIES} />
          <TimelineRibbon events={TIMELINE_EVENTS} policyName="Dam Project" />
        </div>

        {/* Row 3: Stakeholder Map + Uncertainty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StakeholderMap stakeholders={STAKEHOLDERS} policyName="Dam Project" />
          <UncertaintyPanel items={UNCERTAINTY} />
        </div>

        {/* Footer note */}
        <div className="text-center py-8">
          <p className="text-[10px] font-mono text-muted-foreground max-w-md mx-auto">
            Atlas does not tell humanity what is right. It removes the fog that usually surrounds our choices.
            Decisions look less like politics and more like navigation through a moral landscape.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
