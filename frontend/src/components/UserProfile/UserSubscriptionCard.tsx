import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { FaCrown, FaCalendarAlt, FaCreditCard } from "react-icons/fa";

export default function UserSubscriptionCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving subscription changes...");
    closeModal();
  };

  // Mock subscription data - in a real app, this would come from an API
  const subscriptionData = {
    status: "Active",
    plan: "Premium",
    startDate: "2023-01-15",
    endDate: "2024-01-15",
    autoRenew: true,
    paymentMethod: "Credit Card (**** 4567)"
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Статус подписки
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Статус
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${subscriptionData.status === "Active" ? "bg-green-500" : "bg-red-500"}`}></span>
                  {subscriptionData.status}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  План
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 flex items-center">
                  <FaCrown className="text-yellow-500 mr-2" />
                  {subscriptionData.plan}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Дата начала
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 flex items-center">
                  <FaCalendarAlt className="text-blue-500 mr-2" />
                  {subscriptionData.startDate}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Дата окончания
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 flex items-center">
                  <FaCalendarAlt className="text-blue-500 mr-2" />
                  {subscriptionData.endDate}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Автопродление
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {subscriptionData.autoRenew ? "Включено" : "Выключено"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Способ оплаты
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 flex items-center">
                  <FaCreditCard className="text-purple-500 mr-2" />
                  {subscriptionData.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Управление подпиской
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Управление подпиской
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Измените настройки вашей подписки.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>План</Label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="basic">Базовый</option>
                    <option value="premium" selected>Премиум</option>
                    <option value="enterprise">Корпоративный</option>
                  </select>
                </div>

                <div>
                  <Label>Способ оплаты</Label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="credit_card" selected>Кредитная карта (**** 4567)</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Банковский перевод</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoRenew"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={subscriptionData.autoRenew}
                    />
                    <label htmlFor="autoRenew" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Автоматическое продление
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Отмена
              </Button>
              <Button size="sm" onClick={handleSave}>
                Сохранить изменения
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
} 