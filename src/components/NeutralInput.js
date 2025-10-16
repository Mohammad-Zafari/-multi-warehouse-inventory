import React from 'react';
import TextField from '@mui/material/TextField';

export default function NeutralInput(props) {
  return (
    <TextField
      {...props}
      variant={props.variant || 'outlined'}
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#ccc', 
            transition: 'border-color 0.25s ease',
          },
          '&:hover fieldset': {
            borderColor: '#9e9e9e',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#607D8B', 
            boxShadow: '0 0 4px rgba(96, 125, 139, 0.4)', 
          },
        },
        '& .MuiInputLabel-root': {
          color: '#777', 
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#607D8B',
        },
        '& .MuiInputBase-input': {
          color: '#333', 
        },
      }}
    />
  );
}
