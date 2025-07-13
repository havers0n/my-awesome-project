import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      theme: 'light',
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        wide: {
          name: 'Wide',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
    a11y: {
      element: '#root',
      config: {
        rules: [
          {
            id: 'autocomplete-valid',
            enabled: true,
          },
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
          {
            id: 'form-field-multiple-labels',
            enabled: true,
          },
          {
            id: 'frame-title',
            enabled: true,
          },
          {
            id: 'duplicate-id-active',
            enabled: true,
          },
          {
            id: 'duplicate-id-aria',
            enabled: true,
          },
          {
            id: 'duplicate-id',
            enabled: true,
          },
          {
            id: 'heading-order',
            enabled: true,
          },
          {
            id: 'html-has-lang',
            enabled: true,
          },
          {
            id: 'html-lang-valid',
            enabled: true,
          },
          {
            id: 'html-xml-lang-mismatch',
            enabled: true,
          },
          {
            id: 'image-alt',
            enabled: true,
          },
          {
            id: 'input-image-alt',
            enabled: true,
          },
          {
            id: 'label',
            enabled: true,
          },
          {
            id: 'link-name',
            enabled: true,
          },
          {
            id: 'list',
            enabled: true,
          },
          {
            id: 'listitem',
            enabled: true,
          },
          {
            id: 'meta-refresh',
            enabled: true,
          },
          {
            id: 'meta-viewport',
            enabled: true,
          },
          {
            id: 'object-alt',
            enabled: true,
          },
          {
            id: 'role-img-alt',
            enabled: true,
          },
          {
            id: 'scrollable-region-focusable',
            enabled: true,
          },
          {
            id: 'select-name',
            enabled: true,
          },
          {
            id: 'server-side-image-map',
            enabled: true,
          },
          {
            id: 'svg-img-alt',
            enabled: true,
          },
          {
            id: 'td-headers-attr',
            enabled: true,
          },
          {
            id: 'th-has-data-cells',
            enabled: true,
          },
          {
            id: 'valid-lang',
            enabled: true,
          },
          {
            id: 'video-caption',
            enabled: true,
          },
        ],
      },
    },
  },
  decorators: [],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
      },
    },
  },
};

export default preview;
