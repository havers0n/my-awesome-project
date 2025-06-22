import React from 'react';
import { FaMoneyBillWave, FaPercentage, FaRegCalendarAlt, FaStar, FaInfoCircle } from 'react-icons/fa';

interface MonetizationDetail {
  type: string;
  [key: string]: any; // For flexibility in adding fields
}

interface MonetizationInfoCardProps {
  monetizationDetails: MonetizationDetail[];
  userRole?: 'employee' | 'franchisee' | 'admin'; // User role to control what information is shown
}

const RenderSubscriptionInfo: React.FC<{ details: any; userRole?: string }> = ({ details, userRole }) => (
  <div className="mb-4 p-3 border border-gray-200 rounded-lg dark:border-gray-700">
    <h5 className="text-md font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center">
      <FaStar className="mr-2" /> Подписка: {details.planName}
    </h5>
    <p><strong>Статус:</strong> <span className={details.status === 'Активна' ? 'text-green-500' : 'text-red-500'}>{details.status}</span></p>
    
    {/* Show financial details only to franchisee and admin */}
    {(userRole === 'franchisee' || userRole === 'admin') && (
      <>
        {details.costPerPeriod && <p><strong>Стоимость:</strong> {details.costPerPeriod}</p>}
        {details.renewalDate && <p><strong>Следующее списание:</strong> {new Date(details.renewalDate).toLocaleDateString()}</p>}
      </>
    )}
    
    {/* Show expiration date to all roles */}
    {details.expiresAt && <p><strong>Действует до:</strong> {new Date(details.expiresAt).toLocaleDateString()}</p>}
    
    {/* Show management button only to franchisee and admin */}
    {(userRole === 'franchisee' || userRole === 'admin') && (
      <button className="mt-2 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
        Управлять подпиской
      </button>
    )}
  </div>
);

const RenderSavingsPercentageInfo: React.FC<{ details: any; userRole?: string }> = ({ details, userRole }) => (
  <div className="mb-4 p-3 border border-gray-200 rounded-lg dark:border-gray-700">
    <h5 className="text-md font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center">
      <FaPercentage className="mr-2" /> Экономия: {details.metricName || 'От использования сервиса'}
    </h5>
    
    {/* Show basic savings info to all roles */}
    <p><strong>Сэкономлено ({details.period || 'текущий период'}):</strong> {details.currentSavings}</p>
    
    {/* Show commission details only to franchisee and admin */}
    {(userRole === 'franchisee' || userRole === 'admin') && (
      <>
        {details.commissionRate && <p><strong>Ваша комиссия ({details.commissionRate}):</strong> {details.commissionAmount}</p>}
        <button className="mt-2 text-sm text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
          Подробный отчет по экономии
        </button>
      </>
    )}
  </div>
);

// Placeholder for future monetization models
const RenderPayPerUseInfo: React.FC<{ details: any; userRole?: string }> = ({ details, userRole }) => (
  <div className="mb-4 p-3 border border-gray-200 rounded-lg dark:border-gray-700">
    <h5 className="text-md font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center">
      <FaMoneyBillWave className="mr-2" /> Оплата по использованию
    </h5>
    <p><strong>Текущий период:</strong> {details.period || 'Июнь 2025'}</p>
    <p><strong>Использовано:</strong> {details.usage || '150 единиц'}</p>
    
    {/* Show financial details only to franchisee and admin */}
    {(userRole === 'franchisee' || userRole === 'admin') && (
      <>
        <p><strong>Стоимость единицы:</strong> {details.costPerUnit || '100 руб'}</p>
        <p><strong>Итого к оплате:</strong> {details.totalCost || '15,000 руб'}</p>
      </>
    )}
  </div>
);

export default function MonetizationInfoCard({ monetizationDetails, userRole = 'employee' }: MonetizationInfoCardProps) {
  if (!monetizationDetails || monetizationDetails.length === 0) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
          Тариф и Использование
        </h4>
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <FaInfoCircle className="mr-2" />
          <p>Информация о тарифе не указана</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
        Тариф и Использование
      </h4>
      {monetizationDetails.map((detail, index) => {
        switch (detail.type) {
          case 'subscription':
            return <RenderSubscriptionInfo key={index} details={detail} userRole={userRole} />;
          case 'savings_percentage':
            return <RenderSavingsPercentageInfo key={index} details={detail} userRole={userRole} />;
          case 'pay_per_use':
            return <RenderPayPerUseInfo key={index} details={detail} userRole={userRole} />;
          // Add cases for future monetization models here
          default:
            return (
              <div key={index} className="mb-2 p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                <p>Информация по тарифу типа "{detail.type}" не определена для отображения.</p>
              </div>
            );
        }
      })}
      
      {/* Support contact button */}
      {(userRole === 'franchisee' || userRole === 'admin') && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Связаться с поддержкой по вопросам тарифа
          </button>
        </div>
      )}
    </div>
  );
} 