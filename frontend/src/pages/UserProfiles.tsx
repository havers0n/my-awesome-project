import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserMetaCard from "@/components/UserProfile/UserMetaCard";
import UserInfoCard from "@/components/UserProfile/UserInfoCard";
import UserBusinessCard from "@/components/UserProfile/UserBusinessCard";
import MonetizationInfoCard from "@/components/UserProfile/MonetizationInfoCard";
import PageMeta from "@/components/common/PageMeta";
import { useState, useEffect } from "react";

export default function UserProfiles() {
  // Mock user role - in a real app, this would come from authentication
  const [userRole, setUserRole] = useState<'employee' | 'franchisee' | 'admin'>('franchisee');
  
  // Mock monetization data - in a real app, this would come from an API
  const [monetizationDetails, setMonetizationDetails] = useState([
    {
      type: "subscription",
      planName: "Премиум Плюс",
      status: "Активна",
      expiresAt: "2025-12-31",
      costPerPeriod: "5000 руб/мес",
      renewalDate: "2025-07-01"
    },
    {
      type: "savings_percentage",
      metricName: "Экономия на оптимизации запасов",
      currentSavings: "150,000 руб",
      period: "Июнь 2025",
      commissionRate: "10%",
      commissionAmount: "15,000 руб"
    }
  ]);

  // In a real app, you would fetch this data from an API
  useEffect(() => {
    // Example of how you might fetch data
    // const fetchUserData = async () => {
    //   try {
    //     const response = await fetch('/api/user/profile');
    //     const data = await response.json();
    //     setUserRole(data.userRole);
    //     setMonetizationDetails(data.monetizationDetails);
    //   } catch (error) {
    //     console.error('Error fetching user data:', error);
    //   }
    // };
    // fetchUserData();
  }, []);

  return (
    <>
      <PageMeta
        title="Личный кабинет | TailAdmin - Next.js Admin Dashboard Template"
        description="Личный кабинет пользователя с информацией о профиле и бизнесе"
      />
      <PageBreadcrumb pageTitle="Личный кабинет" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Профиль
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserBusinessCard />
          
          {/* Role selector for demo purposes - would be removed in production */}
          <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
            <h5 className="text-md font-semibold mb-2">Демо: Выберите роль пользователя</h5>
            <div className="flex gap-2">
              <button 
                onClick={() => setUserRole('employee')}
                className={`px-3 py-1 rounded ${userRole === 'employee' ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                Сотрудник
              </button>
              <button 
                onClick={() => setUserRole('franchisee')}
                className={`px-3 py-1 rounded ${userRole === 'franchisee' ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                Владелец/Управляющий
              </button>
              <button 
                onClick={() => setUserRole('admin')}
                className={`px-3 py-1 rounded ${userRole === 'admin' ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                Администратор
              </button>
            </div>
          </div>
          
          {/* Monetization info card */}
          <MonetizationInfoCard 
            monetizationDetails={monetizationDetails} 
            userRole={userRole} 
          />
        </div>
      </div>
    </>
  );
}
