// src/components/SeoOrg.tsx
type JsonLd = Record<string, unknown>;

function jsonLd(obj: JsonLd) {
  return { __html: JSON.stringify(obj) };
}

export default function SeoOrg() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.girls-collective.com")
    .replace(/\/+$/, ""); // optional: strip trailing slash

    const organization: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Girls Collective",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo-gc.png`,
      width: 512,   // make sure your logo is ~square and ≥112px
      height: 512
    },
    sameAs: [
      "https://www.instagram.com/girls_collective",
      "https://www.tiktok.com/@valenciagirlscollective",
    ],
  };

  const website: JsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    name: "Girls Collective",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={query}`,
      "query-input": "required name=query",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(website)} />
    </>
  );
}
