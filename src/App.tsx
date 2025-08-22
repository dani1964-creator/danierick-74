
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, ScrollRestoration } from "react-router-dom";
import { PersistentLayout } from "@/components/layout/PersistentLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HelmetProvider } from 'react-helmet-async';
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import Settings from "./pages/Settings";
import WebsiteSettings from "./pages/WebsiteSettings";
import Leads from "./pages/Leads";
import Realtors from "./pages/Realtors";
import NotFound from "./pages/NotFound";
import PublicSite from "./pages/PublicSite";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status === 404 || status === 401 || status === 403) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
  },
});

const RootLayout = () => (
  <>
    <ScrollRestoration 
      getKey={(location, matches) => {
        // Para navegação PUSH (nova página), manter scroll atual
        // Para navegação POP (voltar), restaurar posição salva
        return location.key;
      }}
    />
    <PersistentLayout />
  </>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "auth",
        element: <Auth />
      },
      {
        path: "dashboard/home",
        element: <Dashboard />
      },
      {
        path: "dashboard/properties",
        element: <Properties />
      },
      {
        path: "dashboard/settings",
        element: <Settings />
      },
      {
        path: "dashboard/website",
        element: <WebsiteSettings />
      },
      {
        path: "dashboard/leads",
        element: <Leads />
      },
      {
        path: "dashboard/realtors",
        element: <Realtors />
      },
      {
        path: ":slug",
        element: <PublicSite />
      },
      {
        path: ":slug/:propertySlug",
        element: <PublicSite />
      },
      {
        path: ":slug/sobre-nos",
        element: <AboutUs />
      },
      {
        path: ":slug/politica-de-privacidade",
        element: <PrivacyPolicy />
      },
      {
        path: ":slug/termos-de-uso",
        element: <TermsOfUse />
      },
      {
        path: "404",
        element: <NotFound />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
]);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
