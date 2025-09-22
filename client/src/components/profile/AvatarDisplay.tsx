import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarConfig } from '@/hooks/api/use-avatar';

interface AvatarDisplayProps {
  avatar: AvatarConfig;
  className?: string;
}

const vitalityStyles = {
  1: { posture: 'rotate(3deg)', skinFilter: 'saturate(0.6) brightness(0.9)', expression: 'sad', glow: 'none' },
  2: { posture: 'rotate(1deg)', skinFilter: 'saturate(0.8) brightness(0.95)', expression: 'neutral', glow: 'none' },
  3: { posture: 'rotate(0deg)', skinFilter: 'saturate(1) brightness(1)', expression: 'neutral', glow: 'none' },
  4: { posture: 'rotate(-1deg)', skinFilter: 'saturate(1.1) brightness(1.05)', expression: 'happy', glow: 'none' },
  5: { posture: 'rotate(-2deg)', skinFilter: 'saturate(1.2) brightness(1.1)', expression: 'happy', glow: 'drop-shadow(0 0 8px rgba(255, 255, 180, 0.7))' },
};

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatar, className }) => {
  const styles = vitalityStyles[avatar.vitality_level as keyof typeof vitalityStyles] || vitalityStyles[3];

  const renderExpression = () => {
    if (styles.expression === 'happy') {
      return (
        <>
          <path d="M 18 28 Q 25 34 32 28" stroke="black" strokeWidth="1" fill="none" />
          <circle cx="20" cy="24" r="1.5" fill="black" />
          <circle cx="30" cy="24" r="1.5" fill="black" />
        </>
      );
    }
    if (styles.expression === 'sad') {
      return (
        <>
          <path d="M 18 32 Q 25 26 32 32" stroke="black" strokeWidth="1" fill="none" />
          <circle cx="20" cy="24" r="1" fill="black" />
          <circle cx="30"cy="24" r="1" fill="black" />
        </>
      );
    }
    // Neutral
    return (
      <>
        <line x1="18" y1="30" x2="32" y2="30" stroke="black" strokeWidth="1" />
        <circle cx="20" cy="24" r="1.2" fill="black" />
        <circle cx="30" cy="24" r="1.2" fill="black" />
      </>
    );
  };

  const renderHair = () => {
    if (avatar.hair_style === 'long') {
      return <path d="M 10 10 C 10 0, 40 0, 40 10 L 45 40 L 5 40 Z" fill={avatar.hair_color} />;
    }
    if (avatar.hair_style === 'ponytail') {
        return (
            <>
                <path d="M 10 10 C 10 0, 40 0, 40 10 L 40 25 L 10 25 Z" fill={avatar.hair_color} />
                <path d="M 35 20 C 50 25, 50 45, 35 50 L 30 35 Z" fill={avatar.hair_color} />
            </>
        );
    }
    // short
    return <path d="M 10 10 C 10 0, 40 0, 40 10 L 40 20 C 30 15, 20 15, 10 20 Z" fill={avatar.hair_color} />;
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <AnimatePresence>
        <motion.svg
          key={avatar.vitality_level}
          viewBox="0 0 50 80"
          className="w-full h-full"
          style={{ filter: styles.glow, transition: 'filter 0.5s ease' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <g transform={styles.posture}>
            {/* Legs */}
            <rect x="15" y="60" width="8" height="20" fill={avatar.pants_color} />
            <rect x="27" y="60" width="8" height="20" fill={avatar.pants_color} />

            {/* Body */}
            <rect x="12" y="35" width="26" height="25" fill={avatar.shirt_color} />

            {/* Head */}
            <g style={{ filter: styles.skinFilter, transition: 'filter 0.5s ease' }}>
              <circle cx="25" cy="25" r="15" fill={avatar.skin_tone} />
            </g>

            {/* Hair */}
            {renderHair()}

            {/* Face */}
            {renderExpression()}

            {/* Accessory */}
            {avatar.accessory === 'glasses' && (
              <g>
                <circle cx="20" cy="24" r="4" stroke="black" strokeWidth="0.5" fill="none" />
                <circle cx="30" cy="24" r="4" stroke="black" strokeWidth="0.5" fill="none" />
                <line x1="24" y1="24" x2="26" y2="24" stroke="black" strokeWidth="0.5" />
              </g>
            )}
          </g>
        </motion.svg>
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 text-center p-2">
        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">Vitalidad: Nivel {avatar.vitality_level}</span>
      </div>
    </div>
  );
};

export default AvatarDisplay;
