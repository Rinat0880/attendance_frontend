import React, { useState, useEffect } from "react";
import {
  Table,
  TableContainer,
  Paper,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { TableData, Column } from "./types.ts";
import AttendanceTableHead from "./AttendanceTableHead.tsx";
import AttendanceTableBody from "./AttendanceTableBody.tsx";
import CalendarModal from "./CalendarModal.tsx";
import axiosInstance from "../../../utils/libs/axios.ts";
import { useTranslation } from "react-i18next";
import { Colors, DEFAULT_COLORS  } from "./AttendanceTableBody.tsx";

interface AttendanceTableProps {
  columns: Column[];
  onEdit?: (item: TableData) => void;
  onDelete?: (id: number) => void;
  tableTitle?: string;
  showCalendar?: boolean;
  positions: Position[];
  departments: Department[];
  width?: string;
  height?: string;
}

interface FilterState {
  [key: string]: string[];
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

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  columns,
  onEdit,
  onDelete,
  tableTitle,
  showCalendar = true,
  positions,
  departments,
  width = "100%",
  height = "auto",
}) => {
  const [data, setData] = useState<TableData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<TableData[]>(data);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [pendingSearch, setPendingSearch] = useState("");
  const { t } = useTranslation("common");
  const [colors, setColors] = useState<Colors>(DEFAULT_COLORS);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    department: [],
    position: [],
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const formattedDate = selectedDate
          ? selectedDate.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
  
  
        const response = await axiosInstance().get(
          `/attendance/list?date=${formattedDate}`
        );
        if (response.data.Colors) {  
          setColors(response.data.Colors); 
        } else {
          setColors(DEFAULT_COLORS);
        }

        const formattedData = response.data.data.results.map((item: any) => ({
          id: item.id,
          department: item.department,
          position: item.position,
          employee_id: item.employee_id,
          full_name: item.full_name,
          nick_name: item.nick_name,
          status: item.status,
          work_day: item.work_day,
          come_time: item.come_time,
          leave_time: item.leave_time,
          total_hourse: item.total_hourse,
          forget_leave: item.forget_leave,
        }));


        setData(formattedData);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    fetchEmployeeData();
  }, [selectedDate]);



  useEffect(() => {
    let filtered = data.filter((row) => {
      const matchesSearch = row.full_name
        ? row.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        : false;
  
      const matchesFilters = Object.entries(filters).every(([key, values]) => {
        if (!values || values.length === 0) return true;
        const rowValue = row[key as keyof TableData];
        if (key === "status") {
          return values.includes(rowValue === "present" ? "true" : "false");
        }
        return rowValue ? values.includes(rowValue.toString()) : false;
      });
  
      return matchesSearch && matchesFilters;
    });
  
    const hasActiveFilters = Object.values(filters).some((values) => values.length > 0) || searchTerm.length > 0;
    if (!hasActiveFilters) {
      filtered = filtered.sort((a, b) => {
        const numA = parseInt(a.employee_id.replace(/\D/g, ""), 10);
        const numB = parseInt(b.employee_id.replace(/\D/g, ""), 10);
        return numB - numA; 
      });
    }

    // Sorting logic
    const getSortPriority = (row: TableData) => {
      const priority: number[] = [];

      // For department
      if (filters.department && filters.department.length > 0) {
        const index = filters.department.indexOf(row.department);
        priority.push(index !== -1 ? index : filters.department.length);
      } else {
        priority.push(0);
      }

      // For position
      if (filters.position && filters.position.length > 0) {
        const index = filters.position.indexOf(row.position || "");
        priority.push(index !== -1 ? index : filters.position.length);
      } else {
        priority.push(0);
      }

      return priority;
    };

    const sorted = filtered.sort((a, b) => {
      const aPriority = getSortPriority(a);
      const bPriority = getSortPriority(b);
      for (let i = 0; i < aPriority.length; i++) {
        if (aPriority[i] < bPriority[i]) return -1;
        if (aPriority[i] > bPriority[i]) return 1;
      }
      return 0;
    });

    setFilteredData(sorted);
    setPage(0);
  }, [data, searchTerm, filters]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPendingSearch(event.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(pendingSearch);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleFilterChange = (columnId: string, values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: values,
    }));
  };

  const handleCalendarOpen = () => {
    setCalendarOpen(true);
  };

  const handleCalendarClose = (date: Date | null) => {
    setCalendarOpen(false);
    if (date) {
      setSelectedDate(date);
      // Here you can add logic to filter data by the selected date.
    }
  };
  
  
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );
  

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 4, mb: 5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">{tableTitle || "出勤状況"}</Typography>
        <Box sx={{ display: " flex", justifyContent: "space-between" }}>
          {showCalendar && (
            <IconButton onClick={handleCalendarOpen}>
              <CalendarTodayIcon />
            </IconButton>
          )}
          <TextField
            variant="outlined"
            size="small"
            placeholder={t("table.searchPlaceholder")}
            value={pendingSearch}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: "75%" }}
          />

          <Button
            onClick={handleSearchSubmit}
            variant="contained"
            sx={{ ml: 1, width: "20%", bgcolor: "#105E82", fontSize: "12px" }}
          >
            {t("table.searchBtn")}
          </Button>
        </Box>
      </Box>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <AttendanceTableHead
            departments={departments}
            positions={positions}
            columns={columns}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <AttendanceTableBody
            columns={columns}
            filteredData={paginatedData}
            colors={colors}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 30, 40, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <CalendarModal open={isCalendarOpen} onClose={handleCalendarClose} />
    </Paper>
  );
};

export default AttendanceTable;
