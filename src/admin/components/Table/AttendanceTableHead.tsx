import React, { useState } from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  Popover,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Column, FilterState } from "./types.ts";

interface AttendanceTableHeadProps {
  columns: Column[];
  filters: FilterState;
  onFilterChange: (columnId: string, values: string[]) => void;
  departments: Department[];
  positions: Position[];
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

const AttendanceTableHead: React.FC<AttendanceTableHeadProps> = ({
  columns,
  filters,
  onFilterChange,
  departments,
  positions,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentFilter, setCurrentFilter] = useState<string>("");

  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: string[];
  }>({
    status: filters.status || [],
    department: filters.department || [],
    position: filters.position || [],
    role: filters.role || [], // Add role filter
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>, columnId: string) => {
    setAnchorEl(event.currentTarget);
    setCurrentFilter(columnId);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onFilterChange(currentFilter, selectedItems[currentFilter]);
    handleClose();
  };

  const handleCheckboxChange = (columnId: string, value: string) => {
    setSelectedItems((prev) => {
      const currentSelected = prev[columnId] || [];
      const newSelected = currentSelected.includes(value)
        ? currentSelected.filter((item) => item !== value)
        : [...currentSelected, value];

      return {
        ...prev,
        [columnId]: newSelected,
      };
    });
  };

  const getFilterOptions = (columnId: string) => {
    switch (columnId) {
      case "status":
        return [
          { label: "Present", value: "true" }, 
          { label: "Absent", value: "false" }
        ]; 
      case "department":
        return departments.map((dept) => ({ label: dept.name, value: dept.name }));
      case "position":
        return positions.map((pos) => ({ label: pos.name, value: pos.name }));
      case "role":
        return [
          { label: "Admin", value: "ADMIN" },
          { label: "Employee", value: "EMPLOYEE" }
        ];
      default:
        return [];
    }
  };

  const open = Boolean(anchorEl);

  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell 
            key={column.id}
            sx={{
              backgroundColor: '#FFFFFF',
              borderBottom: '2px solid #e0e0e0',
              padding: '12px 8px',
              height: '48px', 
              whiteSpace: 'nowrap', 
            }}
          >
            {["status", "position", "department", "role"].includes(column.id) ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5, 
                height: '100%',
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#333',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {column.label}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  {selectedItems[column.id]?.length > 0 && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        bgcolor: '#105E82',
                        color: 'white',
                        borderRadius: '12px',
                        px: 1,
                        py: 0.25,
                        fontSize: '0.7rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: '20px',
                        ml: 0.5,
                      }}
                    >
                      {selectedItems[column.id].length}
                    </Typography>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => handleClick(e, column.id)}
                    sx={{
                      padding: 0.5,
                      ml: 0.5 ,
                      '&:hover': {
                        backgroundColor: 'rgba(16, 94, 130, 0.1)',
                      },
                      ...(selectedItems[column.id]?.length > 0 && {
                        color: '#105E82',
                      }),
                    }}
                  >
                    <FilterListIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: '#333',
                }}
              >
                {column.label}
              </Typography>
            )}
          </TableCell>
        ))}
      </TableRow>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          }
        }}
      >
        <Box
          sx={{
            p: 2,
            minWidth: 200,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: "#333",
            }}
          >
            {columns.find((col) => col.id === currentFilter)?.label}を選択
          </Typography>
          <FormGroup>
            {getFilterOptions(currentFilter).map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={selectedItems[currentFilter]?.includes(option.value)}
                    onChange={() => handleCheckboxChange(currentFilter, option.value)}
                    sx={{
                      color: "#105E82",
                      "&.Mui-checked": {
                        color: "#105E82",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.9rem" }}>{option.label}</Typography>
                }
                sx={{
                  marginY: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              />
            ))}
          </FormGroup>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
              pt: 2,
              borderTop: "1px solid #eee",
              gap: 1,
            }}
          >
            <Button
              size="small"
              onClick={() => {
                setSelectedItems((prev) => ({ ...prev, [currentFilter]: [] }));
              }}
              sx={{
                color: "#666",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              リセット
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleApply}
              sx={{
                bgcolor: "#105E82",
                "&:hover": {
                  bgcolor: "#0d4d6b",
                },
              }}
            >
              適用
            </Button>
          </Box>
        </Box>
      </Popover>
    </TableHead>
  );
};

export default AttendanceTableHead;