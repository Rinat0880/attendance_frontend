import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
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
import { createUser } from "../../../utils/libs/axios.ts";
import { useTranslation } from "react-i18next";
import { useErrorHandler } from "./ErrorHandler";

interface CreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (newEmployee: TableData) => void;
  positions: Position[];
  departments: Department[];
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

const initialEmployeeState = {
  position: "",
  department: "",
  role: "",
  employee_id: "",
  first_name: "",
  last_name: "",
  password: "",
  nick_name: "",
  phone: "",
  email: "",
};

const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
  open,
  onClose,
  onSave,
  positions = [],
  departments = [],
}) => {
  const [newEmployee, setNewEmployee] =
    useState<Partial<TableData>>(initialEmployeeState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const { t } = useTranslation("admin");
  const { parseApiError, validateForm } = useErrorHandler();

  useEffect(() => {
    if (!open) {
      setNewEmployee(initialEmployeeState);
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (newEmployee.department) {
      const selectedDepartment = departments.find(
        (dept) => dept.name === newEmployee.department
      );

      if (selectedDepartment) {
        const positionsForDepartment = positions.filter(
          (position) => position.department_id === selectedDepartment.id
        );
        setFilteredPositions(positionsForDepartment);

        if (
          !positionsForDepartment.some((p) => p.name === newEmployee.position)
        ) {
          setNewEmployee((prev) => ({ ...prev, position: "" }));
        }
      }
    } else {
      setFilteredPositions([]);
      setNewEmployee((prev) => ({ ...prev, position: "" }));
    }
  }, [newEmployee.department, newEmployee.position, departments, positions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    if (name === "department") {
      setNewEmployee({
        ...newEmployee,
        [name]: value,
        position: "",
      });

      setErrors((prev) => ({
        ...prev,
        position: undefined,
      }));
    } else {
      setNewEmployee({ ...newEmployee, [name]: value });
    }
  };

  const validateAndSubmit = async () => {
    if (!newEmployee) return;

    setErrors({});

    const validationErrors = validateForm(newEmployee);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const departmentId = departments.find(
        (d) => d.name === newEmployee.department
      )?.id;
      const positionId = positions.find(
        (p) => p.name === newEmployee.position
      )?.id;

      if (!departmentId || !positionId) {
        setErrors({
          department: !departmentId ? t("errors.invalidDepartment") : undefined,
          position: !positionId ? t("errors.invalidPosition") : undefined,
        });
        return;
      }

      const createdEmployee = await createUser(
        newEmployee.password!,
        newEmployee.employee_id!,
        newEmployee.role!,
        newEmployee.first_name!,
        newEmployee.last_name!,
        departmentId,
        positionId,
        newEmployee.phone!,
        newEmployee.email!,
        newEmployee.nick_name || ""
      );

      onSave(createdEmployee);
      onClose();
      setNewEmployee(initialEmployeeState);
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

  if (!open) return null;

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
            value={newEmployee.employee_id}
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
            value={newEmployee.last_name}
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
            value={newEmployee.first_name}
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
            value={newEmployee.password}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            required
            autoComplete="new-password"
            error={Boolean(errors.password)}
            helperText={errors.password || ""}
          />

          <TextField
            label={t("createEmployeeModal.nickName")}
            name="nick_name"
            value={newEmployee.nick_name}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            error={Boolean(errors.nick_name)}
            helperText={errors.nick_name || ""}
            inputProps={{ maxLength: 7 }}
          />

          <FormControl
            fullWidth
            margin="dense"
            required
            error={Boolean(errors.role)}
          >
            <InputLabel id="role-select-label">
              {t("createEmployeeModal.role")}
            </InputLabel>
            <Select
              labelId="role-select-label"
              name="role"
              value={newEmployee.role || ""}
              label={t("createEmployeeModal.role")}
              onChange={handleSelectChange}
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
            <InputLabel id="department-select-label">
              {t("createEmployeeModal.department")}
            </InputLabel>
            <Select
              labelId="department-select-label"
              name="department"
              value={newEmployee.department || ""}
              label={t("createEmployeeModal.department")}
              onChange={handleSelectChange}
            >
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.name}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
            {errors.department && (
              <FormHelperText>{errors.department}</FormHelperText>
            )}
          </FormControl>

          <FormControl
            fullWidth
            margin="dense"
            required
            error={Boolean(errors.position)}
          >
            <InputLabel id="position-select-label">
              {t("createEmployeeModal.position")}
            </InputLabel>
            <Select
              labelId="position-select-label"
              name="position"
              value={newEmployee.position || ""}
              onChange={handleSelectChange}
              label={t("createEmployeeModal.position")}
              disabled={!newEmployee.department}
            >
              {filteredPositions.map((position) => (
                <MenuItem key={position.id} value={position.name}>
                  {position.name}
                </MenuItem>
              ))}
            </Select>
            {errors.position && (
              <FormHelperText>{errors.position}</FormHelperText>
            )}
          </FormControl>

          <TextField
            label={t("createEmployeeModal.phoneNumber")}
            name="phone"
            value={newEmployee.phone}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
            error={Boolean(errors.phone)}
            helperText={errors.phone || ""}
          />

          <TextField
            label={t("createEmployeeModal.email")}
            name="email"
            value={newEmployee.email}
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
            <Button
              variant="contained"
              color="primary"
              onClick={validateAndSubmit}
            >
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

export default CreateEmployeeModal;