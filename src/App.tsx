import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SeasonTicker } from './components/SeasonTicker';
import { ToastContainer } from './components/ToastContainer';
import { CombatModal } from './components/CombatModal';
import { LogModal } from './components/LogModal';
import { RulesModal } from './components/RulesModal';
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

        {/* Content Area with left offset for sidebar */}
        <main className="flex-1 flex flex-col pl-64 min-w-0 bg-[#161311]">
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

      {/* In-Game Notifications Toast Stack */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
