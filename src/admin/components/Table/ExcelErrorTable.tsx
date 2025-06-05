import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

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

interface ErrorData {
  [key: string]: string;
}

interface InvalidUser {
  row: EmployeeRow;
  errors: ErrorData;
}

interface ExcelErrorTableProps {
  invalidUsers?: InvalidUser[];
}

const ExcelErrorTable: React.FC<ExcelErrorTableProps> = ({ invalidUsers = [] }) => {
  const renderCell = (user: InvalidUser, fieldName: string) => {
    const hasError = user.errors && user.errors[fieldName];
    const value = user.row[fieldName] !== undefined ? user.row[fieldName] : "";
    
    const columnDef = columnDefinitions.find(col => col.field === fieldName);
    
    return (
      <TableCell 
        key={fieldName} 
        align="left"
        sx={{ 
          width: columnDef?.width,
          minWidth: columnDef?.width,
          maxWidth: columnDef?.width,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: hasError ? 'calc(100% - 24px)' : '100%' 
            }}
          >
            {value}
          </Typography>
          {hasError && (
            <Tooltip title={user.errors[fieldName]} arrow placement="top">
              <ErrorOutlineIcon color="error" fontSize="small" sx={{ flexShrink: 0 }} />
            </Tooltip>
          )}
        </Box>
      </TableCell>
    );
  };

  const columnDefinitions = [
    { field: "employee_id", header: "ID", width: "11%" },
    { field: "last_name", header: "姓", width: "9%" },
    { field: "first_name", header: "名", width: "9%" },
    { field: "role", header: "役割", width: "12%" },
    { field: "password", header: "パスワード", width: "11%" },
    { field: "department_name", header: "部署名", width: "11%" },
    { field: "position_name", header: "役職名", width: "11%" },
    { field: "phone", header: "電話番号", width: "13%" },
    { field: "email", header: "メールアドレス", width: "20%" }
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        検証結果
      </Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader sx={{ minWidth: 650, tableLayout: 'fixed' }} aria-label="excel errors table">
          <TableHead>
            <TableRow>
              {columnDefinitions.map(column => (
                <TableCell 
                  key={column.field} 
                  align="left"
                  sx={{ 
                    width: column.width, 
                    minWidth: column.width,
                    fontWeight: 'bold'
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {invalidUsers.length > 0 ? (
              invalidUsers.map((user, index) => (
                <TableRow key={index} sx={{ "&:nth-of-type(odd)": { bgcolor: "rgba(0, 0, 0, 0.04)" } }}>
                  {columnDefinitions.map(column => renderCell(user, column.field))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnDefinitions.length} align="center">
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ExcelErrorTable;