'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress, Typography } from '@mui/material';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });

const generateOrangePalette = (count) => {
  const baseHue = 30; 
  const minLight = 35;
  const maxLight = 55;
  const saturation = 80;
  return Array.from({ length: count }).map((_, i) => {
    const lightness =
      maxLight - (i * (maxLight - minLight)) / Math.max(count - 1, 1);
    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  });
};

export default function CategoryBarChart({ data = [] }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  if (!isClient)
    return (
      <Box
        sx={{
          height: 280,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress color="warning" />
      </Box>
    );

  if (!data.length)
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
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey="category" tick={{ fill: '#555' }} />
        <YAxis tick={{ fill: '#555' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(5px)',
          }}
          formatter={(v) => [`${v} units`, 'Total Quantity']}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />

        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bb7610ff" />
            <stop offset="100%" stopColor="#ed9223ff" />
          </linearGradient>
        </defs>

        <Bar
          dataKey="totalQuantity"
          name="Total Quantity"
          fill="url(#barGradient)"
          radius={[6, 6, 0, 0]}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
