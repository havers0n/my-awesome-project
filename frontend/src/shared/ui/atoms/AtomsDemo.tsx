import React from "react";
import {
  Card,
  Text,
  ProgressBar,
  MetricValue,
  CountryFlag,
  IconButton,
  Separator,
  HorizontalSeparator,
  TextSeparator,
  COUNTRY_NAMES,
} from "./index";

// Example icons - replace with your preferred icon library
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const AtomsDemo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <Text variant="h1" size="3xl" weight="bold" color="primary">
          UI Atoms Demo
        </Text>
        <Text variant="p" size="lg" color="secondary">
          Demonstration of all standardized UI atoms
        </Text>
      </div>

      {/* Card Examples */}
      <section>
        <Text variant="h2" size="2xl" weight="semibold" className="mb-4">
          Card Components
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <Text variant="h3" size="lg" weight="medium">
              Default Card
            </Text>
            <Text variant="p" size="sm" color="secondary">
              Standard card with default styling
            </Text>
          </Card>
          <Card variant="elevated" padding="lg">
            <Text variant="h3" size="lg" weight="medium">
              Elevated Card
            </Text>
            <Text variant="p" size="sm" color="secondary">
              Card with elevated shadow
            </Text>
          </Card>
          <Card variant="outlined" hover>
            <Text variant="h3" size="lg" weight="medium">
              Outlined Card
            </Text>
            <Text variant="p" size="sm" color="secondary">
              Card with border outline and hover effect
            </Text>
          </Card>
        </div>
      </section>

      <HorizontalSeparator />

      {/* Text Examples */}
      <section>
        <Text variant="h2" size="2xl" weight="semibold" className="mb-4">
          Text Components
        </Text>
        <Card padding="lg">
          <div className="space-y-3">
            <Text variant="h1" size="3xl" weight="bold">
              Heading 1
            </Text>
            <Text variant="h2" size="2xl" weight="semibold">
              Heading 2
            </Text>
            <Text variant="h3" size="xl" weight="medium">
              Heading 3
            </Text>
            <Text variant="p" size="base">
              Regular paragraph text
            </Text>
            <Text variant="p" size="sm" color="secondary">
              Secondary text
            </Text>
            <Text variant="label" size="sm" weight="medium" color="info">
              Label text
            </Text>
            <div className="flex gap-2 flex-wrap">
              <Text variant="span" size="sm" color="success">
                Success
              </Text>
              <Text variant="span" size="sm" color="warning">
                Warning
              </Text>
              <Text variant="span" size="sm" color="danger">
                Danger
              </Text>
              <Text variant="span" size="sm" color="info">
                Info
              </Text>
            </div>
          </div>
        </Card>
      </section>

      <HorizontalSeparator />

      {/* Metric Values */}
      <section>
        <Text variant="h2" size="2xl" weight="semibold" className="mb-4">
          Metric Values
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <MetricValue
              value={1234}
              label="Total Users"
              change={12.5}
              changeType="increase"
              showTrend
            />
          </Card>
          <Card>
            <MetricValue value={98.5} label="Uptime" suffix="%" variant="success" />
          </Card>
          <Card>
            <MetricValue
              value={45678}
              label="Revenue"
              prefix="$"
              change={-5.2}
              changeType="decrease"
              showTrend
            />
          </Card>
          <Card>
            <MetricValue value="2.3K" label="Active Sessions" variant="info" size="lg" />
          </Card>
        </div>
      </section>

      <HorizontalSeparator />

      {/* Progress Bars */}
      <section>
        <Text variant="h2" size="2xl" weight="semibold" className="mb-4">
          Progress Bars
        </Text>
        <Card padding="lg">
          <div className="space-y-6">
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                Project Completion
              </Text>
              <ProgressBar value={75} size="md" color="blue" showLabel animated />
            </div>
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                Server Load
              </Text>
              <ProgressBar value={60} size="lg" color="green" showLabel />
            </div>
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                Storage Usage
              </Text>
              <ProgressBar value={85} size="sm" color="yellow" showLabel />
            </div>
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                High Usage Alert
              </Text>
              <ProgressBar value={95} size="md" color="red" showLabel animated />
            </div>
          </div>
        </Card>
      </section>

      <HorizontalSeparator />

      {/* Country Flags */}
      <section>
        <Text variant="h2" size="2xl" weight="semibold" className="mb-4">
          Country Flags
        </Text>
        <Card padding="lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CountryFlag countryCode="us" countryName={COUNTRY_NAMES.us} showName />
            <CountryFlag countryCode="gb" countryName={COUNTRY_NAMES.gb} showName />
            <CountryFlag countryCode="de" countryName={COUNTRY_NAMES.de} showName />
            <CountryFlag countryCode="fr" countryName={COUNTRY_NAMES.fr} showName />
            <CountryFlag countryCode="jp" countryName={COUNTRY_NAMES.jp} showName />
            <CountryFlag countryCode="ca" countryName={COUNTRY_NAMES.ca} showName />
            <CountryFlag countryCode="au" countryName={COUNTRY_NAMES.au} showName />
            <CountryFlag countryCode="br" countryName={COUNTRY_NAMES.br} showName />
          </div>
          <TextSeparator text="Different Sizes" />
          <div className="flex items-center gap-4 mt-4">
            <CountryFlag countryCode="us" size="sm" />
            <CountryFlag countryCode="us" size="md" />
            <CountryFlag countryCode="us" size="lg" />
            <CountryFlag countryCode="us" size="xl" />
          </div>
        </Card>
      </section>

      <HorizontalSeparator />

      {/* Icon Buttons */}
      <section>
        <Text variant="h2" size="2xl" weight="semibold" className="mb-4">
          Icon Buttons
        </Text>
        <Card padding="lg">
          <div className="space-y-4">
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                Button Variants
              </Text>
              <div className="flex gap-2 flex-wrap">
                <IconButton icon={<PlusIcon />} variant="primary" ariaLabel="Add" />
                <IconButton icon={<SettingsIcon />} variant="secondary" ariaLabel="Settings" />
                <IconButton icon={<DeleteIcon />} variant="danger" ariaLabel="Delete" />
                <IconButton icon={<PlusIcon />} variant="success" ariaLabel="Add" />
                <IconButton icon={<SettingsIcon />} variant="warning" ariaLabel="Settings" />
                <IconButton icon={<PlusIcon />} variant="ghost" ariaLabel="Add" />
                <IconButton icon={<SettingsIcon />} variant="outline" ariaLabel="Settings" />
              </div>
            </div>
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                Button Sizes
              </Text>
              <div className="flex gap-2 items-center">
                <IconButton icon={<PlusIcon />} size="sm" ariaLabel="Add" />
                <IconButton icon={<PlusIcon />} size="md" ariaLabel="Add" />
                <IconButton icon={<PlusIcon />} size="lg" ariaLabel="Add" />
                <IconButton icon={<PlusIcon />} size="xl" ariaLabel="Add" />
              </div>
            </div>
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                Button Shapes
              </Text>
              <div className="flex gap-2 items-center">
                <IconButton icon={<PlusIcon />} rounded="none" ariaLabel="Add" />
                <IconButton icon={<PlusIcon />} rounded="sm" ariaLabel="Add" />
                <IconButton icon={<PlusIcon />} rounded="md" ariaLabel="Add" />
                <IconButton icon={<PlusIcon />} rounded="lg" ariaLabel="Add" />
                <IconButton icon={<PlusIcon />} rounded="full" ariaLabel="Add" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      <HorizontalSeparator />

      {/* Separators */}
      <section>
        <Text variant="h2" size="2xl" weight="semibold" className="mb-4">
          Separators
        </Text>
        <Card padding="lg">
          <div className="space-y-6">
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                Horizontal Separators
              </Text>
              <div className="space-y-4">
                <div>
                  <Text variant="span" size="sm" color="secondary">
                    Light
                  </Text>
                  <HorizontalSeparator color="light" />
                </div>
                <div>
                  <Text variant="span" size="sm" color="secondary">
                    Medium
                  </Text>
                  <HorizontalSeparator color="medium" />
                </div>
                <div>
                  <Text variant="span" size="sm" color="secondary">
                    Dark
                  </Text>
                  <HorizontalSeparator color="dark" />
                </div>
              </div>
            </div>
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                Text Separators
              </Text>
              <div className="space-y-4">
                <TextSeparator text="OR" />
                <TextSeparator text="AND" />
                <TextSeparator text="MORE" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Example Usage */}
      <section>
        <Text variant="h2" size="2xl" weight="semibold" className="mb-4">
          Combined Example
        </Text>
        <Card padding="lg" shadow="md" hover>
          <div className="flex justify-between items-center mb-4">
            <Text variant="h3" weight="semibold">
              Dashboard Overview
            </Text>
            <div className="flex gap-2">
              <IconButton icon={<SettingsIcon />} variant="ghost" ariaLabel="Settings" />
              <IconButton icon={<PlusIcon />} variant="primary" ariaLabel="Add item" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricValue
              value={15678}
              label="Total Revenue"
              prefix="$"
              change={8.2}
              changeType="increase"
              showTrend
            />
            <MetricValue
              value={234}
              label="Active Users"
              change={-2.1}
              changeType="decrease"
              showTrend
            />
            <MetricValue value="99.9%" label="System Uptime" variant="success" />
          </div>

          <TextSeparator text="Regional Performance" />

          <div className="flex gap-4 items-center mb-4">
            <CountryFlag countryCode="us" countryName={COUNTRY_NAMES.us} showName />
            <CountryFlag countryCode="gb" countryName={COUNTRY_NAMES.gb} showName />
            <CountryFlag countryCode="de" countryName={COUNTRY_NAMES.de} showName />
          </div>

          <div className="space-y-4">
            <div>
              <Text variant="label" size="sm" weight="medium" className="mb-2">
                Processing Queue
              </Text>
              <ProgressBar value={67} size="md" color="blue" showLabel animated />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default AtomsDemo;
