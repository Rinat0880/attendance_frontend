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

// Utility to detect mobile devices
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Utility to detect tablet devices
const isTabletDevice = () => {
  return /iPad|Android(?=.*Tablet)|Tablet/i.test(navigator.userAgent) || 
         (window.innerWidth >= 768 && window.innerWidth <= 1366);
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

  // Unified scan area configuration
  const getScanAreaConfig = useCallback(() => {
    const isMobile = isMobileDevice();
    const isTablet = isTabletDevice();
    
    // Use consistent multiplier for BOTH visual and processing
    let scanAreaMultiplier;
    if (isTablet) {
      scanAreaMultiplier = 0.5; // 50% for tablets
    } else if (isMobile) {
      scanAreaMultiplier = 0.6; // 60% for phones  
    } else {
      scanAreaMultiplier = 0.4; // 40% for desktop
    }
    
    return {
      multiplier: scanAreaMultiplier,
      // Convert to viewport percentage for consistent visual display
      viewportPercentage: `${scanAreaMultiplier * 100}%`
    };
  }, []);

  // Toggle camera function
  const toggleCamera = useCallback(() => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
  }, [facingMode]);

  const processQRCode = useCallback(async (code: string) => {
    // Prevent multiple simultaneous processing
    if (isProcessingRef.current) {
      return;
    }
    
    isProcessingRef.current = true;
    setScanState(prev => ({ ...prev, isScanning: false, isProcessing: true }));
  
    try {
      const response: ServerResponse = await createByQRCode(code);
      
      if (!mountedRef.current) {
        return;
      }
      
      let messageType: 'check-in' | 'check-out' | 'error' | null = null;
  
      if (response.status) {
        // Successful case
        messageType = response.data?.come_time ? 'check-in' : 'check-out';
  
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
      console.error('データ送信エラー:', error);
      
      if (!mountedRef.current) {
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
      return;
    }
    
    if (isProcessingRef.current || !scanState.isScanning || !webcamRef.current) {
      return;
    }

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        return;
      }
      
      const image = new Image();
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const sourceWidth = image.width;
          const sourceHeight = image.height;
          
          // Use the SAME multiplier as visual display
          const config = getScanAreaConfig();
          const scanAreaMultiplier = config.multiplier;
          
          const scanAreaSize = Math.min(sourceWidth, sourceHeight) * scanAreaMultiplier;
          const startX = (sourceWidth - scanAreaSize) / 2;
          const startY = (sourceHeight - scanAreaSize) / 2;
          
          canvas.width = scanAreaSize;
          canvas.height = scanAreaSize;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return;
          }
          
          // Process exactly the same area that user sees in the frame
          ctx.drawImage(
            image,
            startX, startY, scanAreaSize, scanAreaSize,
            0, 0, scanAreaSize, scanAreaSize
          );

          const imageData = ctx.getImageData(0, 0, scanAreaSize, scanAreaSize);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            processQRCode(code.data);
          }
          
          // Clean up canvas to prevent memory leaks
          canvas.width = 0;
          canvas.height = 0;
        } catch (error) {
          console.error('画像処理エラー:', error);
        }
      };
      
      image.onerror = () => {
        console.error('画像読み込みエラー');
      };
      
      image.src = imageSrc;
    } catch (error) {
      console.error('画像キャプチャエラー:', error);
    }
  }, [scanState.isProcessing, scanState.isScanning, processQRCode, getScanAreaConfig]);

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
      scanningInterval.current = setInterval(() => {
        if (mountedRef.current) {
          capture();
        }
      }, 200);
      
      return () => {
        if (scanningInterval.current) {
          clearInterval(scanningInterval.current);
          scanningInterval.current = undefined;
        }
      };
    } else {
      resetTimeout.current = setTimeout(() => {
        if (mountedRef.current) {
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
    const config = getScanAreaConfig();
    return config.viewportPercentage;
  }, [getScanAreaConfig]);

  const scannerStyles = useMemo(() => ({
    container: {
      height: '100vh',
      width: '100vw',
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'transparent',
      WebkitOverflowScrolling: 'touch',
      minHeight: '100vh',
      minWidth: '100vw',
      zIndex: 1000,
      WebkitTransform: 'translate3d(0,0,0)',
      transform: 'translate3d(0,0,0)'
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
      width: scanAreaSize,
      aspectRatio: '1 / 1',
      border: '2px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
      zIndex: 1
    },
    cornerTopLeft: {
      position: 'absolute' as const,
      top: -2,
      left: -2,
      width: '25px',
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
      width: '90%',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
    },
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
    },
    processingOverlay: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: scanAreaSize,
      aspectRatio: '1 / 1',
      border: '3px solid #4CAF50',
      borderRadius: '8px',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
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

  // QR detected feedback overlay
  const QRDetectedOverlay = useMemo(() => {
    if (!scanState.isProcessing) return null;
    
    return (
      <Box sx={scannerStyles.processingOverlay}>
        <Typography variant="h6" sx={{ color: 'white', textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)' }}>
          QRコードが検出されました！
        </Typography>
      </Box>
    );
  }, [scanState.isProcessing, scannerStyles.processingOverlay]);

  return (
    <Box sx={scannerStyles.container}>
      {scanState.isScanning ? (
        <>
          <style>{ScanAnimation}</style>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={scannerStyles.webcam}
            imageSmoothing={false}
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
          
          {/* Main scan overlay */}
          <Box sx={scannerStyles.overlay}>
            <Box sx={scannerStyles.cornerTopLeft} />
            <Box sx={scannerStyles.cornerTopRight} />
            <Box sx={scannerStyles.cornerBottomLeft} />
            <Box sx={scannerStyles.cornerBottomRight} />
            <Box sx={scannerStyles.scanLine} />
          </Box>
          
          {/* QR Detected feedback overlay */}
          {QRDetectedOverlay}
          
          <Box sx={scannerStyles.instruction}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              QRコードを枠内に合わせてください
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              デバイスを20-30cm離してください
            </Typography>
            <Typography variant="body1">
              コードが鮮明に見えるように調整してください
            </Typography>
          </Box>
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