import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "@/pages/AuthPages/SignIn";
import NotFound from "@/pages/OtherPage/NotFound";
import UserProfiles from "@/pages/UserProfiles";
import Videos from "@/pages/UiElements/Videos";
import Images from "@/pages/UiElements/Images";
import Alerts from "@/pages/UiElements/Alerts";
import Badges from "@/pages/UiElements/Badges";
import Avatars from "@/pages/UiElements/Avatars";
import Buttons from "@/pages/UiElements/Buttons";
import LineChart from "@/pages/Charts/LineChart";
import BarChart from "@/pages/Charts/BarChart";
import Calendar from "@/pages/Calendar";
import BasicTables from "@/pages/Tables/BasicTables";
import FormElements from "@/pages/Forms/FormElements";
import Blank from "@/pages/Blank";
import AppLayout from "@/layout/AppLayout";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import Home from "@/pages/Dashboard/Home";
import OutOfStockTracker from "@/pages/OtherPage/OutOfStockTracker";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ResetPassword from "@/pages/AuthPages/ResetPassword";
import UpdatePassword from "@/pages/AuthPages/UpdatePassword";
import AdminCreateUser from "@/pages/AdminCreateUser";
import ProfilePage from "@/pages/ProfilePage";
import NewAdminApp from "@/pages/Admin/NewAdminApp";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('EVENT in App.tsx:', event, 'SESSION:', session);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY detected in App.tsx! Navigating to /update-password...');
        navigate('/update-password');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Protected Dashboard Layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index path="/" element={<Home />} />

          {/* Others Page */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user-profiles" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/out-of-stock" element={<OutOfStockTracker />} />

          {/* Forms */}
          <Route path="/form-elements" element={<FormElements />} />

          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />

          {/* Ui Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />

          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>

        {/* Auth Layout */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Navigate to="/signin" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Admin Layout */}
        <Route path="/admin/*" element={<NewAdminApp />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
