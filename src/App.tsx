import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "@/components/ui/NavBar";
import VariantGate from "@/components/VariantGate";
import Landing from "./pages/Landing";
import Scanner from "./pages/Scanner";

import Facilities from "./pages/Facilities";
import MyLog from "./pages/MyLog";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import CarbonWallet from "./pages/CarbonWallet";
import OrgDashboard from "./pages/OrgDashboard";
import Marketplace from "./pages/Marketplace";
import MarketplaceNew from "./pages/MarketplaceNew";
import MarketplaceDetail from "./pages/MarketplaceDetail";
import MyListings from "./pages/MyListings";
import Friends from "./pages/Friends";
import Download from "./pages/Download";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <VariantGate>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/scan" element={<Scanner />} />

              <Route path="/facilities" element={<Facilities />} />
              <Route path="/log" element={<MyLog />} />
              <Route path="/wallet" element={<CarbonWallet />} />
              <Route path="/org" element={<OrgDashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/new" element={<MarketplaceNew />} />
              <Route path="/marketplace/my" element={<MyListings />} />
              <Route path="/marketplace/:id" element={<MarketplaceDetail />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/download" element={<Download />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <NavBar />
          </VariantGate>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
