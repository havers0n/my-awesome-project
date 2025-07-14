import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./SidebarContext";
import { ToastProvider } from "./ToastContext";
import { DataProvider } from "./DataContext";
import { AppWrapper } from "@/components/common/PageMeta";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./ThemeProvider";

const queryClient = new QueryClient();

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
            <DataProvider>
              <ToastProvider>
                <QueryClientProvider client={queryClient}>
                  <AppWrapper>
                    {children}
                  </AppWrapper>
                </QueryClientProvider>
              </ToastProvider>
            </DataProvider>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
