import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from '@/components/molecules/Modal';
import { Icon } from '@/components/common/Icon';

const WELCOME_MODAL_SHOWN_KEY = 'hasSeenWelcomeModal';

const WelcomeModal: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // On component mount, check if the user has seen the modal before.
    const hasSeen = localStorage.getItem(WELCOME_MODAL_SHOWN_KEY);
    if (!hasSeen) {
      // If not, open the modal and mark it as seen.
      setOpen(true);
      localStorage.setItem(WELCOME_MODAL_SHOWN_KEY, 'true');
    }
  }, []);

  // The entire modal state is now controlled by the `open` state and `onOpenChange`.
  // The presentation is handled by our new composable Modal components.
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent size="md">
        <div className="flex flex-col items-center text-center p-6">
          <Icon name="INFO" size={8} className="mb-3 text-blue-500" />
          <ModalHeader className="p-0">
            <ModalTitle>Добро пожаловать!</ModalTitle>
          </ModalHeader>
          <ModalDescription className="mt-2">
            Вы находитесь на странице прогнозирования. Здесь можно создавать
            новые прогнозы и анализировать прошлые результаты. Для начала работы
            используйте кнопки:
          </ModalDescription>
          <div className="flex flex-col items-start gap-2 my-4 text-sm">
            <div className="flex items-center gap-2">
              <span role="img" aria-label="Прогноз">
                📊
              </span>
              <span>— Новый прогноз (5-10 сек)</span>
            </div>
            <div className="flex items-center gap-2">
              <span role="img" aria-label="Обновить">
                🔄
              </span>
              <span>— Обновить график с новыми данными</span>
            </div>
          </div>
          <p className="text-gray-500 mt-2 text-xs">
            Подсказки на кнопках помогут освоиться быстрее!
            <br />
            Приятного пользования!
          </p>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default WelcomeModal;

