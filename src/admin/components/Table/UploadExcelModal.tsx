import React, { useRef, useState } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Link,
  ThemeProvider,
  createTheme,
  SelectChangeEvent,
} from "@mui/material";
import { uploadExcelFile, downloadSampleFile } from "../../../utils/libs/axios.ts";
import { SnackbarCloseReason } from "@mui/material";
import axios from "axios";
import ExcelErrorTable from "./ExcelErrorTable.tsx";

// Define the theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#105E82',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFC107',
    },
    error: {
      main: '#F44336',
    },
    info: {
      main: '#9E9E9E',
    }
  },
});

// Define interfaces
interface UploadExcelModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, mode: number) => void;
}

interface ErrorData {
  [key: string]: string;
}

interface EmployeeRow {
  employee_id: string;
  last_name: string;
  first_name: string;
  role: string;
  password: string;
  department_name: string;
  position_name: string;
  phone?: string;
  email: string;
  [key: string]: string | undefined;
}

interface InvalidUser {
  row: EmployeeRow;
  errors: ErrorData;
}

interface ExcelValidationResponse {
  invalid_users: InvalidUser[];
  status: boolean;
  success_count: number;
}

const UploadExcelModal: React.FC<UploadExcelModalProps> = ({
  open,
  onClose,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<number>(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "warning" | "error" | "info">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationErrors, setValidationErrors] = useState<InvalidUser[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setValidationErrors([]);
    }
  };

  const handleModeChange = (event: SelectChangeEvent<number>) => {
    setMode(event.target.value as number);
  };

  const handleSnackbarClose = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleDownloadSample = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await downloadSampleFile();
    } catch (error) {
      console.error("サンプルファイルのダウンロード中にエラーが発生しました:", error);
      showSnackbar("ファイルのダウンロードエラー", "error");
    }
  };

  const resetFileInput = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showSnackbar = (message: string, severity: "success" | "warning" | "error" | "info" = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    setTimeout(() => {
      setSnackbarOpen(false);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      showSnackbar("ファイルを選択してください", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("excell", selectedFile);
      formData.append("mode", mode.toString());

      const result: ExcelValidationResponse = await uploadExcelFile(formData);

      if (result.invalid_users && result.invalid_users.length > 0) {
        setValidationErrors(result.invalid_users);
        
        if (result.success_count > 0) {
          showSnackbar(`${result.success_count}件のレコードが正常に処理されました。${result.invalid_users.length}件のエラーがあります。`, "warning");
          onUpload(selectedFile, mode);
          resetFileInput(); 
        } else {
          showSnackbar(`アップロードに失敗しました。${result.invalid_users.length}件のエラーがあります。`, "warning");
          resetFileInput(); 
        }
      } else {
        showSnackbar("ファイルのアップロードが完了しました", "success");
        onUpload(selectedFile, mode);
        onClose();
        resetFileInput();
        setValidationErrors([]); 
      }
    } catch (error) {
      console.error("ファイルのアップロード中にエラーが発生しました:", error);
      if (axios.isAxiosError(error) && error.response) {
        showSnackbar(error.response.data.message || "ファイルのアップロードエラー", "error");
      } else {
        showSnackbar("ファイルのアップロードエラー", "error");
      }
      resetFileInput(); 
    }
  };

  const handleModalClose = () => {
    setValidationErrors([]);
    resetFileInput();
    onClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Modal open={open} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            borderRadius: "10px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflow: "auto"
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 3, color: '#105E82', fontWeight: 'bold' }}>
            作成
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start'
              }}>
                <Box sx={{
                  width: '45%',
                  flexShrink: 0,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  p: 2,
                  backgroundColor: '#f8f9fa'
                }}>
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      height: '56px',
                      width: '100%',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      pl: 2,
                      borderColor: '#105E82',
                      color: '#105E82',
                      '&:hover': {
                        borderColor: '#105E82',
                        backgroundColor: 'rgba(16, 94, 130, 0.04)',
                      },
                    }}
                  >
                    <span>参照...</span>
                    <span style={{ color: '#666' }}>
                      {selectedFile ? selectedFile.name : 'ファイルが選択されていません'}
                    </span>
                    <input
                      type="file"
                      hidden
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </Button>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    xlsxファイルを選択
                  </Typography>
                </Box>

                <Box sx={{
                  width: '25%',
                  flexShrink: 0,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  p: 2,
                  backgroundColor: '#f8f9fa'
                }}>
                  <Box sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}>
                    <FormControl sx={{ width: '140px' }}>
                      <InputLabel sx={{ '&.Mui-focused': { color: '#105E82' } }}>
                        モード
                      </InputLabel>
                      <Select
                        value={mode}
                        label="モード"
                        onChange={handleModeChange}
                        sx={{
                          height: '56px',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#105E82',
                          },
                        }}
                      >
                        <MenuItem value={1}>作成</MenuItem>
                        <MenuItem value={2}>更新</MenuItem>
                        <MenuItem value={3}>削除</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!selectedFile}
                      sx={{
                        backgroundColor: '#105E82',
                        height: '56px',
                        minWidth: '120px',
                        '&:hover': {
                          backgroundColor: '#105E82',
                          opacity: 0.8,
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#e0e0e0',
                          color: '#9e9e9e'
                        }
                      }}
                    >
                      アップロード
                    </Button>
                  </Box>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    xlsxファイルをアップロード
                  </Typography>
                </Box>

                <Box sx={{
                  width: '30%',
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  display: 'block',
                }}>
                  <Link
                    href="#"
                    onClick={handleDownloadSample}
                    sx={{
                      color: '#105E82',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: '36px',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  > XLSXからの作成方法
                  </Link>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    初めての方で作成に問題がある場合は、以下のリンクの説明をお読みください
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </form>

          {/* Always show the error table */}
          <Box sx={{ mt: 4 }}>
            <ExcelErrorTable invalidUsers={validationErrors} />
          </Box>

          {/* Always show close button at the bottom */}
          <Box sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px solid #e0e0e0',
            pt: 2
          }}>
            <Button
              onClick={handleModalClose}
              variant="outlined"
              sx={{
                borderColor: '#105E82',
                color: '#105E82',
                px: 4,
                '&:hover': {
                  borderColor: '#105E82',
                  backgroundColor: 'rgba(16, 94, 130, 0.04)',
                },
              }}
            >
              閉じる
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            '& .MuiAlert-icon': {
              color: snackbarSeverity === 'success' ? '#4CAF50' :
                snackbarSeverity === 'warning' ? '#FFC107' :
                  snackbarSeverity === 'error' ? '#F44336' : '#9E9E9E',
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default UploadExcelModal;