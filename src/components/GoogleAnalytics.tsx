import { useEffect } from "react";

const GA_ID = "G-PLACEHOLDER"; // Will be replaced with actual ID

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GoogleAnalytics = () => {
  useEffect(() => {
    if (GA_ID === "G-PLACEHOLDER") return;

    const consent = localStorage.getItem("cookie_consent");
    if (consent !== "accepted") return;

    // Load gtag.js
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
    });

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default GoogleAnalytics;
export { GA_ID };
