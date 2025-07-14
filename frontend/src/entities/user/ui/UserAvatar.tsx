/**
 * UserAvatar component for user entity
 * Displays user avatar with fallback to initials
 */

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/atoms/Avatar";
import { User, getUserDisplayName, getUserInitials } from "../model";

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className, 
  showTooltip = false 
}) => {
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  
  // Generate avatar URL if user has one (you can customize this logic)
  const avatarUrl = user.id ? `/api/users/${user.id}/avatar` : undefined;

  const avatarElement = (
    <Avatar size={size} className={className}>
      <AvatarImage src={avatarUrl} alt={displayName} />
      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (showTooltip) {
    return (
      <div className="group relative">
        {avatarElement}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
          {displayName}
        </div>
      </div>
    );
  }

  return avatarElement;
};

export default UserAvatar;
