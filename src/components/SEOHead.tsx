import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
  noSuffix?: boolean;
  image?: string;
  locale?: "en" | "fr" | "es" | "ar";
}

const SITE_URL = "https://www.terrariaworkshops.com";
const SITE_NAME = "Terraria Workshops";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og.jpg`;
const SUPPORTED_LANGS = ["en", "fr", "es", "ar"] as const;

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  ar: "ar_MA",
};

const SEOHead = ({ title, description, path, type = "website", jsonLd, noSuffix, image, locale = "en" }: SEOHeadProps) => {
  const fullTitle = noSuffix ? title : `${title} | ${SITE_NAME}`;
  const canonical = `${SITE_URL}${path}`;
  const ogImage = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`)
    : DEFAULT_OG_IMAGE;
  const ogLocale = OG_LOCALE_MAP[locale] || "en_US";
  const alternateLocales = Object.entries(OG_LOCALE_MAP)
    .filter(([lang]) => lang !== locale)
    .map(([, l]) => l);

  return (
    <Helmet>
      <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* hreflang for multilingual SEO */}
      {SUPPORTED_LANGS.map((lang) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={canonical} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={ogLocale} />
      {alternateLocales.map((l) => (
        <meta key={l} property="og:locale:alternate" content={l} />
      ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
