// components/NeutralInput.js
import React from 'react';
import TextField from '@mui/material/TextField';

/**
 * NeutralInput Component
 * Reusable TextField variant with neutral focus styling (gray border and label on focus)
 * Ideal for CRUD forms (Add/Edit Stock, Warehouse, Product) in Eco-Green theme project.
 */

export default function NeutralInput(props) {
  return (
    <TextField
      {...props}
      variant={props.variant || 'outlined'}
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#ccc', // default border
            transition: 'border-color 0.25s ease',
          },
          '&:hover fieldset': {
            borderColor: '#9e9e9e', // hover border
          },
          '&.Mui-focused fieldset': {
            borderColor: '#607D8B', // 🩶 neutral blue-gray focus border
            boxShadow: '0 0 4px rgba(96, 125, 139, 0.4)', // subtle glow all-around
          },
        },
        '& .MuiInputLabel-root': {
          color: '#777', // default label color
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#607D8B', // label color when focused
        },
        '& .MuiInputBase-input': {
          color: '#333', // text color inside input
        },
      }}
    />
  );
}
