import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PotteryExperience from "./pages/PotteryExperience";
import HandbuildingWorkshop from "./pages/HandbuildingWorkshop";
import EmbroideryWorkshop from "./pages/EmbroideryWorkshop";
import Store from "./pages/Store";
import Cart from "./pages/Cart";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <LanguageSwitcher />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/workshop/pottery-experience" element={<PotteryExperience />} />
              <Route path="/workshop/handbuilding" element={<HandbuildingWorkshop />} />
              <Route path="/workshop/embroidery" element={<EmbroideryWorkshop />} />
              <Route path="/store" element={<Store />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
