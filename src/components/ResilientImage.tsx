import { useState } from 'react';
import { CarFront } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'Garant Service',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#191C21] via-[#111317] to-[#08090B] text-[#96989D] p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <CarFront className="w-8 h-8 text-[#B69A67]" strokeWidth={1.5} />
        <span className="text-xs tracking-wider text-[#F1F0EC]/80 text-center">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
