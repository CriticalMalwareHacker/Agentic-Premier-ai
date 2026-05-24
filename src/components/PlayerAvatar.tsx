/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface PlayerAvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

export function PlayerAvatar({ imageUrl, name, size = "sm" }: PlayerAvatarProps) {
  const initials = name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-11 h-11 text-xs",
    lg: "w-16 h-16 text-lg",
  };

  const imageSizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${imageSizeClasses[size]} rounded-full object-cover border border-[#1e293b]`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[#273647] border border-[#1e293b] flex items-center justify-center text-[#bacbb9] font-mono tracking-wider shrink-0 select-none`}
    >
      {initials}
    </div>
  );
}
