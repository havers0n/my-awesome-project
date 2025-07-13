import type { Preview } from '@storybook/react';
import '../src/index.css'; // Импортируем глобальные стили с Tailwind

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { theme } = context.globals;
      
      // Применяем тему к документу
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
      
      return (
        <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-white dark:bg-gray-900`}>
          <div className="p-4">
            <Story />
          </div>
        </div>
      );
    },
  ],
};

export default preview;
