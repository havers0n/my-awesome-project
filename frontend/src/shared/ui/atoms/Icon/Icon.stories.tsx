import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./Icon";

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['local', 'lucide'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: { type: 'select' },
      options: ['solid', 'outline', 'mini'],
    },
    color: {
      control: { type: 'color' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Local Icons
export const LocalIcon: Story = {
  args: {
    name: 'LOGO',
    type: 'local',
    size: 'md',
  },
};

export const LocalIconLarge: Story = {
  args: {
    name: 'LOGO',
    type: 'local',
    size: 'xl',
  },
};

// Lucide Icons
export const LucideIcon: Story = {
  args: {
    name: 'Home',
    type: 'lucide',
    size: 'md',
  },
};

export const LucideIconColored: Story = {
  args: {
    name: 'Heart',
    type: 'lucide',
    size: 'lg',
    color: 'red',
  },
};

export const LucideIconOutline: Story = {
  args: {
    name: 'Star',
    type: 'lucide',
    size: 'lg',
    variant: 'outline',
  },
};

// Size Examples
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon name="Home" type="lucide" size="xs" />
        <span className="text-xs">xs (12px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="Home" type="lucide" size="sm" />
        <span className="text-xs">sm (16px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="Home" type="lucide" size="md" />
        <span className="text-xs">md (20px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="Home" type="lucide" size="lg" />
        <span className="text-xs">lg (24px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="Home" type="lucide" size="xl" />
        <span className="text-xs">xl (32px)</span>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Variant Examples
export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Icon name="Star" type="lucide" size="xl" variant="solid" />
        <span className="text-xs">solid</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="Star" type="lucide" size="xl" variant="outline" />
        <span className="text-xs">outline</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="Star" type="lucide" size="xl" variant="mini" />
        <span className="text-xs">mini</span>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Popular Lucide Icons
export const PopularLucideIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4">
      {[
        'Home',
        'User',
        'Settings',
        'Search',
        'Bell',
        'Mail',
        'Heart',
        'Star',
        'Plus',
        'Minus',
        'X',
        'Check',
        'ChevronLeft',
        'ChevronRight',
        'ChevronUp',
        'ChevronDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Download',
        'Upload',
        'Edit',
        'Trash2',
        'Copy',
        'Save',
        'Eye',
        'EyeOff',
        'Lock',
        'Unlock',
        'Shield',
        'AlertCircle',
      ].map(iconName => (
        <div key={iconName} className="flex flex-col items-center gap-2 p-2">
          <Icon name={iconName} type="lucide" size="lg" />
          <span className="text-xs text-center">{iconName}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Local Icons Gallery
export const LocalIconsGallery: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4">
      {[
        'LOGO',
        'LOGO_DARK',
        'LOGO_ICON',
        'AUTH_LOGO',
        'ALERT',
        'ALERT_HEXA',
        'CHECK_CIRCLE',
        'INFO',
        'CALENDAR',
        'CHAT',
        'DOCS',
        'DOWNLOAD',
        'ENVELOPE',
        'FILE',
        'FOLDER',
        'GRID',
        'LIST',
        'LOCK',
        'PENCIL',
        'PLUS',
        'SEARCH',
        'SETTINGS',
        'STAR',
        'TRASH',
        'USER_CIRCLE',
        'USER_LINE',
        'TIME',
        'BOLT',
      ].map(iconName => (
        <div key={iconName} className="flex flex-col items-center gap-2 p-2">
          <Icon name={iconName} type="local" size="lg" />
          <span className="text-xs text-center">{iconName}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Usage Examples
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">В кнопках</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded">
            <Icon name="Plus" type="lucide" size="sm" />
            Add Item
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded">
            <Icon name="Check" type="lucide" size="sm" />
            Confirm
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">В навигации</h3>
        <div className="flex gap-4">
          <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Icon name="Home" type="lucide" size="sm" />
            Home
          </a>
          <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Icon name="Settings" type="lucide" size="sm" />
            Settings
          </a>
          <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Icon name="User" type="lucide" size="sm" />
            Profile
          </a>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">В индикаторах статуса</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-green-600">
            <Icon name="Check" type="lucide" size="sm" />
            Success
          </div>
          <div className="flex items-center gap-2 text-red-600">
            <Icon name="X" type="lucide" size="sm" />
            Error
          </div>
          <div className="flex items-center gap-2 text-yellow-600">
            <Icon name="AlertCircle" type="lucide" size="sm" />
            Warning
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Fallback Example
export const FallbackExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Fallback для неизвестных иконок</h3>
        <div className="flex items-center gap-4">
          <Icon name="NonExistentIcon" type="lucide" size="lg" />
          <Icon name="UNKNOWN_ICON" type="local" size="lg" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
