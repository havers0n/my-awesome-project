import React, { useEffect, useState } from "react";
import { Icon } from "@/components/common/Icon";

const WELCOME_MODAL_SHOWN_KEY = "hasSeenWelcomeModal";

const WelcomeModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <Icon name="CLOSE" size={6} />
        </button>
        <div className="flex flex-col items-center text-center gap-4">
          <Icon name="INFO" size={8} className="mb-3" />
          <h2 className="text-xl font-semibold mb-2">Добро пожаловать!</h2>
          <p className="text-gray-700 mb-2">
            Вы находитесь на странице прогнозирования. Здесь можно создавать новые прогнозы и анализировать прошлые результаты. Для начала работы используйте кнопки:
          </p>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span role="img" aria-label="Прогноз">📊</span>
              <span>— Новый прогноз (5-10 сек)</span>
            </div>
            <div className="flex items-center gap-2">
              <span role="img" aria-label="Обновить">🔄</span>
              <span>— Обновить график с новыми данными</span>
            </div>
          </div>
          <p className="text-gray-500 mt-2 text-xs">Подсказки на кнопках помогут освоиться быстрее!<br/>Приятного пользования!</p>
        </div>
      </div>
    </div>
  );
};

export const useWelcomeModal = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const hasSeen = localStorage.getItem(WELCOME_MODAL_SHOWN_KEY);
    if (!hasSeen) {
      setOpen(true);
      localStorage.setItem(WELCOME_MODAL_SHOWN_KEY, "true");
    }
  }, []);
  return {
    WelcomeModal,
    welcomeModalOpen: open,
    closeWelcomeModal: () => setOpen(false),
  };
};

export default WelcomeModal;

