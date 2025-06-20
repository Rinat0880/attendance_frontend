import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName?: string;
  employeeId?: string;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#105E82',
    },
    error: {
      main: '#d32f2f',
    },
  },
});

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  employeeName,
  employeeId,
}) => {
  const { t } = useTranslation('admin');

  return (
    <ThemeProvider theme={theme}>
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
              {t('employeeTable.deleteConfirmTitle')}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3, color: '#555', lineHeight: 1.6 }}>
            {t('employeeTable.deleteConfirmMessage')}
          </Typography>
          
          {(employeeName || employeeId) && (
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              mb: 3,
              border: '1px solid #e0e0e0'
            }}>
              {employeeId && (
                <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                  <strong>{t('employeeTable.employeeId')}:</strong> {employeeId}
                </Typography>
              )}
              {employeeName && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>{t('employeeTable.fullName')}:</strong> {employeeName}
                </Typography>
              )}
            </Box>
          )}
          
          <Typography variant="body2" sx={{ mb: 4, color: '#d32f2f', fontWeight: 500 }}>
            {t('employeeTable.deleteWarning')}
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: 2
          }}>
            <Button 
              onClick={onClose}
              variant="outlined"
              sx={{
                borderColor: '#ccc',
                color: '#666',
                px: 3,
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {t('employeeTable.cancelBtn')}
            </Button>
            <Button 
              onClick={onConfirm}
              variant="contained"
              color="error"
              sx={{
                px: 3,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#b71c1c',
                },
              }}
            >
              {t('employeeTable.confirmDeleteBtn')}
            </Button>
          </Box>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  p: 4,
  outline: 'none',
};

export default DeleteConfirmationModal;