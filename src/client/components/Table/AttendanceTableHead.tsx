import React from "react";
import { TableHead, TableRow, TableCell, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { Column, FilterState } from "./types.ts";

interface AttendanceTableHeadProps {
  columns: Column[];
  filters: FilterState;
  onFilterChange: (columnId: string, value: string) => void;
}

const AttendanceTableHead: React.FC<AttendanceTableHeadProps> = ({ columns, filters, onFilterChange }) => {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell key={column.id}>
            {['status', 'role', 'department'].includes(column.id) ? (
              <Select
                value={filters[column.id] || ''}
                onChange={(e: SelectChangeEvent<string>) => onFilterChange(column.id, e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (selected === '') {
                    return column.label;
                  }
                  return selected;
                }}
                sx={{
                  '.MuiSelect-select': {
                    padding: 0,
                    minWidth: 120,
                    border: 'none'
                  },
                  '.MuiOutlinedInput-notchedOutline': { border: 0 }
                }}
              >
                <MenuItem value="">{column.label}</MenuItem>
                {column.filterValues && column.filterValues.map((value) => (
                  <MenuItem key={value} value={value}>{value}</MenuItem>
                ))}
              </Select>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default AttendanceTableHead;