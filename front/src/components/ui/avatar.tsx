import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, className }) => {
  return <img src={src} alt={alt} className={className} />;
};

export const AvatarFallback: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={className}>Fallback</div>;
};

export const AvatarImage: React.FC<AvatarProps> = ({ src, alt, className }) => {
  return <img src={src} alt={alt} className={className} />;
};
