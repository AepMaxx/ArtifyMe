import React from 'react';
import './RainbowTitle.css';

interface RainbowTitleProps {
  titleText: string;
}

const RainbowTitle: React.FC<RainbowTitleProps> = ({ titleText }) => {
  return (
    <h1 className="rainbow-title">
      {titleText}
    </h1>
  );
};

export default RainbowTitle;
