import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Box, Alert, Snackbar
} from '@mui/material';
import { Department } from '../pages/DepartmentPositionManagement.tsx';
import { deleteDepartment } from '../../utils/libs/axios.ts';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';

interface DepartmentTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (departmentId: number) => void;
}

function DepartmentTable({ departments, onEdit, onDelete }: DepartmentTableProps) {
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await deleteDepartment(id);
      onDelete(id);
    } catch (error) {
      console.error('Error deleting department:', error);
      if (error instanceof AxiosError && error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const { t } = useTranslation('admin');

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
                {t('departmentTable.departmentName')}
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
                {t('departmentTable.departmentNickname')}
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
                {t('departmentTable.displayNumber')}
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
                {t('departmentTable.action')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments
              .sort((a, b) => a.display_number - b.display_number) 
              .map((department, index) => (
                <TableRow 
                  key={department.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                    },
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  <TableCell sx={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                    {department.name}
                  </TableCell>
                  <TableCell sx={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                    {department.department_nickname}
                  </TableCell> 
                  <TableCell sx={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                    {department.display_number}
                  </TableCell>
                  <TableCell sx={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        onClick={() => onEdit(department)} 
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
                        {t('departmentTable.editBtn')}
                      </Button>
                      <Button 
                        onClick={() => handleDelete(department.id)} 
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
                        {t('departmentTable.deleteBtn')}
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

export default DepartmentTable;