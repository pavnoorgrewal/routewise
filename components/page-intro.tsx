type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="border-b border-border bg-secondary/25 pb-16 pt-36 md:pb-20 md:pt-44">
      <div className="mx-auto max-w-4xl px-6">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h1 className="max-w-3xl font-serif text-balance text-5xl font-normal leading-[1.08] tracking-tight md:text-7xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-9 border-l-2 border-foreground/20 pl-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Founder</p>
          <p className="mt-1 text-sm font-medium">Pavnoor Singh Grewal</p>
        </div>
      </div>
    </section>
  );
}
