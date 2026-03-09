import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Pencil, Trash2, Copy, Upload, Download, RotateCcw, GripVertical } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

const LS_KEYS = {
  policies: "atlas-custom-policies",
  timeline: "atlas-custom-timeline",
  stakeholders: "atlas-custom-stakeholders",
};

function loadCustomData() {
  try {
    const customPolicies: Policy[] = JSON.parse(localStorage.getItem(LS_KEYS.policies) || "[]");
    const customTimeline: Record<string, TimelineEntry[]> = JSON.parse(localStorage.getItem(LS_KEYS.timeline) || "{}");
    const customStakeholders: Record<string, StakeholderEntry[]> = JSON.parse(localStorage.getItem(LS_KEYS.stakeholders) || "{}");
    return { customPolicies, customTimeline, customStakeholders };
  } catch {
    return { customPolicies: [], customTimeline: {}, customStakeholders: {} };
  }
}

const Index = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [policies, setPolicies] = useState<Policy[]>(() => {
    const { customPolicies } = loadCustomData();
    return [...INITIAL_POLICIES, ...customPolicies];
  });
  const [timelineData, setTimelineData] = useState<Record<string, TimelineEntry[]>>(() => {
    const { customTimeline } = loadCustomData();
    return { ...INITIAL_TIMELINE, ...customTimeline };
  });
  const [stakeholderData, setStakeholderData] = useState<Record<string, StakeholderEntry[]>>(() => {
    const { customStakeholders } = loadCustomData();
    return { ...INITIAL_STAKEHOLDERS, ...customStakeholders };
  });

  // Persist custom policies to localStorage
  useEffect(() => {
    const custom = policies.filter((p) => !BUILT_IN_NAMES.has(p.name));
    localStorage.setItem(LS_KEYS.policies, JSON.stringify(custom));

    const customTimeline: Record<string, TimelineEntry[]> = {};
    const customStakeholders: Record<string, StakeholderEntry[]> = {};
    custom.forEach((p) => {
      if (timelineData[p.name]) customTimeline[p.name] = timelineData[p.name];
      if (stakeholderData[p.name]) customStakeholders[p.name] = stakeholderData[p.name];
    });
    localStorage.setItem(LS_KEYS.timeline, JSON.stringify(customTimeline));
    localStorage.setItem(LS_KEYS.stakeholders, JSON.stringify(customStakeholders));
  }, [policies, timelineData, stakeholderData]);

  const [weights, setWeights] = useState({
    economic: 0.5,
    wellbeing: 0.5,
    ecological: 0.5,
    intergenerational: 0.5,
  });

  const [policyOrder, setPolicyOrder] = useState<string[] | null>(() => {
    try {
      const saved = localStorage.getItem("atlas-policy-order");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
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

  const confirmDeletePolicy = useCallback(() => {
    if (!deletingPolicy || BUILT_IN_NAMES.has(deletingPolicy)) return;
    // Clear edit form if the deleted policy is currently being edited
    setEditingPolicy((prev) =>
      prev && prev.policy.name === deletingPolicy ? null : prev
    );
    setPolicies((prev) => prev.filter((p) => p.name !== deletingPolicy));
    setTimelineData((prev) => {
      const next = { ...prev };
      delete next[deletingPolicy];
      return next;
    });
    setStakeholderData((prev) => {
      const next = { ...prev };
      delete next[deletingPolicy];
      return next;
    });
    setDeletingPolicy(null);
  }, [deletingPolicy]);

  const handleDuplicatePolicy = useCallback((name: string) => {
    const policy = policies.find((p) => p.name === name);
    if (!policy) return;
    let dupName = `${name} (Copy)`;
    let counter = 2;
    while (policies.some((p) => p.name === dupName)) {
      dupName = `${name} (Copy ${counter++})`;
    }
    setEditingPolicy({
      policy: { ...policy, name: dupName },
      stakeholders: stakeholderData[name] ? [...stakeholderData[name]] : [],
      timeline: timelineData[name] ? [...timelineData[name]] : [],
    });
  }, [policies, stakeholderData, timelineData]);

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

  const handleExportPolicies = useCallback(() => {
    const custom = policies.filter((p) => !BUILT_IN_NAMES.has(p.name));
    if (custom.length === 0) {
      toast.error("No custom policies to export");
      return;
    }
    const exportData = {
      version: 1,
      policies: custom,
      timeline: Object.fromEntries(custom.map((p) => [p.name, timelineData[p.name] || []])),
      stakeholders: Object.fromEntries(custom.map((p) => [p.name, stakeholderData[p.name] || []])),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `atlas-policies-${Date.now()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`Exported ${custom.length} custom polic${custom.length === 1 ? "y" : "ies"}`);
  }, [policies, timelineData, stakeholderData]);

  const handleResetCustomPolicies = useCallback(() => {
    setPolicies([...INITIAL_POLICIES]);
    setTimelineData({ ...INITIAL_TIMELINE });
    setStakeholderData({ ...INITIAL_STAKEHOLDERS });
    setEditingPolicy(null);
    setDeletingPolicy(null);
    setPolicyOrder(null);
    localStorage.removeItem(LS_KEYS.policies);
    localStorage.removeItem(LS_KEYS.timeline);
    localStorage.removeItem(LS_KEYS.stakeholders);
    localStorage.removeItem("atlas-policy-order");
    toast.success("All custom policies cleared");
  }, []);

  const [resettingAll, setResettingAll] = useState(false);

  const handleImportPolicies = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (!data.policies || !Array.isArray(data.policies)) throw new Error("Invalid format");
          let imported = 0;
          data.policies.forEach((p: Policy) => {
            if (BUILT_IN_NAMES.has(p.name)) return;
            setPolicies((prev) => {
              const exists = prev.findIndex((x) => x.name === p.name);
              if (exists >= 0) { const u = [...prev]; u[exists] = p; return u; }
              return [...prev, p];
            });
            if (data.timeline?.[p.name]) setTimelineData((prev) => ({ ...prev, [p.name]: data.timeline[p.name] }));
            if (data.stakeholders?.[p.name]) setStakeholderData((prev) => ({ ...prev, [p.name]: data.stakeholders[p.name] }));
            imported++;
          });
          toast.success(`Imported ${imported} polic${imported === 1 ? "y" : "ies"}`);
        } catch {
          toast.error("Failed to parse policy file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const scoredPolicies = useMemo(
    () =>
      policies.map((p) => ({
        ...p,
        score:
          (p.economic * weights.economic +
            p.wellbeing * weights.wellbeing +
            p.ecological * weights.ecological +
            p.intergenerational * weights.intergenerational) /
          (weights.economic + weights.wellbeing + weights.ecological + weights.intergenerational || 1),
      })),
    [policies, weights]
  );

  const weightedPolicies = useMemo(() => {
    if (policyOrder) {
      const scoreMap = new Map(scoredPolicies.map((p) => [p.name, p]));
      const ordered = policyOrder
        .filter((name) => scoreMap.has(name))
        .map((name) => scoreMap.get(name)!);
      // Add any new policies not in the saved order
      scoredPolicies.forEach((p) => {
        if (!policyOrder.includes(p.name)) ordered.push(p);
      });
      return ordered;
    }
    return [...scoredPolicies].sort((a, b) => b.score - a.score);
  }, [scoredPolicies, policyOrder]);

  const handleReorder = useCallback((newOrder: typeof weightedPolicies) => {
    const order = newOrder.map((p) => p.name);
    setPolicyOrder(order);
    localStorage.setItem("atlas-policy-order", JSON.stringify(order));
  }, []);

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
              <div className="flex items-center gap-2">
                {policies.some((p) => !BUILT_IN_NAMES.has(p.name)) && (
                  <Button variant="outline" size="sm" onClick={() => setResettingAll(true)} className="h-8 text-xs font-mono gap-1.5 border-border text-destructive hover:text-destructive">
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleImportPolicies} className="h-8 text-xs font-mono gap-1.5 border-border">
                  <Upload className="w-3 h-3" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPolicies} className="h-8 text-xs font-mono gap-1.5 border-border">
                  <Download className="w-3 h-3" />
                  Export
                </Button>
                <ExportButton targetRef={dashboardRef as React.RefObject<HTMLElement>} />
              </div>
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
                {!BUILT_IN_NAMES.has(p.name) && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-mono">Custom</Badge>
                )}
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
                      onClick={() => setDeletingPolicy(p.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-accent-foreground"
                  onClick={() => handleDuplicatePolicy(p.name)}
                  title={`Duplicate ${p.name}`}
                >
                  <Copy className="w-3 h-3" />
                </Button>
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
                  <SelectItem key={name} value={name} className="text-xs font-mono">
                    {name}{!BUILT_IN_NAMES.has(name) && <span className="ml-1 text-[9px] text-muted-foreground">✦</span>}
                  </SelectItem>
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
                      <SelectItem key={name} value={name} className="text-xs font-mono">
                        {name}{!BUILT_IN_NAMES.has(name) && <span className="ml-1 text-[9px] text-muted-foreground">✦</span>}
                      </SelectItem>
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

      <AlertDialog open={!!deletingPolicy} onOpenChange={(open) => !open && setDeletingPolicy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingPolicy}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the policy and all its associated timeline and stakeholder data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePolicy}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
