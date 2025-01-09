import React, { useState, useEffect } from 'react'; 
import { Box, Paper, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import EmployeeTable from '../components/Table/EmployeeTable';
import EditModal from '../components/Table/EditModal';
import CreateEmployeeModal from '../components/Table/CreateEmployeeModal';
import UploadExcelModal from '../components/Table/UploadExcelModal';
import { TableData, Column } from '../components/Table/types';
import axiosInstance, { updateUser, fetchDepartments, fetchPositions, fetchQRCodeList } from '../../utils/libs/axios';
import { useTranslation } from 'react-i18next';

export interface Department {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
  department_id: number;
  department: string;
}

const EmployeeListPage: React.FC = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<TableData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [userCreated, setUserCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation('admin');

  const columns: Column[] = [
    { id: 'employee_id', label: t('employeeTable.employeeId') },
    { id: 'full_name', label: t('employeeTable.fullName') },
    { id: 'nick_name', label: t('employeeTable.nickName') },
    { id: 'department', label: t('employeeTable.department') },
    { id: 'position', label: t('employeeTable.position') },
    { id: 'phone', label: t('employeeTable.phone') },
    { id: 'email', label: t('employeeTable.email') },
    { id: 'action', label: t('employeeTable.action') },
  ];

  const buttonStyles = {
    base: {
      height: 40,
      textTransform: 'none',
      borderRadius: 2,
    },
    primary: {
      bgcolor: '#00D891',
      '&:hover': { bgcolor: '#00AB73' },
    },
    withMargin: {
      ml: 1.5
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [departmentsResponse, positionsResponse] = await Promise.all([
          fetchDepartments(),
          fetchPositions()
        ]);

        if (departmentsResponse?.departments) {
          setDepartments(departmentsResponse.departments);
        } else {
          setDepartments([]);
        }

        if (positionsResponse) {
          setPositions(positionsResponse);
        } else {
          setPositions([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setDepartments([]);
        setPositions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEditOpen = (employee: TableData) => {
    const transformedEmployee = {
      id: employee.id,
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      first_name: employee.full_name.split(' ')[0], 
      last_name: employee.full_name.split(' ')[1] || '', 
      nick_name: employee.nick_name, 
      role: employee.role || "Employee", 
      department: employee.department,
      position: employee.position,
      phone: employee.phone,
      email: employee.email,
      password: '', 
      forget_leave: false,
    };
  
    console.log("Transformed employee data: ", transformedEmployee);
    setSelectedEmployee(transformedEmployee);
    setEditModalOpen(true);
  };

  const handleEditSave = async (updatedEmployee: TableData) => {
    try {
      console.log('Updating employee: ', updatedEmployee);
      
      await updateUser(
        updatedEmployee.id,
        updatedEmployee.employee_id,
        updatedEmployee.password!,
        updatedEmployee.role!,
        updatedEmployee.first_name!,
        updatedEmployee.last_name!,
        updatedEmployee.department_id!,
        updatedEmployee.position_id!,
        updatedEmployee.phone!,
        updatedEmployee.email!,
        updatedEmployee.nick_name!,
      );
      setUserCreated(prev => !prev);
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleCreateModalOpen = () => {
    if (!isLoading) {
      setCreateModalOpen(true);
    }
  };

  const handleCreateSave = (newEmployee: TableData) => {
    setCreateModalOpen(false);
    setUserCreated(prev => !prev);
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance().delete(`/user/${id}`);
      setUserCreated(prev => !prev);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      setUploadModalOpen(false);
      setUserCreated(prev => !prev);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDownloadQRCodes = async () => {
    try {
      const response = await fetchQRCodeList();
  
      if (!(response instanceof Blob)) {
        throw new Error('Invalid response format');
      }
  
      const pdfBlob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'qrcodes.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR codes:", error);
      alert("QRコードの読み込みに失敗しました。もう一度お試しください。");
    }
  };

  const handleExportEmployees = async () => {
    try {
      const response = await axiosInstance().get('/user/export_employee', {
        responseType: 'blob',
      });
  
      if (!(response.data instanceof Blob)) {
        throw new Error('Invalid response format');
      }
  
      const excelBlob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting employees:", error);
      alert("従業員のエクスポートに失敗しました。再試行してください。");
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '10px 10px 0 0',
          padding: '14px',
          marginBottom: '-1px',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateModalOpen}
            disabled={isLoading}
            sx={{ ...buttonStyles.base, ...buttonStyles.primary }}
          >
            {t('employeeList.createButton')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={isLoading}
            onClick={() => setUploadModalOpen(true)}
            sx={{ ...buttonStyles.base, ...buttonStyles.primary }}
          >
            {t('employeeList.uploadButton')}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={handleDownloadQRCodes}
            disabled={isLoading}
            sx={{ ...buttonStyles.base, ...buttonStyles.primary }}
          >
            {t('employeeList.downloadQRCodesButton')}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            disabled={isLoading}
            onClick={handleExportEmployees}
            sx={{ ...buttonStyles.base, ...buttonStyles.primary }}
          >
            {t('Export')}
          </Button>
        </Box>
      </Paper>

      <EmployeeTable
        departments={departments}
        positions={positions}
        columns={columns}
        onEdit={handleEditOpen}
        onDelete={handleDelete}
        tableTitle={t('employeeTable.title')}
        showCalendar={false}
        userCreated={userCreated}
      />

      <EditModal
        departments={departments}
        positions={positions}
        open={editModalOpen}
        data={selectedEmployee}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        userCreated={userCreated}
      />
      <CreateEmployeeModal
        departments={departments}
        positions={positions}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateSave}
      />
      <UploadExcelModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleFileUpload}
      />
    </>
  );
};

export default EmployeeListPage;