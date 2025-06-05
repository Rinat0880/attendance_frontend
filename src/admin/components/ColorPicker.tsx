import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, Typography, TextField, DialogActions, FormHelperText } from '@mui/material';

interface HSV {
  h: number;
  s: number;
  v: number;
}

const ColorPickerButton: React.FC<{
  color: string;
  label: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}> = ({ color, label, onChange, disabled = false }) => {
  const hexToRgb = useCallback((hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  }, []);

  const rgbToHsv = useCallback((r: number, g: number, b: number): HSV => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const v = max;

    if (diff !== 0) {
      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return { h, s: s * 100, v: v * 100 };
  }, []);

  const hsvToRgb = useCallback((h: number, s: number, v: number): number[] => {
    s = s / 100;
    v = v / 100;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    let r = 0, g = 0, b = 0;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  }, []);

  const rgbToHex = useCallback((r: number, g: number, b: number): string => 
    `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`,
  []);

  const hexToHsv = useCallback((hex: string): HSV => {
    const rgb = hexToRgb(hex);
    return rgbToHsv(rgb[0], rgb[1], rgb[2]);
  }, [hexToRgb, rgbToHsv]);

  // Function to validate hex color code
  const isValidHexColor = useCallback((hex: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }, []);

  const [open, setOpen] = useState(false);
  const [localColor, setLocalColor] = useState(color);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(color));
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingSV, setIsDraggingSV] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState(color);

  const hueRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalColor(color);
    setTempColor(color);
    setHsv(hexToHsv(color));
  }, [color, hexToHsv, setLocalColor, setHsv]);

  // Reset errors and temp color when dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
      setTempColor(localColor);
    }
  }, [open, localColor]);

  const updateHue = useCallback((event: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return;
  
    const rect = hueRef.current.getBoundingClientRect();
    let h = (event.clientX - rect.left) / rect.width;
    h = Math.max(0, Math.min(1, h));
  
    setHsv((prev) => {
      const newHsv = { ...prev, h };
      const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
      setTempColor(hex);
      setError(null);
      return newHsv;
    });
  }, [hsvToRgb, rgbToHex]);
  
  const updateSV = useCallback((event: MouseEvent | React.MouseEvent) => {
    if (!svRef.current) return;
  
    const rect = svRef.current.getBoundingClientRect();
    let s = ((event.clientX - rect.left) / rect.width) * 100;
    let v = (1 - (event.clientY - rect.top) / rect.height) * 100;
  
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
  
    setHsv((prev) => {
      const newHsv = { ...prev, s, v };
      const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
      setTempColor(hex);
      setError(null);
      return newHsv;
    });
  }, [hsvToRgb, rgbToHex]);
  
  const handleMouseDown = (event: React.MouseEvent, type: 'hue' | 'sv') => {
    if (type === 'hue') {
      setIsDraggingHue(true);
      updateHue(event);
    } else {
      setIsDraggingSV(true);
      updateSV(event);
    }
  };

  const handleMouseUp = useCallback(() => {
    setIsDraggingHue(false);
    setIsDraggingSV(false);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDraggingHue) {
      updateHue(event);
    }
    if (isDraggingSV) {
      updateSV(event);
    }
  }, [isDraggingHue, isDraggingSV, updateHue, updateSV]);
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle closing dialog
  const handleClose = () => {
    if (error) {
      return; // Don't close if there's an error
    }
    
    // Apply changes
    setLocalColor(tempColor);
    onChange(tempColor);
    setOpen(false);
  };

  // Handle canceling/dismissing changes
  const handleCancel = () => {
    setTempColor(localColor);
    setOpen(false);
  };

  // Validate input and handle hex code changes
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTempColor(newValue);
    
    // Check if it's empty or just a hash
    if (newValue === '' || newValue === '#') {
      setError('Please enter a color hex code');
      return;
    }
    
    // Check if format is valid
    if (!newValue.startsWith('#')) {
      setTempColor('#' + newValue);
      if (!/#[0-9A-Fa-f]{6}$/.test('#' + newValue)) {
        setError('Invalid format. Use #RRGGBB');
      } else {
        setError(null);
        const newHexColor = '#' + newValue;
        setHsv(hexToHsv(newHexColor));
      }
      return;
    }
    
    // Validate format
    if (newValue.length > 7) {
      setError('Hex code cannot be longer than 7 characters (#RRGGBB)');
    } else if (newValue.length === 7) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        setError('Invalid characters. Use only 0-9, A-F');
      } else {
        setError(null);
        setHsv(hexToHsv(newValue));
      }
    } else {
      setError('Incomplete hex code. Format: #RRGGBB');
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={disabled}
        sx={{
          minWidth: '200px',
          justifyContent: 'space-between',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography>{label}</Typography>
        <Box
          sx={{
            width: 24,
            height: 24,
            backgroundColor: localColor,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0.5,
          }}
        />
      </Button>

      <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
        <DialogTitle>Change Color</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Box sx={{ width: '100%', p: 1 }}>
            {/* SV Picker */}
            <Box
              ref={svRef}
              onMouseDown={(e) => handleMouseDown(e, 'sv')}
              sx={{
                width: '100%',
                paddingTop: '100%',
                position: 'relative',
                marginBottom: 1,
                borderRadius: 1,
                cursor: 'crosshair',
                background: `
                  linear-gradient(to top, #000, transparent),
                  linear-gradient(to right, #fff, transparent),
                  linear-gradient(to right, 
                    hsl(${hsv.h * 360}deg, 100%, 50%),
                    hsl(${hsv.h * 360}deg, 100%, 50%)
                  )
                `
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  border: '2px solid white',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                }}
              />
            </Box>

            {/* Hue Slider */}
            <Box
              ref={hueRef}
              onMouseDown={(e) => handleMouseDown(e, 'hue')}
              sx={{
                width: '100%',
                height: 20,
                position: 'relative',
                borderRadius: 1,
                cursor: 'ew-resize',
                background: `linear-gradient(
                  to right,
                  #f00 0%,
                  #ff0 17%,
                  #0f0 33%,
                  #0ff 50%,
                  #00f 67%,
                  #f0f 83%,
                  #f00 100%
                )`
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${hsv.h * 100}%`,
                  top: '50%',
                  width: 4,
                  height: '140%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'white',
                  borderRadius: 4,
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                }}
              />
            </Box>

            {/* Current Color Display and HEX Input */}
            <Box sx={{ display: 'flex', gap: 2, marginTop: 1 }}>
              <Box
                sx={{
                  width: '100%',
                  height: 40,
                  backgroundColor: isValidHexColor(tempColor) ? tempColor : localColor,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  flex: 1,
                }}
              />
              <TextField
                value={tempColor}
                size="small"
                onChange={handleHexChange}
                error={!!error}
                sx={{ width: '110px' }}
                inputProps={{
                  style: { textTransform: 'uppercase' }
                }}
              />
            </Box>
            
            {error && (
              <FormHelperText error sx={{ mt: 0.5 }}>
                {error}
              </FormHelperText>
            )}
            
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
              Format must be #RRGGBB (e.g., #FF0000)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pt: 0, pb: 2 }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button 
            onClick={handleClose}
            disabled={!!error}
            variant="contained"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ColorPickerButton;