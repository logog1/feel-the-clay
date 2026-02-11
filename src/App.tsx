import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PotteryExperience from "./pages/PotteryExperience";
import HandbuildingWorkshop from "./pages/HandbuildingWorkshop";
import EmbroideryWorkshop from "./pages/EmbroideryWorkshop";
import Store from "./pages/Store";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/workshop/pottery-experience" element={<PotteryExperience />} />
          <Route path="/workshop/handbuilding" element={<HandbuildingWorkshop />} />
          <Route path="/workshop/embroidery" element={<EmbroideryWorkshop />} />
          <Route path="/store" element={<Store />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
