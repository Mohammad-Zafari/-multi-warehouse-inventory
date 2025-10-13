// ~/components/charts/WarehousePieChart.js
// Eco-Friendly "Orange Hue 30" Pie Chart Component
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

function WarehousePieChart({ data }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const generateOrangePalette = (count) => {
    const hue = 30;
    const sat = 75;
    const minL = 30;
    const maxL = 60;
    return Array.from({ length: count }, (_, i) => {
      const light = maxL - (i * (maxL - minL)) / Math.max(count - 1, 1);
      return `hsl(${hue}, ${sat}%, ${light}%)`;
    });
  };

  if (!isClient)
    return (
      <Box
        sx={{
          height: 280,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    );

  if (!data?.length)
    return (
      <Box
        sx={{
          height: 280,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );

  const colors = generateOrangePalette(data.length);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={95}
          innerRadius={45}
          isAnimationActive
          animationDuration={800}
        >
          {data.map((_, i) => (
            <Cell
              key={`slice-${i}`}
              fill={colors[i]}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 8,
            border: '1px solid #ccc',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
          formatter={(v) => `${v.toLocaleString('en-US')} units`}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ✅ Dynamic export for SSR safety
export default dynamic(() => Promise.resolve(WarehousePieChart), { ssr: false });
