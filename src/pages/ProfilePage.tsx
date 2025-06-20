import React from "react";
import UserProfile from "../components/profile/UserProfile";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">Мой профиль</h1>
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
} 