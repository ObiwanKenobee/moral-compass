import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

interface Policy {
  name: string;
  economic: number;
  wellbeing: number;
  ecological: number;
  intergenerational: number;
}

interface Props {
  policies: Policy[];
}

const COLORS = [
  "hsl(38, 90%, 55%)",
  "hsl(160, 60%, 45%)",
  "hsl(270, 50%, 60%)",
];

const data_keys = [
  { key: "economic", label: "Economic Efficiency" },
  { key: "wellbeing", label: "Human Wellbeing" },
  { key: "ecological", label: "Ecological Stability" },
  { key: "intergenerational", label: "Intergenerational Fairness" },
];

const EthicalLensRadar = ({ policies }: Props) => {
  const chartData = data_keys.map((dk) => ({
    dimension: dk.label,
    ...Object.fromEntries(policies.map((p) => [p.name, p[dk.key as keyof Omit<Policy, "name">]])),
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-6 atlas-glow">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Ethical Lens Engine
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="hsl(220, 15%, 18%)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "hsl(220, 10%, 40%)", fontSize: 8 }}
            axisLine={false}
          />
          {policies.map((p, i) => (
            <Radar
              key={p.name}
              name={p.name}
              dataKey={p.name}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EthicalLensRadar;
