import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Copy } from "lucide-react";
import MoralCompass from "@/components/atlas/MoralCompass";
import EthicalLensRadar from "@/components/atlas/EthicalLensRadar";
import TradeoffSurface from "@/components/atlas/TradeoffSurface";
import TimelineRibbon from "@/components/atlas/TimelineRibbon";
import StakeholderMap from "@/components/atlas/StakeholderMap";
import EthicalWeightSliders from "@/components/atlas/EthicalWeightSliders";
import UncertaintyPanel from "@/components/atlas/UncertaintyPanel";
import PolicyCreationForm from "@/components/atlas/PolicyCreationForm";
import ExportButton from "@/components/atlas/ExportButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Policy {
  name: string;
  economic: number;
  wellbeing: number;
  ecological: number;
  intergenerational: number;
}

interface TimelineEntry {
  year: string;
  positive: string;
  negative: string;
  confidence: "high" | "medium" | "low";
}

interface StakeholderEntry {
  group: string;
  benefit: number;
  population: string;
  detail: string;
}

const BUILT_IN_NAMES = new Set(["Dam Project", "Wetland Restore", "Solar Grid"]);

const INITIAL_POLICIES: Policy[] = [
  { name: "Dam Project", economic: 82, wellbeing: 45, ecological: 25, intergenerational: 60 },
  { name: "Wetland Restore", economic: 48, wellbeing: 68, ecological: 90, intergenerational: 85 },
  { name: "Solar Grid", economic: 65, wellbeing: 72, ecological: 78, intergenerational: 88 },
];

const INITIAL_TIMELINE: Record<string, TimelineEntry[]> = {
  "Dam Project": [
    { year: "Year 1–3", positive: "Infrastructure jobs created; construction stimulus", negative: "River biodiversity declines 30%", confidence: "high" },
    { year: "Year 5–10", positive: "Urban electricity stable; industrial growth", negative: "Fishery collapse begins; 2,400 displaced", confidence: "medium" },
    { year: "Year 20–40", positive: "Energy infrastructure amortized", negative: "Sediment buildup reduces efficiency 40%; flood risk returns", confidence: "low" },
    { year: "Year 50+", positive: "Dam decommission creates restoration opportunity", negative: "Irreversible species loss; downstream soil degradation", confidence: "low" },
  ],
  "Wetland Restore": [
    { year: "Year 1–3", positive: "Ecosystem recovery begins; eco-tourism seeds", negative: "High upfront cost; no immediate energy gain", confidence: "high" },
    { year: "Year 5–10", positive: "Flood protection improves 60%; fish stocks recover", negative: "Economic returns slower than alternatives", confidence: "medium" },
    { year: "Year 20–40", positive: "Carbon sequestration measurable; biodiversity rebounds", negative: "Maintenance costs require sustained funding", confidence: "medium" },
    { year: "Year 50+", positive: "Self-sustaining ecosystem; climate resilience achieved", negative: "Long-term monitoring still needed", confidence: "high" },
  ],
  "Solar Grid": [
    { year: "Year 1–3", positive: "Clean energy jobs; grid modernization", negative: "High capital expenditure; land use concerns", confidence: "high" },
    { year: "Year 5–10", positive: "Energy costs drop 35%; carbon emissions halved", negative: "Battery storage waste; rare mineral dependency", confidence: "medium" },
    { year: "Year 20–40", positive: "Energy independence; tech export potential", negative: "Panel degradation; recycling infrastructure needed", confidence: "medium" },
    { year: "Year 50+", positive: "Fully decarbonized grid; intergenerational benefit", negative: "Technology may be obsolete; upgrade cycles", confidence: "low" },
  ],
};

const INITIAL_STAKEHOLDERS: Record<string, StakeholderEntry[]> = {
  "Dam Project": [
    { group: "Urban Residents", benefit: 72, population: "4.2M", detail: "Stable electricity, economic growth, improved infrastructure" },
    { group: "Rural Farmers", benefit: -45, population: "180K", detail: "Water access disrupted, farmland flooding, forced relocation" },
    { group: "Indigenous Communities", benefit: -68, population: "12K", detail: "Sacred sites submerged, cultural heritage loss, displacement" },
    { group: "Future Generations", benefit: -30, population: "Est. 8M+", detail: "Climate debt, reduced biodiversity inheritance, sediment costs" },
    { group: "Aquatic Ecosystems", benefit: -82, population: "N/A", detail: "Fish migration blocked, water temperature shifts, habitat loss" },
  ],
  "Wetland Restore": [
    { group: "Urban Residents", benefit: 25, population: "4.2M", detail: "Improved flood protection, water quality, recreation areas" },
    { group: "Rural Farmers", benefit: 55, population: "180K", detail: "Natural irrigation restored, soil fertility improves" },
    { group: "Indigenous Communities", benefit: 80, population: "12K", detail: "Cultural landscapes preserved, traditional practices restored" },
    { group: "Future Generations", benefit: 75, population: "Est. 8M+", detail: "Carbon stored, biodiversity preserved, climate resilience" },
    { group: "Aquatic Ecosystems", benefit: 90, population: "N/A", detail: "Habitat recovery, species return, water cycle restoration" },
  ],
  "Solar Grid": [
    { group: "Urban Residents", benefit: 60, population: "4.2M", detail: "Cheaper clean energy, reduced air pollution, tech jobs" },
    { group: "Rural Farmers", benefit: 30, population: "180K", detail: "Dual-use land possible, energy independence" },
    { group: "Indigenous Communities", benefit: 15, population: "12K", detail: "Minimal displacement, some land use concerns" },
    { group: "Future Generations", benefit: 85, population: "Est. 8M+", detail: "Decarbonized grid, energy security, clean air inheritance" },
    { group: "Aquatic Ecosystems", benefit: 40, population: "N/A", detail: "Reduced thermal pollution, minimal water impact" },
  ],
};

const UNCERTAINTY = [
  { dimension: "Economic Growth", confidence: 78, dataGaps: "Trade policy shifts", modelDisagreement: "Low (±8%)" },
  { dimension: "Human Displacement", confidence: 62, dataGaps: "Migration modeling", modelDisagreement: "Moderate (±22%)" },
  { dimension: "Ecosystem Damage", confidence: 41, dataGaps: "Downstream cascades unknown", modelDisagreement: "High (±38%)" },
  { dimension: "Long-term Energy", confidence: 55, dataGaps: "Sediment rate uncertain", modelDisagreement: "Moderate (±25%)" },
];

const Index = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [timelineData, setTimelineData] = useState<Record<string, TimelineEntry[]>>(INITIAL_TIMELINE);
  const [stakeholderData, setStakeholderData] = useState<Record<string, StakeholderEntry[]>>(INITIAL_STAKEHOLDERS);

  const [weights, setWeights] = useState({
    economic: 0.5,
    wellbeing: 0.5,
    ecological: 0.5,
    intergenerational: 0.5,
  });

  const policyNames = useMemo(() => policies.map((p) => p.name), [policies]);
  const [selectedPolicy, setSelectedPolicy] = useState(policyNames[0]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonPolicy, setComparisonPolicy] = useState(policyNames[1]);

  const handleWeightChange = (key: string, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  const [deletingPolicy, setDeletingPolicy] = useState<string | null>(null);

  const [editingPolicy, setEditingPolicy] = useState<{
    policy: Policy;
    stakeholders: StakeholderEntry[];
    timeline: TimelineEntry[];
  } | null>(null);

  const handleCreatePolicy = useCallback(
    (policy: Policy, stakeholders: StakeholderEntry[], timeline: TimelineEntry[]) => {
      setPolicies((prev) => {
        const existing = prev.findIndex((p) => p.name === policy.name);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = policy;
          return updated;
        }
        return [...prev, policy];
      });
      setTimelineData((prev) => ({ ...prev, [policy.name]: timeline }));
      setStakeholderData((prev) => ({ ...prev, [policy.name]: stakeholders }));
      setEditingPolicy(null);
    },
    []
  );

  const handleDeletePolicy = useCallback((name: string) => {
    if (BUILT_IN_NAMES.has(name)) return;
    setPolicies((prev) => prev.filter((p) => p.name !== name));
    setTimelineData((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setStakeholderData((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleEditPolicy = useCallback((name: string) => {
    if (BUILT_IN_NAMES.has(name)) return;
    const policy = policies.find((p) => p.name === name);
    if (!policy) return;
    setEditingPolicy({
      policy,
      stakeholders: stakeholderData[name] || [],
      timeline: timelineData[name] || [],
    });
  }, [policies, stakeholderData, timelineData]);

  const weightedPolicies = useMemo(
    () =>
      policies
        .map((p) => ({
          ...p,
          score:
            (p.economic * weights.economic +
              p.wellbeing * weights.wellbeing +
              p.ecological * weights.ecological +
              p.intergenerational * weights.intergenerational) /
            (weights.economic + weights.wellbeing + weights.ecological + weights.intergenerational || 1),
        }))
        .sort((a, b) => b.score - a.score),
    [policies, weights]
  );

  const availableComparisons = policyNames.filter((n) => n !== selectedPolicy);

  // Ensure selected policies are still valid
  const safeSelected = policyNames.includes(selectedPolicy) ? selectedPolicy : policyNames[0];
  const safeComparison = availableComparisons.includes(comparisonPolicy)
    ? comparisonPolicy
    : availableComparisons[0] || policyNames[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-7xl py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  <h1 className="text-2xl font-display font-bold tracking-tight atlas-gradient-text">ATLAS</h1>
                  <span className="text-xs font-mono text-muted-foreground border border-border rounded-full px-2 py-0.5">
                    Ethical Reasoning Engine
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-mono max-w-2xl">
                  Multi-lens ethical analysis system. The machine reveals the terrain — humans choose the direction.
                </p>
              </div>
              <ExportButton targetRef={dashboardRef as React.RefObject<HTMLElement>} />
            </div>
          </motion.div>
        </div>
      </header>

      <main ref={dashboardRef} className="container max-w-7xl py-8 space-y-8">
        {/* Weighted ranking bar */}
        <motion.div className="rounded-lg border border-border bg-card p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Weighted Ranking</span>
            {weightedPolicies.map((p, i) => (
              <motion.div key={p.name} layout className="flex items-center gap-2" transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <span className="text-xs font-mono text-muted-foreground">{i + 1}.</span>
                <span className="text-sm font-mono text-foreground">{p.name}</span>
                <motion.span
                  className="text-xs font-mono text-primary"
                  key={p.score.toFixed(1)}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {p.score.toFixed(1)}
                </motion.span>
                {!BUILT_IN_NAMES.has(p.name) && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-primary"
                      onClick={() => handleEditPolicy(p.name)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeletePolicy(p.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Row 1: Compass + Radar + Weight Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MoralCompass weights={weights} />
          <EthicalLensRadar policies={policies} />
          <EthicalWeightSliders weights={weights} onChange={handleWeightChange} />
        </div>

        {/* Policy Creation Form */}
        <PolicyCreationForm
          onCreatePolicy={handleCreatePolicy}
          editingPolicy={editingPolicy}
          onCancelEdit={() => setEditingPolicy(null)}
        />

        {/* Policy Selector + Comparison Toggle */}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Policy</span>
            <Select value={safeSelected} onValueChange={setSelectedPolicy}>
              <SelectTrigger className="w-[180px] h-8 text-xs font-mono bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {policyNames.map((name) => (
                  <SelectItem key={name} value={name} className="text-xs font-mono">{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="comparison-mode" checked={comparisonMode} onCheckedChange={setComparisonMode} />
            <Label htmlFor="comparison-mode" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest cursor-pointer">
              Compare
            </Label>
          </div>

          <AnimatePresence>
            {comparisonMode && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <span className="text-[10px] font-mono text-muted-foreground">vs</span>
                <Select value={safeComparison} onValueChange={setComparisonPolicy}>
                  <SelectTrigger className="w-[180px] h-8 text-xs font-mono bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableComparisons.map((name) => (
                      <SelectItem key={name} value={name} className="text-xs font-mono">{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Row 2: Tradeoff Surface + Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TradeoffSurface policies={policies} />
          <div className={comparisonMode ? "grid grid-cols-2 gap-4" : ""}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`timeline-${safeSelected}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TimelineRibbon events={timelineData[safeSelected] || []} policyName={safeSelected} />
              </motion.div>
            </AnimatePresence>
            {comparisonMode && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`timeline-${safeComparison}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TimelineRibbon events={timelineData[safeComparison] || []} policyName={safeComparison} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Row 3: Stakeholder Map + Uncertainty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={comparisonMode ? "grid grid-cols-2 gap-4" : ""}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`stakeholder-${safeSelected}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <StakeholderMap stakeholders={stakeholderData[safeSelected] || []} policyName={safeSelected} />
              </motion.div>
            </AnimatePresence>
            {comparisonMode && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stakeholder-${safeComparison}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <StakeholderMap stakeholders={stakeholderData[safeComparison] || []} policyName={safeComparison} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
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
