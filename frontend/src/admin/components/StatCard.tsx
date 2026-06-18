import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "success" | "warning";
}

const tones: Record<NonNullable<Props["tone"]>, string> = {
  primary:   "bg-primary/10 text-primary",
  secondary: "bg-secondary/20 text-secondary-foreground",
  success:   "bg-emerald-500/10 text-emerald-600",
  warning:   "bg-amber-500/10 text-amber-600",
};

const StatCard = ({ label, value, hint, icon: Icon, tone = "primary" }: Props) => (
  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-heading font-black text-2xl mt-1.5 text-foreground">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <div className={`p-3 rounded-xl ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default StatCard;
