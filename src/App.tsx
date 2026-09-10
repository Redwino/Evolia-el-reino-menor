import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SeasonTicker } from './components/SeasonTicker';
import { ToastContainer } from './components/ToastContainer';
import { CombatModal } from './components/CombatModal';
import { LogModal } from './components/LogModal';
import { RulesModal } from './components/RulesModal';
import { TestModal } from './components/TestModal';
import { TacticalMapScreen } from './components/screens/TacticalMapScreen';
import { AnthillScreen } from './components/screens/AnthillScreen';
import { GeneticTreeScreen } from './components/screens/GeneticTreeScreen';
import { CastesLegionsScreen } from './components/screens/CastesLegionsScreen';
import { DiplomacyScreen } from './components/screens/DiplomacyScreen';

const MainScreenRouter: React.FC = () => {
  const { currentScreen } = useGame();

  switch (currentScreen) {
    case 'mapa-tactico':
      return <TacticalMapScreen />;
    case 'ant-hill-core':
      return <AnthillScreen />;
    case 'arbol-evolutivo':
      return <GeneticTreeScreen />;
    case 'enjambre-militar':
      return <CastesLegionsScreen />;
    case 'feromonas-diplomacia':
      return <DiplomacyScreen />;
    default:
      return <TacticalMapScreen />;
  }
};

const AppContent: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#161311] text-[#eae1dd] flex flex-col antialiased selection:bg-[#f06536] selection:text-[#521400]">
      {/* Fixed Top Header (Brand, Rounds, AP Counter, Quick Actions) */}
      <Header />

      {/* Main Structural Framework */}
      <div className="flex-1 flex pt-20">
        {/* Left Navigation Drawer / Sidebar */}
        <Sidebar />

        {/* Content Area with responsive offset for sidebar */}
        <main className="flex-1 flex flex-col lg:pl-64 pl-0 min-w-0 bg-[#161311]">
          {/* Match Status & Season/Resource Ticker Bar */}
          <SeasonTicker />

          {/* Active Screen View */}
          <div className="flex-1 flex flex-col min-h-0">
            <MainScreenRouter />
          </div>
        </main>
      </div>

      {/* Tactile Audio & Visual Modals */}
      <CombatModal />
      <LogModal />
      <RulesModal />
      <TestModal />

      {/* In-Game Notifications Toast Stack */}
      <ToastContainer />
    </div>
  );
};

interface GameErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GameErrorBoundary extends Component<GameErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game caught error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#161311] text-[#eae1dd] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#231f1d] p-6 rounded-2xl border border-[#f06536]/40 shadow-xl flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-[48px] text-[#f06536]">
              warning
            </span>
            <h2 className="text-xl font-bold font-headline text-[#ffb59d]">
              Reinicio de Colonia Requerido
            </h2>
            <p className="text-xs text-[#e1bfb5]">
              Se detectó una interrupción en el estrato táctico. Pulsa abajo para restablecer la partida.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] font-bold text-xs px-5 py-2.5 rounded-full transition-all"
            >
              Reiniciar Simulador
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <GameErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </GameErrorBoundary>
  );
}
