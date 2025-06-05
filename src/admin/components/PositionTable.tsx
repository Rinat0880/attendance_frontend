import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Box, Snackbar, Alert
} from '@mui/material';
import { Position, Department } from '../pages/DepartmentPositionManagement.tsx'; 
import { deletePosition } from '../../utils/libs/axios.ts';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';

interface PositionTableProps {
  positions: Position[];
  onEdit: (position: Position) => void;
  onDelete: (positionId: number) => void;
  departments: Department[];
}

function PositionTable({ positions, onEdit, onDelete, departments }: PositionTableProps) {
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await deletePosition(id);
      onDelete(id);
    } catch (error) {
      console.error('Error deleting position:', error);
      if (error instanceof AxiosError && error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const { t } = useTranslation('admin');

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find((dept) => dept.id === departmentId);
    return department ? department.name : 'Unknown';
  };

  return (
    <>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{
            width: '100%',
            minWidth: '300px',
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Paper 
        sx={{ 
          borderRadius: 3, 
          overflow: "hidden",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          mb: 3
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderBottom: '2px solid #e0e0e0',
                  padding: '16px',
                  fontWeight: 600,
                  color: '#333',
                }}
              >
                {t('positionTable.jobTitle')}
              </TableCell>
              <TableCell 
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderBottom: '2px solid #e0e0e0',
                  padding: '16px',
                  fontWeight: 600,
                  color: '#333',
                }}
              >
                {t('positionTable.positionName')}
              </TableCell>
              <TableCell 
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderBottom: '2px solid #e0e0e0',
                  padding: '16px',
                  fontWeight: 600,
                  color: '#333',
                }}
              >
                {t('positionTable.action')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position, index) => (
              <TableRow 
                key={position.id}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                }}
              >
                <TableCell sx={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  {position.name}
                </TableCell>
                <TableCell sx={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  {getDepartmentName(position.department_id)}
                </TableCell>
                <TableCell sx={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      onClick={() => onEdit(position)} 
                      variant="outlined" 
                      size="small"
                      sx={{
                        borderColor: '#105E82',
                        color: '#105E82',
                        '&:hover': {
                          borderColor: '#0D4D6B',
                          backgroundColor: 'rgba(16, 94, 130, 0.04)',
                        },
                      }}
                    >
                      {t('positionTable.editBtn')}
                    </Button>
                    <Button 
                      onClick={() => handleDelete(position.id)} 
                      variant="outlined" 
                      size="small" 
                      color="error"
                      sx={{
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        '&:hover': {
                          borderColor: '#b71c1c',
                          backgroundColor: 'rgba(211, 47, 47, 0.04)',
                        },
                      }}
                    >
                      {t('positionTable.deleteBtn')}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}

export default PositionTable;