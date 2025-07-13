import React from 'react';

interface CountryFlagProps {
  countryCode: string;
  countryName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
  variant?: 'rounded' | 'square' | 'circle';
}

const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  countryName,
  size = 'md',
  showName = false,
  className = '',
  variant = 'rounded',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6',
    xl: 'w-10 h-8',
  };

  const variantClasses = {
    rounded: 'rounded-sm',
    square: 'rounded-none',
    circle: 'rounded-full',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  // Fallback for when flag image is not available
  const renderFallback = () => (
    <div
      className={`${sizeClasses[size]} ${variantClasses[variant]} bg-gray-300 dark:bg-gray-600 flex items-center justify-center`}
    >
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
        {countryCode.toUpperCase()}
      </span>
    </div>
  );

  const flagUrl = `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <img
          src={flagUrl}
          alt={`${countryName || countryCode} flag`}
          className={`${sizeClasses[size]} ${variantClasses[variant]} object-cover shadow-sm`}
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
        <div
          className={`${sizeClasses[size]} ${variantClasses[variant]} bg-gray-300 dark:bg-gray-600 items-center justify-center hidden`}
        >
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {countryCode.toUpperCase()}
          </span>
        </div>
      </div>

      {showName && (countryName || countryCode) && (
        <span
          className={`ml-2 font-medium text-gray-700 dark:text-gray-300 ${textSizeClasses[size]}`}
        >
          {countryName || countryCode.toUpperCase()}
        </span>
      )}
    </div>
  );
};

// Common country codes and names mapping
export const COUNTRY_NAMES: Record<string, string> = {
  us: 'United States',
  ca: 'Canada',
  gb: 'United Kingdom',
  de: 'Germany',
  fr: 'France',
  it: 'Italy',
  es: 'Spain',
  nl: 'Netherlands',
  be: 'Belgium',
  ch: 'Switzerland',
  at: 'Austria',
  se: 'Sweden',
  no: 'Norway',
  dk: 'Denmark',
  fi: 'Finland',
  pl: 'Poland',
  cz: 'Czech Republic',
  hu: 'Hungary',
  ro: 'Romania',
  bg: 'Bulgaria',
  hr: 'Croatia',
  si: 'Slovenia',
  sk: 'Slovakia',
  lt: 'Lithuania',
  lv: 'Latvia',
  ee: 'Estonia',
  ru: 'Russia',
  ua: 'Ukraine',
  by: 'Belarus',
  jp: 'Japan',
  kr: 'South Korea',
  cn: 'China',
  in: 'India',
  au: 'Australia',
  nz: 'New Zealand',
  br: 'Brazil',
  ar: 'Argentina',
  mx: 'Mexico',
  za: 'South Africa',
  eg: 'Egypt',
  ng: 'Nigeria',
  ke: 'Kenya',
  ma: 'Morocco',
  dz: 'Algeria',
  tn: 'Tunisia',
  ly: 'Libya',
  sd: 'Sudan',
  et: 'Ethiopia',
  gh: 'Ghana',
  ci: "Côte d'Ivoire",
  sn: 'Senegal',
  ml: 'Mali',
  bf: 'Burkina Faso',
  ne: 'Niger',
  td: 'Chad',
  cf: 'Central African Republic',
  cm: 'Cameroon',
  ga: 'Gabon',
  cg: 'Congo',
  cd: 'Democratic Republic of the Congo',
  ao: 'Angola',
  zm: 'Zambia',
  zw: 'Zimbabwe',
  bw: 'Botswana',
  na: 'Namibia',
  sz: 'Eswatini',
  ls: 'Lesotho',
  mw: 'Malawi',
  mz: 'Mozambique',
  mg: 'Madagascar',
  mu: 'Mauritius',
  sc: 'Seychelles',
  km: 'Comoros',
  dj: 'Djibouti',
  so: 'Somalia',
  er: 'Eritrea',
  ug: 'Uganda',
  tz: 'Tanzania',
  rw: 'Rwanda',
  bi: 'Burundi',
  ss: 'South Sudan',
};

export default CountryFlag;
