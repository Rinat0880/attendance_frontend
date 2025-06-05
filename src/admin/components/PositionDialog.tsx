import { useState, useEffect } from "react";
import {
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Modal,
  Divider,
} from "@mui/material";
import {
  Department,
  Position,
} from "../pages/DepartmentPositionManagement.tsx";
import { createPosition, updatePosition } from "../../utils/libs/axios.ts";
import { useTranslation } from "react-i18next";
import { AxiosError } from "./Table/types.ts";

interface PositionDialogProps {
  open: boolean;
  onClose: () => void;
  position: Position | null;
  departments: Department[];
  onSave: (position: Position) => void;
}

function PositionDialog({
  open,
  onClose,
  position,
  departments,
  onSave,
}: PositionDialogProps) {
  const [name, setName] = useState(position?.name || "");
  const [departmentId, setDepartmentId] = useState<number | string>(
    position?.department_id || ""
  );
  const [error, setError] = useState("");
  const { t } = useTranslation("admin");

  useEffect(() => {
    if (position) {
      setError("");
      setName(position.name);
      setDepartmentId(position.department_id);
    } else {
      setError("");
      setName("");
      setDepartmentId("");
    }
  }, [position, open]);

  const handleSave = async () => {
    setError("");
    if (
      position &&
      name === position.name &&
      departmentId === position.department_id
    ) {
      setError("You choosing same thing");
      return;
    }

    if (name.trim() !== "" && departmentId) {
      let savedPosition;
      const department =
        departments.find((dept) => dept.id === Number(departmentId))?.name ||
        "Unknown";

      try {
        if (position) {
          await updatePosition(position.id, name, Number(departmentId));
          savedPosition = {
            id: position.id,
            name,
            department_id: Number(departmentId),
            department,
          };
        } else {
          const response = await createPosition(name, Number(departmentId));
          savedPosition = {
            id: response.data.id,
            name: response.data.name,
            department_id: response.data.department_id,
            department,
          };
        }

        onSave(savedPosition);
        onClose();
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          setError(axiosError.response.data.error);
        } else {
          setError("予期せぬエラーが発生しました");
        }
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <DialogTitle 
          sx={{ 
            pb: 1,
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#105E82',
            textAlign: 'center'
          }}
        >
          {position
            ? t("positionTable.dialogTitleEdit")
            : t("positionTable.dialogTitleAdd")}
        </DialogTitle>

        <Divider sx={{ mx: -3, mb: 2 }} />

        <DialogContent sx={{ px: 0, py: 0 }}>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label={t("positionTable.label")}
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": {
                  borderColor: "#105E82",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#105E82",
              },
            }}
          />
          
          <FormControl 
            fullWidth 
            sx={{ 
              mt: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": {
                  borderColor: "#105E82",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#105E82",
              },
            }}
          >
            <InputLabel id="department-select-label">
              {t("positionTable.changeDep")}
            </InputLabel>
            <Select
              labelId="department-select-label"
              id="department-select"
              value={departmentId}
              label={t("positionTable.changeDep")}
              onChange={(e) => setDepartmentId(e.target.value as number)}
            >
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider sx={{ mx: -3, my: 2 }} />

        <DialogActions sx={{ px: 0, pt: 0, gap: 1, justifyContent: 'flex-end' }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#ccc',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: '#105E82',
              '&:hover': {
                backgroundColor: '#0D4D6B',
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Box>
    </Modal>
  );
}

const modalStyle = {
  position: "absolute" as "absolute",
  borderRadius: 3,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 440,
  bgcolor: "background.paper",
  boxShadow: "0 20px 60px rgba(16, 94, 130, 0.15)",
  p: 3,
  outline: 'none',
};

export default PositionDialog;