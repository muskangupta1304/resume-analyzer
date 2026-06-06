import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = false, delay = 0, onClick }) => {
  const cardClass = `glass-panel rounded-2xl p-6 relative overflow-hidden ${
    hoverEffect ? 'glass-panel-hover cursor-pointer' : ''
  } ${className}`;

  if (delay > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay, ease: 'easeOut' }}
        className={cardClass}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClass} onClick={onClick}>
      {children}
    </div>
  );
};

export default GlassCard;
