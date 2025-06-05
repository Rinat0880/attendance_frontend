import React from "react";
import { TableBody, TableRow, TableCell, Box, Button } from "@mui/material";
import { TableData, Column, DateOrString } from "./types.ts";

interface AttendanceTableBodyProps {
  columns: Column[];
  filteredData: TableData[];
  onEdit?: (item: TableData) => void;
  onDelete?: (id: number) => void;
}

const formatValue = (value: DateOrString | boolean, key?: string): string => {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'Present' : 'Absent';
  }
  if (value instanceof Date) {
    if (key === 'date') {
      return value.toISOString().split('T')[0];
    } else if (key === 'checkIn' || key === 'checkOut') {
      return value.toTimeString().split(' ')[0];
    }
    return value.toLocaleString();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
};

const getStatusStyles = (status: boolean): { backgroundColor: string; color: string } => {
  return status
    ? { backgroundColor: '#e6effc', color: '#0764e6' }
    : { backgroundColor: '#ffe5ee', color: '#aa0000' };
};

const AttendanceTableBody: React.FC<AttendanceTableBodyProps> = ({ 
  columns, 
  filteredData, 
  onEdit, 
  onDelete 
}) => {
  return (
    <TableBody>
      {filteredData.map((row) => (
        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
          {columns.map((column) => {
            if (column.id === 'action') {
              return (
                <TableCell key={column.id} sx={{ padding: '8px 16px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {onEdit && (
                      <Button onClick={() => onEdit(row)} variant="outlined" size="small">
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => onDelete(row.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </Box>
                </TableCell>
              );
            }

            const value = row[column.id as keyof TableData];
            const { backgroundColor, color } = column.id === 'status' && typeof value === 'boolean'
              ? getStatusStyles(value as boolean)
              : { backgroundColor: '#fff', color: '#000' };

            return (
              <TableCell key={column.id} sx={{ padding: '8px 16px' }}>
                <Box
                  sx={{
                    backgroundColor,
                    color,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 36,
                    minWidth: 120,
                  }}
                >
                  {formatValue(value, column.id)}
                </Box>
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  );
};

export default AttendanceTableBody;
