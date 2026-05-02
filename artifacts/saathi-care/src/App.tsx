import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";

import Dashboard from "./pages/dashboard";
import Reminders from "./pages/reminders";
import Medications from "./pages/medications";
import Health from "./pages/health";
import Checkin from "./pages/checkin";
import Assistant from "./pages/assistant";
import Contacts from "./pages/contacts";
import Tips from "./pages/tips";
import Profile from "./pages/profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/reminders" component={Reminders} />
        <Route path="/medications" component={Medications} />
        <Route path="/health" component={Health} />
        <Route path="/checkin" component={Checkin} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/tips" component={Tips} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
