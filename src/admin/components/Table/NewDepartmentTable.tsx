import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  FormGroup,
  FormControlLabel,
  Modal,
  Stack,
  Divider,
  Tooltip,
} from "@mui/material";
import { setupDashboardSSE } from "../../../utils/libs/axios.ts";
import Cookies from "js-cookie"; //
import {
  StyledTableCell,
  EmployeeCell,
  PaginationContainer,
  PageIndicator,
  StyledButtonGroup,
  StyledButton,
  StyledCheckbox,
} from "./NewTableStyles.ts";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Department } from "./types.ts";
import "../../../shared/styles/App.css";

interface DepartmentData {
  department_name: string;
  department_nickname?: string;
  display_number: number;
  result: EmployeeData[];
}

interface EmployeeData {
  id: number;
  employee_id: string;
  department_id: number;
  department_name: string;
  department_nickname?: string;
  display_number: number;
  last_name: string;
  nick_name?: string;
  status: boolean;
}

interface Colors {
  new_absent_color: string;
  new_present_color: string;
}

const NewDepartmentTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [colors, setColors] = useState<Colors>({
    new_absent_color: "#e53935",
    new_present_color: "#fafafa",
  });
  const [isBold, setIsBold] = useState<boolean>(false); // Add state for bold text

  const maxColumnsPerPage = 10;
  const maxEmployeesPerColumn = 20;

  const formatName = (employee: EmployeeData): string => {
    const name = employee.nick_name || employee.last_name || "";
    return name.length > 7 ? `${name.substring(0, 7)}..` : name;
  };

  const formatDepartmentName = (department: DepartmentData): string => {
    const name =
      department.department_nickname || department.department_name || "";
    return name.length > 7 ? `${name.substring(0, 7)}..` : name;
  };

  useEffect(() => {
    const handleSSEMessage = (data: {
      department: Department[];
      colors?: Colors;
      bold?: boolean;
    }) => {
      const { department, colors: newColors, bold } = data;

      if (department && department.length > 0) {
        setDepartmentData(department);
      } else {
        setError("Нет данных для отображения.");
      }

      if (newColors) {
        setColors({
          new_absent_color:
            newColors.new_absent_color || colors.new_absent_color,
          new_present_color:
            newColors.new_present_color || colors.new_present_color,
        });
      }

      if (bold !== undefined) {
        setIsBold(bold);
      }

      setLoading(false);
    };

    const handleSSEError = (error: Error) => {
      console.error("Ошибка SSE:", error);
      setError("Ошибка при загрузке данных.");
      setLoading(false);
    };

    const closeSSE = setupDashboardSSE(handleSSEMessage, handleSSEError);

    return () => closeSSE();
  }, [
    colors.new_absent_color,
    colors.new_present_color,
    selectedDepartments.size,
  ]);

  useEffect(() => {
    if (departmentData.length > 0) {
      const savedSelections = Cookies.get("selectedDepartments");

      if (savedSelections) {
        try {
          const parsedSelections = JSON.parse(savedSelections);
          const validSelections = parsedSelections.filter((dept: string) => 
            departmentData.some(d => d.department_name === dept)
          );

          if (validSelections.length > 0) {
            setSelectedDepartments(new Set(validSelections));
          } 
        } catch (e) {
          setSelectedDepartments(
            new Set(departmentData.map((dept) => dept.department_name))
          );
        }
      } else {
        setSelectedDepartments(
          new Set(departmentData.map((dept) => dept.department_name))
        );
      }
    }
  }, [departmentData]);

  const isAllSelected = useMemo(() => {
    return (
      departmentData.length > 0 &&
      selectedDepartments.size === departmentData.length
    );
  }, [departmentData, selectedDepartments]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDepartments(new Set());
      Cookies.set('selectedDepartments', JSON.stringify([]), { expires: 30 });
    } else {
      const allDepts = departmentData.map((dept) => dept.department_name);
      setSelectedDepartments(new Set(allDepts));
      Cookies.set('selectedDepartments', JSON.stringify(allDepts), { expires: 30 });
    }
    setCurrentPage(1);
  };

  const handleReset = () => {
    const allDepts = departmentData.map((dept) => dept.department_name);
    setSelectedDepartments(new Set(allDepts));
    Cookies.set('selectedDepartments', JSON.stringify(allDepts), { expires: 30 });
    console.log(isBold);
    setCurrentPage(1);
  };

  const handleDepartmentToggle = (deptName: string) => {
    setSelectedDepartments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deptName)) {
        newSet.delete(deptName);
      } else {
        newSet.add(deptName);
      }
      
      Cookies.set('selectedDepartments', JSON.stringify(Array.from(newSet)), { expires: 30 });
      return newSet;
    });
    setCurrentPage(1);
  };

  const filteredDepartmentData = useMemo(() => {
    return departmentData.filter((dept) =>
      selectedDepartments.has(dept.department_name)
    );
  }, [departmentData, selectedDepartments]);

  const pages = useMemo(() => {
    const result: DepartmentData[][] = [];
    let currentPageDepts: DepartmentData[] = [];
    let currentCol = 0;

    filteredDepartmentData.forEach((dept) => {
      const columnsNeeded = Math.ceil(
        dept.result.length / maxEmployeesPerColumn
      );

      if (currentCol + columnsNeeded > maxColumnsPerPage) {
        if (currentPageDepts.length > 0) {
          result.push(currentPageDepts);
          currentPageDepts = [];
        }
        currentCol = 0;
      }

      let remainingEmployees = [...dept.result];
      while (remainingEmployees.length > 0) {
        const chunk = remainingEmployees.splice(0, maxEmployeesPerColumn);
        currentPageDepts.push({
          ...dept,
          result: chunk,
        });
        currentCol++;
      }
    });

    if (currentPageDepts.length > 0) {
      result.push(currentPageDepts);
    }

    return result;
  }, [filteredDepartmentData]);

  useEffect(() => {
    const newTotalPages = Math.max(1, pages.length);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [pages, currentPage]);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const renderTableContent = () => {
    const columnWidth = `${100 / maxColumnsPerPage}%`;
    const currentData = pages[currentPage - 1] || [];

    return Array.from({ length: maxEmployeesPerColumn }, (_, rowIndex) => (
      <TableRow key={rowIndex}>
        {Array.from({ length: maxColumnsPerPage }, (_, colIndex) => {
          const deptChunk = currentData[colIndex];
          const employee = deptChunk ? deptChunk.result[rowIndex] : null;

          return (
            <StyledTableCell
              key={`<span class="math-inline">${colIndex}-</span>${rowIndex}`}
              sx={{ width: columnWidth }}
            >
              {employee && employee.employee_id !== null ? (
                <EmployeeCell status={employee.status} colors={colors}>
                  <span style={{ fontWeight: isBold ? "bold" : "500" }}>
                    {formatName(employee)}
                  </span>
                </EmployeeCell>
              ) : (
                <EmployeeCell status={null} colors={colors}>
                  -
                </EmployeeCell>
              )}
            </StyledTableCell>
          );
        })}
      </TableRow>
    ));
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "0 21px 0 21px",
          height: "38px",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            backgroundColor: "#105E82",
            padding: "10px 15px ",
            "&:hover": {
              backgroundColor: "#0D4D6B",
            },
          }}
        >
          部門を選択
        </Button>
        <PaginationContainer>
          <StyledButtonGroup variant="outlined" size="small" aria-label="Small button group">
            {" "}
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <NavigateBeforeIcon />
            </Button>
            <Button disabled sx={{ pointerEvents: "none" }}>
              <PageIndicator>
                {currentPage} / {Math.max(1, pages.length)}
              </PageIndicator>
            </Button>
            <Button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(Math.max(1, pages.length), prev + 1)
                )
              }
              disabled={currentPage === Math.max(1, pages.length)}
            >
              <NavigateNextIcon />
            </Button>
          </StyledButtonGroup>
        </PaginationContainer>
      </Box>
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            部門の選択
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <StyledCheckbox
                  checked={isAllSelected}
                  indeterminate={selectedDepartments.size > 0 && !isAllSelected}
                  onChange={handleSelectAll}
                />
              }
              label="All"
            />
            <Divider sx={{ my: 1 }} />
            {departmentData.map((dept) => (
              <FormControlLabel
                key={dept.department_name}
                control={
                  <StyledCheckbox
                    checked={selectedDepartments.has(dept.department_name)}
                    onChange={() =>
                      handleDepartmentToggle(dept.department_name)
                    }
                  />
                }
                label={`${formatDepartmentName(dept)} (${dept.display_number})`}
              />
            ))}
          </FormGroup>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <StyledButton
              variant="outlined"
              onClick={handleReset}
              sx={{ flex: 1 }}
            >
              リセット
            </StyledButton>
            <Button
              variant="contained"
              onClick={handleCloseModal}
              sx={{
                flex: 1,
                backgroundColor: "#105E82",
                "&:hover": {
                  backgroundColor: "#0D4D6B",
                },
              }}
            >
              閉じる
            </Button>
          </Stack>
        </Box>
      </Modal>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, overflow: "hidden" }}
      >
        <Table>
          {/* Внутри return JSX компонента */}
          <TableHead>
            <TableRow>
              {/* Всегда рендерим maxColumnsPerPage ячеек заголовка */}
              {Array.from({ length: maxColumnsPerPage }, (_, index) => {
                // Получаем чанк отдела для заголовка на текущей странице
                const deptChunk = pages[currentPage - 1]?.[index];
                // Рассчитываем ширину для единообразия
                const columnWidth = `${100 / maxColumnsPerPage}%`;

                return deptChunk ? (
                  // Если есть данные отдела, показываем имя (с Tooltip)
                  <Tooltip
                    key={index}
                    title={deptChunk.department_name} // Полное имя во всплывающей подсказке
                    arrow
                    className="custom-tooltip" // Если есть стили
                  >
                    <StyledTableCell sx={{ width: columnWidth }}>
                      <strong>{formatDepartmentName(deptChunk)}</strong>
                    </StyledTableCell>
                  </Tooltip>
                ) : (
                  // Иначе, показываем пустую ячейку заголовка
                  <StyledTableCell
                    key={`empty-header-${index}`}
                    sx={{ width: columnWidth }}
                  >
                    <strong>-</strong> {/* Плейсхолдер */}
                  </StyledTableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>{renderTableContent()}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default NewDepartmentTable;
