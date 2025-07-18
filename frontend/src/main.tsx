import React, { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { ToastProvider } from "./contexts/ToastContext";
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // import i18n instance

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <SidebarProvider>
                  <ToastProvider>
                    <QueryClientProvider client={queryClient}>
                      <AppWrapper>
                        <App />
                      </AppWrapper>
                    </QueryClientProvider>
                  </ToastProvider>
                </SidebarProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </I18nextProvider>
      </ErrorBoundary>
    </Suspense>
  // </StrictMode>,
);
