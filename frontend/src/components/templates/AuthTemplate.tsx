import React from 'react';
import { Card } from '../atoms';
import { Typography } from '../atoms/Typography';

interface AuthTemplateProps {
  /** Main content (login/register form) */
  children: React.ReactNode;
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Logo component */
  logo?: React.ReactNode;
  /** Background image URL */
  backgroundImage?: string;
  /** Background color */
  backgroundColor?: string;
  /** Layout variant */
  variant?: 'split' | 'centered' | 'minimal';
  /** Additional features */
  features?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Social login buttons */
  socialButtons?: React.ReactNode;
  /** Additional links */
  links?: React.ReactNode;
  /** Custom branding */
  branding?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Custom container className */
  containerClassName?: string;
  /** Custom card className */
  cardClassName?: string;
}

const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  title,
  subtitle,
  logo,
  backgroundImage,
  backgroundColor = 'bg-gray-50',
  variant = 'centered',
  features,
  footer,
  socialButtons,
  links,
  branding,
  loading = false,
  error,
  success,
  containerClassName = '',
  cardClassName = '',
}) => {
  const getContainerClasses = () => {
    const baseClasses = 'min-h-screen flex items-center justify-center';

    switch (variant) {
      case 'split':
        return `${baseClasses} lg:grid lg:grid-cols-2`;
      case 'centered':
        return `${baseClasses} py-12 px-4 sm:px-6 lg:px-8`;
      case 'minimal':
        return `${baseClasses} py-8 px-4`;
      default:
        return `${baseClasses} py-12 px-4 sm:px-6 lg:px-8`;
    }
  };

  const getCardClasses = () => {
    const baseClasses = 'w-full max-w-md space-y-8';

    switch (variant) {
      case 'split':
        return `${baseClasses} max-w-lg`;
      case 'centered':
        return `${baseClasses} max-w-md`;
      case 'minimal':
        return `${baseClasses} max-w-sm`;
      default:
        return `${baseClasses} max-w-md`;
    }
  };

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <div
      className={`${getContainerClasses()} ${backgroundColor} ${containerClassName}`}
      style={backgroundStyle}
    >
      {/* Split layout side panel */}
      {variant === 'split' && features && (
        <div className="hidden lg:block relative">
          <div className="absolute inset-0 bg-brand-500 bg-opacity-10" />
          <div className="relative z-10 flex items-center justify-center h-full p-12">
            {features}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`${getCardClasses()} ${cardClassName}`}>
        {/* Logo and branding */}
        {(logo || branding) && (
          <div className="text-center">
            {logo && <div className="mb-4">{logo}</div>}
            {branding && <div className="mb-6">{branding}</div>}
          </div>
        )}

        {/* Title and subtitle */}
        <div className="text-center">
          {title && (
            <Typography variant="h2" size="2xl" weight="bold" className="mb-2">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="p" size="sm" color="muted" className="mb-8">
              {subtitle}
            </Typography>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <Typography variant="p" size="sm" className="text-red-700">
              {error}
            </Typography>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <Typography variant="p" size="sm" className="text-green-700">
              {success}
            </Typography>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        )}

        {/* Main form content */}
        <Card variant="default" className="p-8 shadow-lg">
          {children}
        </Card>

        {/* Social login buttons */}
        {socialButtons && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6">{socialButtons}</div>
          </div>
        )}

        {/* Additional links */}
        {links && <div className="mt-6 text-center">{links}</div>}

        {/* Footer */}
        {footer && <div className="mt-8 text-center">{footer}</div>}
      </div>
    </div>
  );
};

export default AuthTemplate;
