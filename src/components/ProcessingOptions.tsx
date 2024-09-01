import React from 'react';

interface ProcessingOptionsProps {
  onOptionSelect: (option: string) => void;
}

const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({ onOptionSelect }) => {
  const options = [
    { id: 'format', label: 'Change Video Format' },
    { id: 'trim', label: 'Trim Video' },
    { id: 'speed', label: 'Change Playback Speed' },
    { id: 'watermark', label: 'Add Watermark' },
    { id: 'all', label: 'Process with All Options' },
    { id: 'enhance', label: 'Enhance Video' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onOptionSelect(option.id)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ProcessingOptions;