import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { Box, Typography, Paper, Snackbar, CircularProgress, IconButton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import { createByQRCode } from '../../utils/libs/axios.ts';

interface ServerResponse {
  error: string | null;
  data: {
    id: number;
    employee_id: string;
    full_name: string;
    work_day: string;
    come_time: string;
  } | null;
  message: string;
  status: boolean;
}

// Debug logger utility for Safari debugging
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[QR Scanner ${timestamp}] ${message}`, data || '');
  
  // Show debug info on screen for Safari debugging
  if (typeof window !== 'undefined' && window.location.search.includes('debug=true')) {
    const debugDiv = document.getElementById('debug-info') || (() => {
      const div = document.createElement('div');
      div.id = 'debug-info';
      div.style.cssText = `
        position: fixed; 
        top: 10px; 
        left: 10px; 
        background: rgba(0,0,0,0.8); 
        color: white; 
        padding: 10px; 
        font-size: 12px; 
        z-index: 9999; 
        max-width: 300px; 
        max-height: 200px; 
        overflow-y: auto;
      `;
      document.body.appendChild(div);
      return div;
    })();
    
    debugDiv.innerHTML = `${timestamp}: ${message}<br>` + debugDiv.innerHTML;
  }
};

// Utility to detect mobile devices
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Utility to detect tablet devices
const isTabletDevice = () => {
  return /iPad|Android(?=.*Tablet)|Tablet/i.test(navigator.userAgent) || 
         (window.innerWidth >= 768 && window.innerWidth <= 1366); // Extended range for iPad Pro
};

const QRCodeScanner: React.FC = () => {
  const [scanState, setScanState] = useState({
    result: null as string | null,
    isScanning: true,
    isProcessing: false,
    serverMessage: '',
    employeeName: '',
    messageType: null as 'check-in' | 'check-out' | 'error' | null
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: ''
  });

  // Camera facing mode state
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const webcamRef = useRef<Webcam | null>(null);
  const scanningInterval = useRef<NodeJS.Timeout>();
  const resetTimeout = useRef<NodeJS.Timeout>();
  const isProcessingRef = useRef(false); // Prevent race conditions
  const mountedRef = useRef(true); // Track component mount status

  useEffect(() => {
    mountedRef.current = true;
    debugLog('Component mounted', { isMobile: isMobileDevice() });
    
    // Prevent scrolling and zooming on iOS devices
    const preventScrolling = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault(); // Prevent pinch zoom
      }
    };
    
    const preventDefaultScroll = (e: Event) => {
      e.preventDefault();
    };
    
    // Add event listeners to prevent scrolling
    document.addEventListener('touchmove', preventScrolling, { passive: false });
    document.addEventListener('gesturestart', preventDefaultScroll, { passive: false });
    document.addEventListener('gesturechange', preventDefaultScroll, { passive: false });
    document.addEventListener('gestureend', preventDefaultScroll, { passive: false });
    
    // Set body styles to prevent scrolling
    const originalBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
      touchAction: document.body.style.touchAction
    };
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';
    
    // Prevent viewport zooming on iOS
    const viewport = document.querySelector('meta[name="viewport"]');
    let originalViewport = '';
    if (viewport) {
      originalViewport = viewport.getAttribute('content') || '';
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    return () => {
      mountedRef.current = false;
      debugLog('Component unmounting, clearing intervals');
      
      // Clean up intervals and timeouts
      if (scanningInterval.current) {
        clearInterval(scanningInterval.current);
      }
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
      }
      
      // Remove event listeners
      document.removeEventListener('touchmove', preventScrolling);
      document.removeEventListener('gesturestart', preventDefaultScroll);
      document.removeEventListener('gesturechange', preventDefaultScroll);
      document.removeEventListener('gestureend', preventDefaultScroll);
      
      // Restore original body styles
      document.body.style.overflow = originalBodyStyle.overflow;
      document.body.style.position = originalBodyStyle.position;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.height = originalBodyStyle.height;
      document.body.style.touchAction = originalBodyStyle.touchAction;
      
      // Restore original viewport
      if (viewport && originalViewport) {
        viewport.setAttribute('content', originalViewport);
      }
    };
  }, []);

  // Toggle camera function
  const toggleCamera = useCallback(() => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    debugLog('Camera toggled', { from: facingMode, to: newFacingMode });
  }, [facingMode]);

  const processQRCode = useCallback(async (code: string) => {
    // Prevent multiple simultaneous processing
    if (isProcessingRef.current) {
      debugLog('Already processing, skipping duplicate request');
      return;
    }
    
    isProcessingRef.current = true;
    debugLog('Processing QR code', { code: code.substring(0, 20) + '...' });
    
    setScanState(prev => ({ ...prev, isScanning: false, isProcessing: true }));
  
    try {
      const response: ServerResponse = await createByQRCode(code);
      
      if (!mountedRef.current) {
        debugLog('Component unmounted during request, aborting');
        return;
      }
      
      debugLog('Server response received', { 
        status: response.status, 
        message: response.message,
        hasData: !!response.data 
      });
  
      let messageType: 'check-in' | 'check-out' | 'error' | null = null;
  
      if (response.status) {
        // Successful case
        messageType = response.data?.come_time ? 'check-in' : 'check-out';
        debugLog('Success case', { messageType, employeeName: response.data?.full_name });
  
        setScanState(prev => ({
          ...prev,
          result: response.data?.employee_id || '',
          serverMessage: response.message || '', 
          employeeName: response.data?.full_name || '',
          messageType
        }));
        setSnackbar({ 
          open: true, 
          message: `${response.message || ''}` 
        });
      } else {
        // Error case
        debugLog('Error case', { error: response.error });
        setScanState(prev => ({
          ...prev,
          serverMessage: response.error || '不明なエラー',
          messageType: 'error',
          result: null,
          employeeName: ''
        }));
        setSnackbar({ 
          open: true, 
          message: response.error || '不明なエラー' 
        });
      }
    } catch (error) {
      // Network error handling
      const errorMessage = (error instanceof Error && error.message) ? error.message : String(error);
      debugLog('Network error occurred', { error: errorMessage });
      console.error('データ送信エラー:', error);
      
      if (!mountedRef.current) {
        debugLog('Component unmounted during error handling');
        return;
      }
      
      setScanState(prev => ({
        ...prev,
        serverMessage: 'ネットワークエラー。後でもう一度試してください。',
        messageType: 'error',
        result: null,
        employeeName: ''
      }));
      setSnackbar({ 
        open: true, 
        message: 'ネットワークエラー。後でもう一度試してください。'
      });
    } finally {
      isProcessingRef.current = false;
      debugLog('Processing completed, resetting state');
      
      if (mountedRef.current) {
        setScanState(prev => ({ ...prev, isProcessing: false }));
      }
    }
  }, []);

  const videoConstraints = useMemo(() => ({
    facingMode: facingMode, // Use dynamic facing mode
    width: { ideal: 1280 }, 
    height: { ideal: 720 }, 
    aspectRatio: 1, 
  }), [facingMode]);
  
  const capture = useCallback(() => {
    if (!mountedRef.current) {
      debugLog('Component unmounted, skipping capture');
      return;
    }
    
    if (isProcessingRef.current || !scanState.isScanning || !webcamRef.current) {
      debugLog('Skipping capture', { 
        processing: isProcessingRef.current,
        scanning: scanState.isScanning,
        webcamReady: !!webcamRef.current 
      });
      return;
    }

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        debugLog('No image captured from webcam');
        return;
      }

      debugLog('Image captured, processing...');
      
      const image = new Image();
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const sourceWidth = image.width;
          const sourceHeight = image.height;
          
          debugLog('Image loaded', { width: sourceWidth, height: sourceHeight });
          
          // Increased scan area for different devices
          const isMobile = isMobileDevice();
          const isTablet = isTabletDevice();
          let scanAreaMultiplier = 0.4; // Default for desktop
          
          if (isTablet) {
            scanAreaMultiplier = 0.5; // 50% for tablets
          } else if (isMobile) {
            scanAreaMultiplier = 0.6; // 60% for phones
          }
          
          const scanAreaSize = Math.min(sourceWidth, sourceHeight) * scanAreaMultiplier;
          const startX = (sourceWidth - scanAreaSize) / 2;
          const startY = (sourceHeight - scanAreaSize) / 2;
          
          canvas.width = scanAreaSize;
          canvas.height = scanAreaSize;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            debugLog('Failed to get canvas context');
            return;
          }
          
          // Minimal processing for maximum speed
          ctx.drawImage(
            image,
            startX, startY, scanAreaSize, scanAreaSize,
            0, 0, scanAreaSize, scanAreaSize
          );

          const imageData = ctx.getImageData(0, 0, scanAreaSize, scanAreaSize);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            debugLog('QR code detected', { data: code.data.substring(0, 20) + '...' });
            processQRCode(code.data);
          } else {
            // Only log occasionally to avoid spam
            if (Math.random() < 0.01) { // 1% chance to log
              debugLog('No QR code detected in frame');
            }
          }
          
          // Clean up canvas to prevent memory leaks in Safari
          canvas.width = 0;
          canvas.height = 0;
        } catch (error) {
          debugLog('Error processing image', { error: error instanceof Error ? error.message : String(error) });
        }
      };
      
      image.onerror = () => {
        debugLog('Failed to load captured image');
      };
      
      image.src = imageSrc;
    } catch (error) {
      debugLog('Error during capture', { error: error instanceof Error ? error.message : String(error) });
    }
  }, [scanState.isProcessing, scanState.isScanning, processQRCode]);

  useEffect(() => {
    // Clear any existing intervals/timeouts
    if (scanningInterval.current) {
      clearInterval(scanningInterval.current);
      scanningInterval.current = undefined;
    }
    if (resetTimeout.current) {
      clearTimeout(resetTimeout.current);
      resetTimeout.current = undefined;
    }

    if (scanState.isScanning) {
      debugLog('Starting scanning interval');
      scanningInterval.current = setInterval(() => {
        if (mountedRef.current) {
          capture();
        }
      }, 200); // Slightly slower for Safari stability
      
      return () => {
        debugLog('Cleaning up scanning interval');
        if (scanningInterval.current) {
          clearInterval(scanningInterval.current);
          scanningInterval.current = undefined;
        }
      };
    } else {
      debugLog('Setting reset timeout');
      resetTimeout.current = setTimeout(() => {
        if (mountedRef.current) {
          debugLog('Resetting scanner state');
          isProcessingRef.current = false; // Reset processing flag
          setScanState(prev => ({
            ...prev,
            isScanning: true,
            result: null,
            serverMessage: '',
            employeeName: '',
            messageType: null
          }));
        }
      }, 3000);
      
      return () => {
        debugLog('Cleaning up reset timeout');
        if (resetTimeout.current) {
          clearTimeout(resetTimeout.current);
          resetTimeout.current = undefined;
        }
      };
    }
  }, [scanState.isScanning, capture]);

  const messageColor = useMemo(() => {
    switch (scanState.messageType) {
      case 'check-in':
      case 'check-out':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'inherit';
    }
  }, [scanState.messageType]);

  // Dynamic scan area size based on device type
  const scanAreaSize = useMemo(() => {
    const isMobile = isMobileDevice();
    const isTablet = isTabletDevice();
    
    if (isTablet) {
      return '45%'; // Medium size for tablets
    } else if (isMobile) {
      return '60%'; // Larger for phones
    } else {
      return '35%'; // Smaller for desktop
    }
  }, []);

  const scannerStyles = useMemo(() => ({
    container: {
      height: '100vh',
      width: '100vw',
      position: 'relative' as const,
      overflow: 'hidden',
      // Aggressive scroll prevention for iOS
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'transparent',
      // Prevent iOS safari UI changes
      WebkitOverflowScrolling: 'touch',
      // Ensure full viewport usage
      minHeight: '100vh',
      minWidth: '100vw'
    },
    webcam: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    overlay: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: scanAreaSize, // Dynamic size based on device
      aspectRatio: '1 / 1',
      border: '2px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
      zIndex: 1
    },
    cornerTopLeft: {
      position: 'absolute' as const,
      top: -2,
      left: -2,
      width: '25px', // Slightly larger corners for better visibility
      height: '25px',
      borderTop: '4px solid #64B5F6', 
      borderLeft: '4px solid #64B5F6'
    },
    cornerTopRight: {
      position: 'absolute' as const,
      top: -2,
      right: -2,
      width: '25px',
      height: '25px',
      borderTop: '4px solid #64B5F6',
      borderRight: '4px solid #64B5F6'
    },
    cornerBottomLeft: {
      position: 'absolute' as const,
      bottom: -2,
      left: -2,
      width: '25px',
      height: '25px',
      borderBottom: '4px solid #64B5F6',
      borderLeft: '4px solid #64B5F6'
    },
    cornerBottomRight: {
      position: 'absolute' as const,
      bottom: -2,
      right: -2,
      width: '25px',
      height: '25px',
      borderBottom: '4px solid #64B5F6',
      borderRight: '4px solid #64B5F6'
    },
    scanLine: {
      position: 'absolute' as const,
      left: '0',
      width: '100%',
      height: '2px',
      backgroundColor: 'rgba(100, 181, 246, 0.8)', 
      animation: 'scan 2s linear infinite'
    },
    instruction: {
      position: 'absolute' as const,
      bottom: '15%',
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'white',
      textAlign: 'center' as const,
      zIndex: 2,
      width: '90%', // Increased width for mobile
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
    },
    // Camera toggle button styles
    cameraToggle: {
      position: 'absolute' as const,
      top: '20px',
      right: '20px',
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: 'white',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }
    }
  }), [scanAreaSize]);

  const ScanAnimation = useMemo(() => {
    return `
      @keyframes scan {
        0% {
          top: 0;
          opacity: 0.8;
        }
        50% {
          top: 100%;
          opacity: 0.6;
        }
        100% {
          top: 0;
          opacity: 0.8;
        }
      }
    `;
  }, []);

  // Safari debugging info component
  const DebugInfo = useCallback(() => {
    if (!window.location.search.includes('debug=true')) return null;
    
    return (
      <Box sx={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: 2,
        borderRadius: 1,
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '250px'
      }}>
        <Typography variant="caption" display="block">
          Safari Debug Info:
        </Typography>
        <Typography variant="caption" display="block">
          Scanning: {scanState.isScanning ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="caption" display="block">
          Processing: {scanState.isProcessing ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="caption" display="block">
          Webcam Ready: {webcamRef.current ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="caption" display="block">
          Mobile Device: {isMobileDevice() ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="caption" display="block">
          Tablet Device: {isTabletDevice() ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="caption" display="block">
          Camera: {facingMode === 'environment' ? 'Back' : 'Front'}
        </Typography>
        <Typography variant="caption" display="block">
          Scan Area: {scanAreaSize}
        </Typography>
        <Typography variant="caption" display="block">
          User Agent: {navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}
        </Typography>
      </Box>
    );
  }, [scanState.isScanning, scanState.isProcessing, scanAreaSize, facingMode]);

  return (
    <Box sx={{
      ...scannerStyles.container,
      // Force fixed positioning for iPad
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      // Additional iOS specific fixes
      WebkitTransform: 'translate3d(0,0,0)', // Force hardware acceleration
      transform: 'translate3d(0,0,0)'
    }}>
      {scanState.isScanning ? (
        <>
          <style>{ScanAnimation}</style>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={scannerStyles.webcam}
            imageSmoothing={false} // Disable smoothing for better sharpness
            onUserMedia={() => debugLog('Webcam stream started')}
            onUserMediaError={(error) => debugLog('Webcam error', { error })}
          />
          
          {/* Camera Toggle Button */}
          <Tooltip title={facingMode === 'environment' ? 'フロントカメラに切り替え' : 'バックカメラに切り替え'}>
            <IconButton 
              sx={scannerStyles.cameraToggle}
              onClick={toggleCamera}
              size="large"
            >
              <CameraswitchIcon sx={{ fontSize: '2rem' }} />
            </IconButton>
          </Tooltip>
          
          <Box sx={scannerStyles.overlay}>
            <Box sx={scannerStyles.cornerTopLeft} />
            <Box sx={scannerStyles.cornerTopRight} />
            <Box sx={scannerStyles.cornerBottomLeft} />
            <Box sx={scannerStyles.cornerBottomRight} />
            <Box sx={scannerStyles.scanLine} />
          </Box>
          
          <Box sx={scannerStyles.instruction}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              QRコードを枠内に合わせてください
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
               デバイスを20cm以上離してください
            </Typography>
            <Typography variant="body1">
              コードが鮮明に見えるように調整してください
            </Typography>
          </Box>
          
          <DebugInfo />
        </>
      ) : (
        <ResultDisplay
          scanState={scanState}
          messageColor={messageColor}
        />
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
};

const ResultDisplay: React.FC<{
  scanState: {
    isProcessing: boolean;
    messageType: 'check-in' | 'check-out' | 'error' | null;
    serverMessage: string;
    employeeName: string;
    result: string | null;
  };
  messageColor: string;
}> = React.memo(({ scanState, messageColor }) => (
  <Paper
    elevation={3}
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: 4,
      textAlign: 'center',
      width: '90%',
      maxWidth: '600px',
      height: '80%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    {scanState.isProcessing ? (
      <ProcessingView />
    ) : (
      <ResultContent
        scanState={scanState}
        messageColor={messageColor}
      />
    )}
  </Paper>
));

const ProcessingView: React.FC = React.memo(() => (
  <>
    <CircularProgress size={120} sx={{ marginBottom: 4 }} />
    <Typography variant="h3" gutterBottom>
      処理中...
    </Typography>
    <Typography variant="h5">
      お待ちください
    </Typography>
  </>
));

const ResultContent: React.FC<{
  scanState: {
    messageType: 'check-in' | 'check-out' | 'error' | null;
    serverMessage: string;
    employeeName: string;
    result: string | null;
  };
  messageColor: string;
}> = React.memo(({ scanState, messageColor }) => (
  <>
    {scanState.messageType === 'error' ? (
      <ErrorIcon sx={{ fontSize: 180, color: 'red', marginBottom: 3 }} />
    ) : (
      <CheckCircleIcon sx={{ fontSize: 180, color: 'green', marginBottom: 3 }} />
    )}
    {scanState.serverMessage && (
      <Typography variant="h5" sx={{ marginTop: 2, color: messageColor }}>
        {scanState.serverMessage}
      </Typography>
    )}
    {scanState.employeeName && scanState.messageType !== 'error' && (
      <Typography variant="h3" sx={{ marginTop: 2, color: 'green' }}>
        {scanState.employeeName}さん！
      </Typography>
    )}
    {scanState.result && scanState.messageType !== 'error' && (
      <Typography variant="h5" sx={{ marginTop: 2 }}>
        従業員ID: {scanState.result}
      </Typography>
    )}
  </>
));

export default QRCodeScanner;