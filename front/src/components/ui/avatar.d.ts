export interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
}

export declare const Avatar: React.FC<AvatarProps>;
export declare const AvatarFallback: React.FC<{ className?: string }>;
export declare const AvatarImage: React.FC<AvatarProps>;
