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
  Modal,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { TableData, Column, FilterState } from "./types.ts";
import AttendanceTableHead from "./AttendanceTableHead.tsx";
import AttendanceTableBody from "./AttendanceTableBody.tsx";
import CalendarModal from "./CalendarModal.tsx";
import axiosInstance from "../../../utils/libs/axios.ts";

interface AttendanceTableProps {
  columns: Column[];
  onEdit?: (item: TableData) => void;
  onDelete?: (id: number) => void;
  tableTitle?: string;
  showCalendar?: boolean;
  width?: string;
  height?: string;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  columns,
  onEdit,
  onDelete,
  tableTitle,
  showCalendar = true,
  width = "100%",
  height = "auto",
}) => {
  const [data, setData] = useState<TableData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [filteredData, setFilteredData] = useState<TableData[]>([]);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [pendingSearch, setPendingSearch] = useState("");

  useEffect(() => {
    // Fetch data from API when component mounts
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const response = await axiosInstance().get("/attendance/list");

        const formattedData = response.data.data.results.map((item: any) => ({
          id: item.id,
          department: item.department,
          position: item.position,
          employee_id: item.employee_id,
          full_name: item.full_name,
          status: item.status,
          work_day: item.work_day,
          come_time: item.come_time,
          leave_time: item.leave_time,
          total_hourse: item.total_hourse,
        }));

        setData(formattedData);
        console.log(formattedData);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    fetchEmployeeData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((row) => {
      const matchesSearch = row.full_name
        ? row.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        : false;

      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const rowValue = row[key as keyof TableData];
        return rowValue
          ? rowValue.toString().toLowerCase() === value.toLowerCase()
          : false;
      });

      return matchesSearch && matchesFilters;
    });

    setFilteredData(filtered);
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

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  const handleCalendarOpen = () => {
    setCalendarOpen(true);
  };

  const handleCalendarClose = () => {
    setCalendarOpen(false);
  };

  // Вычисляем данные для текущей страницы
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <Paper sx={{ width, height, overflow: "hidden", borderRadius: 4, mb: 5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">
          {tableTitle || "Attendance Overview"}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          {showCalendar && (
            <IconButton onClick={handleCalendarOpen}>
              <CalendarTodayIcon />
            </IconButton>
          )}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Quick Search..."
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
            sx={{ ml: 1, width: "20%", bgcolor: "#111111", fontSize: "12px" }}
          >
            Search
          </Button>
        </Box>
      </Box>
      <TableContainer sx={{ maxHeight: height }}>
        {" "}
        {/* Задать высоту контейнеру таблицы */}
        <Table stickyHeader aria-label="sticky table">
          <AttendanceTableHead
            columns={columns}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <AttendanceTableBody
            columns={columns}
            filteredData={paginatedData}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[15, 20]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Modal open={isCalendarOpen} onClose={handleCalendarClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
          }}
        >
          <CalendarModal open={false} onClose={handleCalendarClose} />
        </Box>
      </Modal>
    </Paper>
  );
};
export default AttendanceTable;
