'use client';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div
      className="p-8 rounded-3xl text-center transition-all duration-300 hover:transform hover:scale-[1.02]"
      style={{
        background: 'rgba(139, 94, 23, 0.85)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Icon (optional) */}
      {icon && (
        <div className="mb-4 flex justify-center">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3
        className="text-white text-2xl font-bold mb-6"
        style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-amber-100/90 text-sm leading-relaxed text-justify">
        {description}
      </p>
    </div>
  );
}
