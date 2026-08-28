import Image from "next/image";

interface PageHeroProps {
  index: string;
  total?: string;
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageHero({ index, total = "06", eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="page-hero-shell" aria-labelledby="catalog-page-title">
      <div className="page-hero-grid">
        <div className="page-hero-index" aria-hidden="true">
          <span className="page-hero-index-current">{index}</span>
          <span className="page-hero-index-total">/ {total}</span>
        </div>

        <div className="page-hero-copy">
          {eyebrow ? <p className="page-kicker">{eyebrow}</p> : null}
          <h1 id="catalog-page-title" className="page-title">
            {title}
          </h1>
        </div>

        {description ? <p className="page-description">{description}</p> : null}
      </div>

      <div className="page-hero-register" aria-hidden="true">
        <Image
          src="/images/home/library-stamp.png"
          alt=""
          width={160}
          height={112}
          className="page-hero-stamp"
        />
        <span className="page-hero-register-label">SG—{index} / {total}</span>
      </div>
    </section>
  );
}
