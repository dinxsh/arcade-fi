
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SoundtrackPlayer } from "@/components/SoundtrackPlayer";
import Index from "./pages/Index";
import GamePage from "./pages/GamePage";
import GameCreator from "./pages/GameCreator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/create" element={<GameCreator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SoundtrackPlayer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
