import React from "react";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";
import '@/widgets/registry'; // Инициализация виджетов

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;
