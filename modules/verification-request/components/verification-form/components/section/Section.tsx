// ─── Section wrapper ──────────────────────────────────────────────────
const Section = ({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
    <div className="mb-6 flex items-center gap-3">
      <div className="from-primary to-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className="text-foreground text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

export default Section;
