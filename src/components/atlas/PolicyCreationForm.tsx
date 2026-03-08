import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronDown, ChevronUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PolicyScores {
  name: string;
  economic: number;
  wellbeing: number;
  ecological: number;
  intergenerational: number;
}

interface StakeholderEntry {
  group: string;
  benefit: number;
  population: string;
  detail: string;
}

interface TimelineEntry {
  year: string;
  positive: string;
  negative: string;
  confidence: "high" | "medium" | "low";
}

interface Props {
  onCreatePolicy: (
    policy: PolicyScores,
    stakeholders: StakeholderEntry[],
    timeline: TimelineEntry[]
  ) => void;
  editingPolicy?: {
    policy: PolicyScores;
    stakeholders: StakeholderEntry[];
    timeline: TimelineEntry[];
  } | null;
  onCancelEdit?: () => void;
}

const DEFAULT_STAKEHOLDERS: StakeholderEntry[] = [
  { group: "Urban Residents", benefit: 0, population: "", detail: "" },
  { group: "Rural Farmers", benefit: 0, population: "", detail: "" },
  { group: "Indigenous Communities", benefit: 0, population: "", detail: "" },
  { group: "Future Generations", benefit: 0, population: "", detail: "" },
  { group: "Aquatic Ecosystems", benefit: 0, population: "N/A", detail: "" },
];

const DEFAULT_TIMELINE: TimelineEntry[] = [
  { year: "Year 1–3", positive: "", negative: "", confidence: "high" },
  { year: "Year 5–10", positive: "", negative: "", confidence: "medium" },
  { year: "Year 20–40", positive: "", negative: "", confidence: "medium" },
  { year: "Year 50+", positive: "", negative: "", confidence: "low" },
];

const SCORE_LABELS: { key: keyof Omit<PolicyScores, "name">; label: string; color: string }[] = [
  { key: "economic", label: "Economic", color: "bg-atlas-economic" },
  { key: "wellbeing", label: "Wellbeing", color: "bg-atlas-wellbeing" },
  { key: "ecological", label: "Ecological", color: "bg-atlas-ecological" },
  { key: "intergenerational", label: "Intergenerational", color: "bg-atlas-intergenerational" },
];

const PolicyCreationForm = ({ onCreatePolicy, editingPolicy, onCancelEdit }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [scores, setScores] = useState({ economic: 50, wellbeing: 50, ecological: 50, intergenerational: 50 });
  const [stakeholders, setStakeholders] = useState<StakeholderEntry[]>(DEFAULT_STAKEHOLDERS.map((s) => ({ ...s })));
  const [timeline, setTimeline] = useState<TimelineEntry[]>(DEFAULT_TIMELINE.map((t) => ({ ...t })));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isEditing = !!editingPolicy;

  // When editingPolicy changes, populate form
  useEffect(() => {
    if (editingPolicy) {
      setName(editingPolicy.policy.name);
      setScores({
        economic: editingPolicy.policy.economic,
        wellbeing: editingPolicy.policy.wellbeing,
        ecological: editingPolicy.policy.ecological,
        intergenerational: editingPolicy.policy.intergenerational,
      });
      setStakeholders(editingPolicy.stakeholders.length > 0 ? editingPolicy.stakeholders.map((s) => ({ ...s })) : DEFAULT_STAKEHOLDERS.map((s) => ({ ...s })));
      setTimeline(editingPolicy.timeline.length > 0 ? editingPolicy.timeline.map((t) => ({ ...t })) : DEFAULT_TIMELINE.map((t) => ({ ...t })));
      setIsOpen(true);
    }
  }, [editingPolicy]);

  const resetForm = () => {
    setName("");
    setScores({ economic: 50, wellbeing: 50, ecological: 50, intergenerational: 50 });
    setStakeholders(DEFAULT_STAKEHOLDERS.map((s) => ({ ...s })));
    setTimeline(DEFAULT_TIMELINE.map((t) => ({ ...t })));
    setIsOpen(false);
    setShowAdvanced(false);
    onCancelEdit?.();
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreatePolicy(
      { name: name.trim(), ...scores },
      stakeholders,
      timeline
    );
    resetForm();
  };

  const updateStakeholder = (i: number, field: keyof StakeholderEntry, value: string | number) => {
    setStakeholders((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const updateTimeline = (i: number, field: keyof TimelineEntry, value: string) => {
    setTimeline((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  };

  return (
    <div className={`rounded-lg border bg-card ${isEditing ? 'border-primary/50' : 'border-border'}`}>
      <button
        onClick={() => { if (isEditing) { resetForm(); } else { setIsOpen(!isOpen); } }}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          {isEditing ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {isEditing ? `Editing: ${editingPolicy?.policy.name}` : "Create Custom Policy"}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-5">
              {/* Policy Name */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Policy Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 50))}
                  placeholder="e.g. Carbon Tax Reform"
                  className="h-8 text-xs font-mono bg-secondary border-border"
                />
              </div>

              {/* Core Scores */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Ethical Dimension Scores
                </span>
                {SCORE_LABELS.map(({ key, label, color }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-xs font-mono text-foreground">{label}</span>
                      </div>
                      <span className="text-xs font-mono text-primary">{scores[key]}</span>
                    </div>
                    <Slider
                      value={[scores[key]]}
                      onValueChange={([v]) => setScores((p) => ({ ...p, [key]: v }))}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              {/* Advanced: Stakeholders + Timeline */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Advanced: Stakeholders & Timeline
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Stakeholders */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Stakeholder Impacts
                      </span>
                      {stakeholders.map((s, i) => (
                        <div key={i} className="grid grid-cols-[1fr_80px_80px_1fr] gap-2 items-center">
                          <span className="text-[10px] font-mono text-foreground truncate">{s.group}</span>
                          <div className="flex items-center gap-1">
                            <Slider
                              value={[s.benefit]}
                              onValueChange={([v]) => updateStakeholder(i, "benefit", v)}
                              min={-100}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <Input
                            value={s.population}
                            onChange={(e) => updateStakeholder(i, "population", e.target.value.slice(0, 20))}
                            placeholder="Pop."
                            className="h-6 text-[10px] font-mono bg-secondary border-border px-1"
                          />
                          <Input
                            value={s.detail}
                            onChange={(e) => updateStakeholder(i, "detail", e.target.value.slice(0, 100))}
                            placeholder="Impact detail..."
                            className="h-6 text-[10px] font-mono bg-secondary border-border px-1"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Timeline Events
                      </span>
                      {timeline.map((t, i) => (
                        <div key={i} className="space-y-1">
                          <span className="text-[10px] font-mono text-muted-foreground">{t.year}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={t.positive}
                              onChange={(e) => updateTimeline(i, "positive", e.target.value.slice(0, 100))}
                              placeholder="Positive outcome..."
                              className="h-6 text-[10px] font-mono bg-secondary border-border px-1"
                            />
                            <Input
                              value={t.negative}
                              onChange={(e) => updateTimeline(i, "negative", e.target.value.slice(0, 100))}
                              placeholder="Negative outcome..."
                              className="h-6 text-[10px] font-mono bg-secondary border-border px-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="w-full h-8 text-xs font-mono"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Policy to Atlas
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PolicyCreationForm;
