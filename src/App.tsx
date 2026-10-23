import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "@/components/ui/NavBar";
import VariantGate from "@/components/VariantGate";

const Landing = lazy(() => import("./pages/Landing"));
const Scanner = lazy(() => import("./pages/Scanner"));
const Facilities = lazy(() => import("./pages/Facilities"));
const MyLog = lazy(() => import("./pages/MyLog"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CarbonWallet = lazy(() => import("./pages/CarbonWallet"));
const OrgDashboard = lazy(() => import("./pages/OrgDashboard"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const MarketplaceNew = lazy(() => import("./pages/MarketplaceNew"));
const MarketplaceDetail = lazy(() => import("./pages/MarketplaceDetail"));
const MyListings = lazy(() => import("./pages/MyListings"));
const Friends = lazy(() => import("./pages/Friends"));
const Download = lazy(() => import("./pages/Download"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
    <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    <span className="text-xs font-data tracking-wider uppercase opacity-75">Loading W2W...</span>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <VariantGate>
            <Suspense fallback={<PageFallback />}>
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
            </Suspense>
            <NavBar />
          </VariantGate>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
