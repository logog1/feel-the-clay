import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { HelmetProvider } from "react-helmet-async";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ScrollToTop from "@/components/ScrollToTop";

// Index ships eagerly so the landing page (LCP) renders without a chunk hop.
import Index from "./pages/Index";

// Everything else is code-split per route. Heavy admin/partner/dashboard
// pages are no longer downloaded by anonymous visitors hitting "/".
const NotFound = lazy(() => import("./pages/NotFound"));
const PotteryExperience = lazy(() => import("./pages/PotteryExperience"));
const HandbuildingWorkshop = lazy(() => import("./pages/HandbuildingWorkshop"));
const EmbroideryWorkshop = lazy(() => import("./pages/EmbroideryWorkshop"));
const ZellijWorkshop = lazy(() => import("./pages/ZellijWorkshop"));
const CarpetsWorkshop = lazy(() => import("./pages/CarpetsWorkshop"));
const GardeningWorkshop = lazy(() => import("./pages/GardeningWorkshop"));
const Store = lazy(() => import("./pages/Store"));
const Cart = lazy(() => import("./pages/Cart"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BookingsDelivery = lazy(() => import("./pages/BookingsDelivery"));
const ProDashboard = lazy(() => import("./pages/ProDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const Exodaya = lazy(() => import("./pages/Exodaya"));
const Feedback = lazy(() => import("./pages/Feedback"));
const TetouanThingsToDo = lazy(() => import("./pages/TetouanThingsToDo"));
const PartnerLanding = lazy(() => import("./pages/PartnerLanding"));

const PartnerConcierge = lazy(() => import("./pages/PartnerConcierge"));
const PartnerKit = lazy(() => import("./pages/PartnerKit"));
const PartnerTerms = lazy(() => import("./pages/PartnerTerms"));
const PartnerGuide = lazy(() => import("./pages/PartnerGuide"));
const KitZelligePreview = lazy(() => import("./pages/KitZelligePreview"));
const FassiZelligeStory = lazy(() => import("./pages/FassiZelligeStory"));

const queryClient = new QueryClient();

// Minimal placeholder while a route chunk loads. Plain background avoids
// any flash that would conflict with each route's own SEOHead/theme.
const RouteFallback = () => (
  <div
    className="min-h-dvh bg-background"
    role="status"
    aria-label="Loading page"
  />
);

const PartnerSlugRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/${slug ?? ""}`} replace />;
};


const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <LanguageSwitcher />
              <CookieConsent />

              <BrowserRouter>
                {/* WhatsAppFloat uses useLocation — must live inside Router */}
                <WhatsAppFloat />
                <ScrollToTop />
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/workshop/pottery-experience" element={<PotteryExperience />} />
                    <Route path="/workshop/handbuilding" element={<HandbuildingWorkshop />} />
                    <Route path="/workshop/embroidery" element={<EmbroideryWorkshop />} />
                    <Route path="/workshop/zellij" element={<ZellijWorkshop />} />
                    <Route path="/workshop/carpets" element={<CarpetsWorkshop />} />
                    <Route path="/workshop/gardening" element={<GardeningWorkshop />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/delivery" element={<BookingsDelivery />} />
                    <Route path="/admin/pro" element={<ProDashboard />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/exodaya" element={<Exodaya />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/legal" element={<LegalNotice />} />
                    <Route path="/unsubscribe" element={<Unsubscribe />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/tetouan/things-to-do" element={<TetouanThingsToDo />} />
                    <Route path="/things-to-do-in-tetouan" element={<TetouanThingsToDo />} />
                    <Route path="/partners/terms" element={<PartnerTerms />} />
                    {/* Legacy long partner URLs — redirect to short canonical */}
                    <Route path="/partners/:slug" element={<PartnerSlugRedirect />} />
                    <Route path="/partners/:slug/kit" element={<PartnerKit />} />
                    <Route path="/partners/:slug/concierge" element={<PartnerConcierge />} />
                    <Route path="/partners/:slug/guide" element={<PartnerGuide />} />
                    <Route path="/preview/kit-zellige" element={<KitZelligePreview />} />
                    <Route path="/store/kit-zellige" element={<KitZelligePreview />} />
                    <Route path="/story/fassi-zellige" element={<FassiZelligeStory />} />
                    {/* Short indexable partner URL — keep last before catch-all */}
                    <Route path="/:slug" element={<PartnerLanding />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </CartProvider>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
