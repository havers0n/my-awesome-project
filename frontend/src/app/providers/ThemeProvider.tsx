import React from "react";
import { ThemeProvider as OriginalThemeProvider } from "@/context/ThemeContext";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <OriginalThemeProvider>{children}</OriginalThemeProvider>;
};
