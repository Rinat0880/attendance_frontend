import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  ThemeProvider,
  createTheme,
  FormHelperText,
} from "@mui/material";
import { AxiosError, TableData, FormErrors } from "./types.ts";
import { updateUser } from "../../../utils/libs/axios.ts";
import { useTranslation } from "react-i18next";
import { useErrorHandler } from "./ErrorHandler";

interface EditModalProps {
  open: boolean;
  data: TableData | null;
  onClose: () => void;
  onSave: (updatedData: TableData) => void;
  positions: Position[];
  departments: Department[];
  userCreated: boolean;
}

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

const EditModal: React.FC<EditModalProps> = ({
  open,
  data,
  onClose,
  onSave,
  positions,
  departments,
}) => {
  const [formData, setFormData] = useState<TableData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const { t } = useTranslation("admin");
  const { parseApiError, validateForm } = useErrorHandler();

  useEffect(() => {
    if (open && data) {
      setErrors({});
      setFormData({
        ...data,
        password: "", // Password always empty for security
        role: data.role || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        employee_id: data.employee_id || "",
        email: data.email || "",
        phone: data.phone || "",
        nick_name: data.nick_name || "",
        department: data.department || "",
        position: data.position || "",
        id: data.id,
        full_name: data.full_name || "",
        forget_leave: data.forget_leave || false,
      });
    }
  }, [open, data]);

  useEffect(() => {
    if (formData?.department) {
      const selectedDepartment = departments.find(
        (dept) => dept.name === formData.department
      );
      
      if (selectedDepartment) {
        const positionsForDepartment = positions.filter(
          (position) => position.department_id === selectedDepartment.id
        );
        setFilteredPositions(positionsForDepartment);
        
        // Only clear position if it doesn't belong to the new department
        if (formData.position && !positionsForDepartment.some(p => p.name === formData.position)) {
          setFormData(prev => prev ? { ...prev, position: "" } : null);
        }
      }
    } else {
      setFilteredPositions([]);
      if (formData) {
        setFormData(prev => prev ? { ...prev, position: "" } : null);
      }
    }
  }, [formData, departments, positions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      const { name, value } = e.target;
      
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));

      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    if (formData) {
      const { name, value } = e.target;
      
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
      
      if (name === "department") {
        setFormData({
          ...formData,
          [name]: value,
          position: "" // Clear position when department changes
        });
        
        setErrors(prev => ({
          ...prev,
          position: undefined
        }));
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  const validateAndSubmit = async () => {
    if (!formData) return;
    
    setErrors({});
    
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const departmentId = departments.find(
        (d) => d.name === formData.department
      )?.id;

      // Position is now optional - can be null
      const positionId = formData.position 
        ? positions.find((p) => p.name === formData.position)?.id ?? null
        : null;

      if (!departmentId) {
        setErrors({
          department: t("errors.invalidDepartment"),
        });
        return;
      }

      // If position is specified but invalid, show error
      if (formData.position && positionId === null) {
        setErrors({
          position: t("errors.invalidPosition"),
        });
        return;
      }

      await updateUser(
        formData.id,
        formData.employee_id,
        formData.password || "",
        formData.role!,
        formData.first_name!,
        formData.last_name!,
        departmentId,
        positionId, // Now correctly typed as number | null
        formData.phone!,
        formData.email!,
        formData.nick_name || ""
      );

      onSave(formData);
      onClose();
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = "予期せぬエラーが発生しました";
      
      if (axiosError.response && axiosError.response.data.error) {
        errorMessage = axiosError.response.data.error;
      }
      
      const apiErrors = parseApiError(errorMessage);
      setErrors(apiErrors);
    }
  };

  if (!open || !formData) return null;

  const theme = createTheme({
    palette: {
      primary: {
        main: "#105E82",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("createEmployeeModal.title")}
          </Typography>
          
          <TextField
            label={t("createEmployeeModal.employeeId")}
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            required
            error={Boolean(errors.employee_id)}
            helperText={errors.employee_id || ""}
          />
          
          <TextField
            label={t("createEmployeeModal.lastName")}
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            required
            error={Boolean(errors.last_name)}
            helperText={errors.last_name || ""}
          />
          
          <TextField
            label={t("createEmployeeModal.firstName")}
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            required
            error={Boolean(errors.first_name)}
            helperText={errors.first_name || ""}
          />
          
          <TextField
            label={t("createEmployeeModal.password")}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            autoComplete="off"
            error={Boolean(errors.password)}
            helperText={errors.password || ""}
          />
          
          <TextField
            label={t("createEmployeeModal.nickName")}
            name="nick_name"
            value={formData.nick_name}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            error={Boolean(errors.nick_name)}
            helperText={errors.nick_name || ""}
            inputProps={{ maxLength: 7 }}
          />
          
          <FormControl 
            fullWidth 
            required
            margin="dense"
            error={Boolean(errors.role)}
          >
            <InputLabel shrink={Boolean(formData.role) || formData.role === ""}>
              {t("createEmployeeModal.role")}
            </InputLabel>
            <Select
              name="role"
              value={formData.role || ""}
              label={t("createEmployeeModal.role")}
              onChange={handleSelectChange}
              displayEmpty
            >
              <MenuItem value="ADMIN">
                {t("createEmployeeModal.roleAdmin")}
              </MenuItem>
              <MenuItem value="EMPLOYEE">
                {t("createEmployeeModal.roleEmployee")}
              </MenuItem>
            </Select>
            {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
          </FormControl>
          
          <FormControl 
            fullWidth 
            margin="dense" 
            required
            error={Boolean(errors.department)}
          >
            <InputLabel shrink={Boolean(formData.department)}>
              {t("createEmployeeModal.department")}
            </InputLabel>
            <Select
              name="department"
              value={formData.department}
              label={t("createEmployeeModal.department")}
              onChange={handleSelectChange}
            >
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.name}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
            {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
          </FormControl>
          
          {/* Position is now optional - removed required prop */}
          <FormControl 
            fullWidth 
            margin="dense" 
            error={Boolean(errors.position)}
          >
            <InputLabel shrink={Boolean(formData.position)}>
              {t("createEmployeeModal.position")}
            </InputLabel>
            <Select
              name="position"
              value={formData.position}
              label={t("createEmployeeModal.position")}
              onChange={handleSelectChange}
              disabled={!formData.department}
            >
              {/* Add empty option for optional selection */}
              <MenuItem value="">
                <em>選択なし</em>
              </MenuItem>
              {filteredPositions.map((position) => (
                <MenuItem key={position.id} value={position.name}>
                  {position.name}
                </MenuItem>
              ))}
            </Select>
            {errors.position && <FormHelperText>{errors.position}</FormHelperText>}
          </FormControl>
          
          <TextField
            label={t("createEmployeeModal.phoneNumber")}
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            error={Boolean(errors.phone)}
            helperText={errors.phone || ""}
          />
          
          <TextField
            label={t("createEmployeeModal.email")}
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            required
            error={Boolean(errors.email)}
            helperText={errors.email || ""}
          />
          
          {errors.general && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {errors.general}
            </Typography>
          )}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              {t("createEmployeeModal.cancelBtn")}
            </Button>
            <Button variant="contained" color="primary" onClick={validateAndSubmit}>
              {t("createEmployeeModal.saveBtn")}
            </Button>
          </Box>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

const modalStyle = {
  position: "absolute" as "absolute",
  borderRadius: "10px",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
};

export default EditModal;