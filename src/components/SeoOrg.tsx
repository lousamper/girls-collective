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
    logo: `${siteUrl}/logo-gc.png`,
    sameAs: [
      "https://www.instagram.com/girlscollective_yourcity",
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
