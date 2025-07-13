import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/atoms/Avatar";
import PageMeta from "@/components/common/PageMeta";
import { cn } from "@/utils";

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-red-500',
};

const AvatarWithStatus = ({
  src,
  fallback,
  alt,
  status,
  size = 'md',
}: {
  src: string;
  fallback: string;
  alt: string;
  status?: keyof typeof statusColors;
  size?: 'sm' | 'md' | 'lg';
}) => (
  <div className="relative inline-block">
    <Avatar size={size}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
    {status && (
      <span
        className={cn(
          'absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white',
          statusColors[status]
        )}
      />
    )}
  </div>
);

export default function Avatars() {
  return (
    <>
      <PageMeta
        title="Avatars | TailAdmin - React Admin Dashboard"
        description="Demonstration of the Avatar component in different sizes and states."
      />
      <PageBreadcrumb pageTitle="Avatars" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Default Avatar">
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Avatar size="sm">
              <AvatarImage src="/images/user/user-01.jpg" alt="User" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar size="md">
              <AvatarImage src="/images/user/user-01.jpg" alt="User" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarImage src="/images/user/user-01.jpg" alt="User" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
             <Avatar size="lg">
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
          </div>
        </ComponentCard>
        <ComponentCard title="Avatar with Status Indicator">
          <div className="flex flex-wrap items-center justify-center gap-5">
            <AvatarWithStatus
              src="/images/user/user-01.jpg"
              alt="User"
              fallback="U1"
              size="sm"
              status="online"
            />
            <AvatarWithStatus
              src="/images/user/user-01.jpg"
              alt="User"
              fallback="U1"
              size="md"
              status="offline"
            />
            <AvatarWithStatus
              src="/images/user/user-01.jpg"
              alt="User"
              fallback="U1"
              size="lg"
              status="busy"
            />
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
