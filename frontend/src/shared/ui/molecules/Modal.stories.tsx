import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/shared/ui/atoms/Button";
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
} from "./Modal";

const meta: Meta<typeof ModalContent> = {
  title: 'Molecules/Modal',
  component: ModalContent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, { args }) => (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="outline">Open Modal ({args.size})</Button>
        </ModalTrigger>
        <Story />
      </Modal>
    ),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ModalContent>;

const FullModalContent = () => (
  <>
    <ModalHeader>
      <ModalTitle>Edit Profile</ModalTitle>
      <ModalDescription>
        Make changes to your profile here. Click save when you're done.
      </ModalDescription>
    </ModalHeader>
    <div className="grid gap-4 py-4 px-6">
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="name" className="text-right">
          Name
        </label>
        <input id="name" defaultValue="John Doe" className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="username" className="text-right">
          Username
        </label>
        <input id="username" defaultValue="@johndoe" className="col-span-3" />
      </div>
    </div>
    <ModalFooter>
      <ModalClose asChild>
        <Button variant="ghost">Cancel</Button>
      </ModalClose>
      <Button type="submit">Save changes</Button>
    </ModalFooter>
  </>
);

export const Default: Story = {
  args: {
    size: 'md',
    children: <FullModalContent />,
  },
};

export const Small: Story = {
  name: 'Size: Small (sm)',
  args: {
    size: 'sm',
    children: <FullModalContent />,
  },
};

export const Large: Story = {
  name: 'Size: Large (lg)',
  args: {
    size: 'lg',
    children: <FullModalContent />,
  },
};

export const ExtraLarge: Story = {
  name: 'Size: Extra Large (xl)',
  args: {
    size: 'xl',
    children: <FullModalContent />,
  },
};

export const ScrollingContent: Story = {
  name: 'Feature: Scrolling Content',
  decorators: [
    (Story) => (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="outline">Open Scrolling Modal</Button>
        </ModalTrigger>
        <Story />
      </Modal>
    ),
  ],
  args: {
    size: 'md',
    children: (
      <>
        <ModalHeader>
          <ModalTitle>Terms of Service</ModalTitle>
          <ModalDescription>
            Please read our terms of service carefully before proceeding.
          </ModalDescription>
        </ModalHeader>
        <div className="max-h-[400px] overflow-y-auto px-6">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
            risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
            nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas
            ligula massa, varius a, semper congue, euismod non, mi. Proin
            porttitor, orci nec nonummy molestie, enim est eleifend mi, non
            fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa,
            scelerisque vitae, consequat in, pretium a, enim. Pellentesque

            congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum
            bibendum augue. Praesent egestas leo in pede. Praesent blandit odio
            eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum
            ante ipsum primis in faucibus orci luctus et ultrices posuere
            cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque
            fermentum. Maecenas adipiscing ante non diam.
          </p>
          <p className="mt-4">
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
          <p className="mt-4">
            Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam
            varius, turpis et commodo pharetra, est eros bibendum elit, nec
            luctus magna felis sollicitudin mauris. Integer in mauris eu nibh
            euismod gravida. Duis ac tellus et risus vulputate vehicula.
          </p>
        </div>
        <ModalFooter>
          <ModalClose asChild>
            <Button>I Accept</Button>
          </ModalClose>
        </ModalFooter>
      </>
    ),
  },
};

export const CompositionOnlyContent: Story = {
  name: 'Composition: Content Only',
   decorators: [
    (Story) => (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="outline">Open Simple Modal</Button>
        </ModalTrigger>
        <Story />
      </Modal>
    ),
  ],
  args: {
    size: 'sm',
    children: (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Simple Modal</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This modal has no header or footer.
        </p>
      </div>
    ),
  },
}; 