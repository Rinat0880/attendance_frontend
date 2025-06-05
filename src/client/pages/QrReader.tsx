import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { Box, Typography, Paper, Snackbar, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { createByQRCode } from '../../utils/libs/axios.ts';

interface ServerResponse {
  data: {
    id: number;
    employee_id: string;
    full_name: string;
    work_day: string;
    come_time: string;
  } | null;
  message: string;
  status: boolean;
  error?: string;
}

const QRCodeScanner: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [messageType, setMessageType] = useState<'check-in' | 'check-out' | 'error' | null>(null);
  const webcamRef = useRef<Webcam | null>(null);


  const sendEmployeeIdWithLocation = async (employeeId: string) => {
    setIsProcessing(true);
    try {
      
      const response: ServerResponse = await createByQRCode(employeeId);
      
      if (response.status) {
        setServerMessage(response.message);
        setEmployeeName(response.data?.full_name || '');
        setResult(response.data?.employee_id || '');
        setSnackbarMessage('記録が正常に作成されました');
        
        if (response.message.toLowerCase().includes('welcome')) {
          setMessageType('check-in');
        } else if (response.message.toLowerCase().includes('get home safely') || 
                   response.message.toLowerCase().includes('goodbye')) {
          setMessageType('check-out');
        } else {
          setMessageType(null);
        }
      } else {
        setServerMessage('位置情報エラー：許可されたスキャンエリアから離れすぎています。オフィス/大学内にいることを確認してください。');
        setMessageType('error');
        setSnackbarMessage('記録の作成エラー：位置情報が無効です');
      }
    } catch (error) {
      console.error('データ送信エラー:', error);
      setServerMessage('リクエストの処理中にエラーが発生しました。もう一度お試しください。');
      setMessageType('error');
      setSnackbarMessage('記録の作成エラー');
    } finally {
      setIsProcessing(false);
      setSnackbarOpen(true);
    }
  };

  const capture = useCallback(() => {
    if (isProcessing || !isScanning || !webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0, image.width, image.height);
          const imageData = ctx.getImageData(0, 0, image.width, image.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            setIsScanning(false);
            sendEmployeeIdWithLocation(code.data);
          }
        }
      };
    }
  }, [isProcessing, isScanning, webcamRef]);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        capture();
      }, 4000);
      return () => clearInterval(interval);
    } else {
      const timer = setTimeout(() => {
        setIsScanning(true);
        setResult(null);
        setServerMessage('');
        setEmployeeName('');
        setMessageType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isScanning, capture]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getMessageColor = () => {
    switch (messageType) {
      case 'check-in':
      case 'check-out':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'inherit';
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {isScanning ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'environment' }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            height: '90%',
            border: '4px solid white',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }} />
          <Typography variant="h4" sx={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            textAlign: 'center',
            zIndex: 2
          }}>
            QRコードにカメラを向けてください
          </Typography>
        </>
      ) : (
        <Paper elevation={3} sx={{
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
        }}>
          {isProcessing ? (
            <>
              <CircularProgress size={120} sx={{ marginBottom: 4 }} />
              <Typography variant="h3" gutterBottom>
                処理中...
              </Typography>
              <Typography variant="h5">
                お待ちください
              </Typography>
            </>
          ) : (
            <>
              {messageType === 'error' ? (
                <ErrorIcon sx={{ 
                  fontSize: 180, 
                  color: 'red',
                  marginBottom: 3 
                }} />
              ) : (
                <CheckCircleIcon sx={{ 
                  fontSize: 180, 
                  color: 'green',
                  marginBottom: 3 
                }} />
              )}
              <Typography variant="h3" gutterBottom sx={{ color: getMessageColor() }}>
                {messageType === 'check-in' ? 'チェックイン成功' : 
                 messageType === 'check-out' ? 'チェックアウト成功' : 
                 ''}
              </Typography>
              {serverMessage && (
                <Typography variant="h5" sx={{ marginTop: 2, color: getMessageColor() }}>
                  {serverMessage}
                </Typography>
              )}
              {employeeName && messageType !== 'error' && (
                <Typography variant="h3" sx={{ marginTop: 2, color: 'green' }}>
                  {messageType === 'check-in' ? 'ようこそ' : 'お気をつけて'}, {employeeName}さん！
                </Typography>
              )}
              {result && messageType !== 'error' && (
                <Typography variant="h5" sx={{ marginTop: 2 }}>
                  従業員ID: {result}
                </Typography>
              )}
            </>
          )}
        </Paper>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default QRCodeScanner;