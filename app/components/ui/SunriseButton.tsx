import { FC, ReactNode } from 'react';
import Link from 'next/link';

interface AnimatedButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  isExternal?: boolean;
}

const AnimatedButton: FC<AnimatedButtonProps> = ({ 
  href, 
  children, 
  className = '',
  isExternal = false
}) => {
  const buttonClasses = `
    group relative 
    inline-flex items-center 
    rounded-full 
    bg-stone-900 
    font-medium 
    text-white 
    overflow-hidden
    transition-all duration-300 ease-out
    hover:scale-105
    focus-visible:outline-none 
    focus-visible:ring-2 
    focus-visible:ring-ring 
    focus-visible:ring-offset-2 
    active:scale-100 
    disabled:pointer-events-none 
    disabled:opacity-50
    shadow-lg
    hover:shadow-[0_0px_60px_-15px] hover:shadow-yellow-500
    ${className}
  `;

  const content = (
    <>
      <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-300 ease-out group-hover:-translate-y-full">
        {children}
      </span>

      <span className="absolute left-1/2 z-10 inline-flex -translate-x-1/2 translate-y-10 items-center justify-center gap-2 whitespace-nowrap transition-all duration-300 ease-out group-hover:translate-y-0">
        {children}
      </span>

      <span className="absolute bottom-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 translate-y-full rounded-full bg-[#FFBB39] transition-all duration-300 ease-out group-hover:h-full group-hover:w-full group-hover:translate-y-0" />

      <div className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl" />
        <div className="absolute inset-1 rounded-full bg-yellow-500/10 blur-2xl" />
        <div className="absolute inset-2 rounded-full bg-yellow-500/5 blur-3xl" />
      </div>
    </>
  );

  return (
    <div className="flex w-full justify-center gap-4">
      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses}
        >
          {content}
        </a>
      ) : (
        <Link href={href} className={buttonClasses}>
          {content}
        </Link>
      )}
    </div>
  );
};

export default AnimatedButton;