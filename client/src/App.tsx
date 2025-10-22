import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tarot from "./pages/Tarot";
import Dreams from "./pages/Dreams";
import Astral from "./pages/Astral";
import Oracle from "./pages/Oracle";
import Numerology from "./pages/Numerology";
import Energy from "./pages/Energy";
import PaymentCallback from "./pages/PaymentCallback";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tarot" component={Tarot} />
      <Route path="/dreams" component={Dreams} />
      <Route path="/astral" component={Astral} />
      <Route path="/oracle" component={Oracle} />
      <Route path="/numerology" component={Numerology} />
      <Route path="/energy" component={Energy} />
      <Route path="/payment/success" component={PaymentCallback} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

