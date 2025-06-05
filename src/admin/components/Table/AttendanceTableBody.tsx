import React from "react";
import { TableBody, TableRow, TableCell, Box, Button } from "@mui/material";
import { TableData, Column, DateOrString } from "./types.ts";
import { useTranslation } from "react-i18next";
import { downloadEmployeeQRCode } from "../../../utils/libs/axios.ts";

export interface Colors {
  absent_color: string;
  come_time_color: string;
  forget_time_color: string;
  leave_time_color: string;
  present_color: string;
}

export const DEFAULT_COLORS: Colors = {
  absent_color: "#82909a",
  come_time_color: "#ff0000",
  forget_time_color: "#ff0000",
  leave_time_color: "#ff0000",
  present_color: "#ff0000"
};

interface AttendanceTableBodyProps {
  columns: Column[];
  filteredData: TableData[];
  colors?: Colors;
  onEdit?: (item: TableData) => void;
  onDelete?: (id: number) => void;
}

const AttendanceTableBody: React.FC<AttendanceTableBodyProps> = ({
  columns,
  filteredData,
  colors = DEFAULT_COLORS,
  onEdit,
  onDelete,
}) => {
  const mergedColors = {
    ...DEFAULT_COLORS,
    ...(colors || {})
  };
  const { t } = useTranslation("admin");

  const formatValue = (
    value: DateOrString | boolean,
    key?: string,
  ): string => {
    if (value === undefined || value === null) {
      return key === "checkOut" ? "" : "--:--";
    }
    
    if (typeof value === "boolean") {
      return value ? ("出席") : ("欠席");
    }

    if (value instanceof Date) {
      if (key === "date") {
        return value.toISOString().split("T")[0];
      } else if (key === "checkIn" || key === "checkOut") {
        return value.toTimeString().split(" ")[0];
      }
      return value.toLocaleString();
    }
    return value.toString();
  };

  // const getBackgroundColor = (column: string, value: DateOrString | boolean, forgetLeave: boolean) => {
  //   if (column === 'come_time' && forgetLeave) {
  //     return { 
  //       backgroundColor: mergedColors.forget_time_color, 
  //       color: '#000' 
  //     };
  //   }

  //   if (column === 'status' && typeof value === 'boolean') {
  //     return getStatusStyles(value as boolean);
  //   }

  //   return { backgroundColor: '', color: '#000' };
  // };

  const getBackgroundColor = (column: string, value: DateOrString | boolean, forgetLeave: boolean, row: TableData) => {
    const formattedValue = formatValue(value, column);
    const isBothTimeEmpty = formattedValue === "--:--";
    const isComeTimeNotEmpty = formatValue(row.come_time, "come_time") !== "--:--";


    if (column === "leave_time" && forgetLeave) {
      return { backgroundColor: mergedColors.forget_time_color, color: "#000" }; 
    }



    if (column === "leave_time" && isComeTimeNotEmpty) {
      return { backgroundColor: mergedColors.leave_time_color, color: "#000" };
    }
  
    if ((column === "leave_time" || column === "come_time") && isBothTimeEmpty) {
      return { backgroundColor: mergedColors.absent_color, color: "#000" };
    }
  
    if (column === "status" && typeof value === "boolean") {
      return getStatusStyles(value as boolean);
    }
    if(column === "come_time") {
      return{backgroundColor: mergedColors.come_time_color, color: "#000"}
    }
  
    return { backgroundColor: "", color: "#000" };
  };


  const getStatusStyles = (status: boolean) => {
    return status
      ? { 
          backgroundColor: mergedColors.present_color,
          color: "#212121" 
        }
      : { 
          backgroundColor: mergedColors.absent_color,
          color: "#212121" 
        };
  };
  

  return (
    <TableBody>
      {filteredData.map((row) => (
        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
          {columns.map((column) => {
            if (column.id === "action") {
              return (
                <TableCell key={column.id} sx={{ padding: "8px 16px" }}>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {onEdit && (
                      <Button
                        onClick={() => onEdit(row)}
                        variant="outlined"
                        size="small"
                      >
                        {t("employeeTable.editBtn")}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => onDelete(row.id)}
                      >
                        {t("employeeTable.deleteBtn")}
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => {
                        if (row.employee_id) {
                          downloadEmployeeQRCode(row.employee_id);
                        } else {
                          console.error("Employee ID is missing");
                        }
                      }}
                    >
                      {t("employeeTable.downloadQRCodeBtn")}
                    </Button>
                  </Box>
                </TableCell>
              );
            }

            const value = row[column.id as keyof TableData];
            const { backgroundColor, color } = getBackgroundColor(column.id, value, row.forget_leave, row);

            return (
              <TableCell
                key={`${row.id}-${column.id}`}
                sx={{ padding: "8px 16px"}}
              >
                {column.id === 'status' && typeof value === 'boolean' ? (
                  <Box
                    sx={{
                      backgroundColor,
                      color,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 36,
                      minWidth: 100,
                    }}
                  >
                    {formatValue(value, column.id)}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      backgroundColor,
                      color,
                      borderRadius: 1,
                      display: "inline-block",
                      padding: '4px 8px',
                    }}
                  >
                    {formatValue(value, column.id)}
                  </Box>
                )}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  );
};

export default AttendanceTableBody;