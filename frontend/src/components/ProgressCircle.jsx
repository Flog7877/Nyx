import React, { memo } from 'react';

const ProgressCircle = memo(({ progress, size = 200, strokeWidth = 8, color = "#BB86FC" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#2C2C2C"
        strokeWidth={strokeWidth}
        fill="none"
        className="dynCirc"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
            transition: 'stroke-dashoffset 1s linear',
          }}
      />
    </svg>
  );
});

export default ProgressCircle;