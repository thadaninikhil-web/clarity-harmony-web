import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Process from "./pages/Process";
import WhoWeWorkWith from "./pages/WhoWeWorkWith";
import About from "./pages/About";
import Services from "./pages/Services";
import Insights from "./pages/Insights";
import InsightDetail from "./pages/InsightDetail";
import ClientStories from "./pages/ClientStories";
import Book from "./pages/Book";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RetirementSimulator from "./pages/RetirementSimulator";
import TwoBucketSimulator from "./pages/TwoBucketSimulator";
import CompareStrategies from "./pages/CompareStrategies";
import SafeWithdrawalSimulator from "./pages/SafeWithdrawalSimulator";
import OneBucketSimulator from "./pages/OneBucketSimulator";
import SwrCompareStrategies from "./pages/SwrCompareStrategies";
import Calculators from "./pages/Calculators";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/process" element={<Process />} />
        <Route path="/who-we-work-with" element={<WhoWeWorkWith />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/:slug" element={<InsightDetail />} />
        <Route path="/client-stories" element={<ClientStories />} />
        <Route path="/book" element={<Book />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/calculators/retirementsimulator" element={<OneBucketSimulator />} />
        <Route path="/calculators/retirementsimulator/onebucket" element={<OneBucketSimulator />} />
        <Route path="/calculators/retirementsimulator/twobucket" element={<TwoBucketSimulator />} />
        <Route path="/calculators/retirementsimulator/threebucket" element={<RetirementSimulator />} />
        <Route path="/calculators/retirementsimulator/compare" element={<CompareStrategies />} />
        {/* Legacy redirects */}
        <Route path="/calculators/onebucket" element={<OneBucketSimulator />} />
        <Route path="/calculators/twobucket" element={<TwoBucketSimulator />} />
        <Route path="/calculators/threebucket" element={<RetirementSimulator />} />
        <Route path="/calculators/compare" element={<CompareStrategies />} />
        <Route path="/calculators/safewithdrawalsimulation" element={<SafeWithdrawalSimulator strategy="one-bucket" />} />
        <Route path="/calculators/safewithdrawalsimulation/onebucket" element={<SafeWithdrawalSimulator strategy="one-bucket" />} />
        <Route path="/calculators/safewithdrawalsimulation/twobucket" element={<SafeWithdrawalSimulator strategy="two-bucket" />} />
        <Route path="/calculators/safewithdrawalsimulation/threebucket" element={<SafeWithdrawalSimulator strategy="three-bucket" />} />
        <Route path="/calculators/safewithdrawalsimulation/compare" element={<SwrCompareStrategies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
