interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="page-hero-shell">
      {eyebrow ? <p className="page-kicker">{eyebrow}</p> : null}
      <div className="max-w-4xl space-y-3 md:space-y-4">
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
    </section>
  );
}
