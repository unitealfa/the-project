import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className }) => {
  return <h3 className={className}>{children}</h3>;
};

export const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};
