import React from "react";
import { AuthProvider as OriginalAuthProvider } from "@/context/AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <OriginalAuthProvider>{children}</OriginalAuthProvider>;
};
