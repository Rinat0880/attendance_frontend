import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, IconButton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonthSelectorModal from './MonthSelectorModal.tsx';
import WeeklyTimesheet from './WeeklyTimesheet.tsx';
import { SelectChangeEvent } from '@mui/material';
import { getMonthlyAttendanceData } from './attendanceService.ts';
import { useTranslation } from 'react-i18next';

interface AttendanceSummaryProps {
  attendanceSummary: {
    [key: string]: number;
  };
}

const statusColors = {
  early_come: {
    background: '#f1f1ff',
    textColor: '#7c7cf8',
    lineColor: '#7c7cf8',
    japaneseText: 'early_come', 
  },
  early_leave: {
    background: '#fff5e6',
    textColor: '#ffbd5e',
    lineColor: '#ffbd5e',
    japaneseText: 'early_leave', 
  },
  absent: {
    background: '#ffeceb',
    textColor: '#ff847d',
    lineColor: '#ff847d',
    japaneseText: 'absent', 
  },
  late: {
    background: '#e8eff3',
    textColor: '#2d7392',
    lineColor: '#2d7392',
    japaneseText: 'late', 
  },
};

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ attendanceSummary }) => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<{ [key: string]: number }>({});
  const { t } = useTranslation('user');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setSelectedMonth(event.target.value as number);
    handleClose();
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(event.target.value as number);
  };

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const data = await getMonthlyAttendanceData(selectedYear, selectedMonth);
        const processedData: { [key: string]: number } = Object.fromEntries(
          Object.entries(data.data.results || {}).map(([key, value]) => [key, typeof value === 'number' ? value : 0])
        );
        setMonthlyData(processedData);
      } catch (error) {
        console.error('月次データの読み込み中にエラーが発生しました。', error);
      }
    };

    fetchMonthlyData();
  }, [selectedYear, selectedMonth]);


  return (
    <Box id='attendanceSummary' sx={{ p: '12px', borderRadius: 4, backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <Box sx={{ display: 'flex', marginTop: -3.5, flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
        <Typography variant="h6" sx={{ mt: 1, color: '#111111', alignSelf: 'flex-start', fontSize: '15px' }}>
          {/* TITLE */}
        </Typography>
        <Box id='test2' sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', mb: 0 }}>
        <Typography variant="h6" sx={{ p: 1, color: '#111111', fontSize: '22px', fontWeight: 'medium' }}>
          {selectedYear} {(t('weeklyTimesheet.months', { returnObjects: true }) as string[])[selectedMonth - 1]}
        </Typography>
          <IconButton onClick={handleOpen} sx={{ color: '#111111' }}>
            <CalendarTodayIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid id='test' container spacing={1}>
        {Object.entries(monthlyData).map(([key, value]) => {
          const statusC = statusColors[key as keyof typeof statusColors];
          if (!statusC) {
            return null;
          }

          return (
            <Grid item xs={6} sm={3} key={key}>
              <Paper
                elevation={3}
                sx={{
                  height: 70,
                  p: 2,
                  textAlign: 'left',
                  borderTop: '5',
                  borderColor: 'black',
                  background: statusC.background,
                  position: 'relative',
                  borderRadius: '5px 5px 10px 10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    backgroundColor: statusC.lineColor,
                    borderRadius: '10px 10px 0 0',
                  },
                }}
              >
                <Typography variant="body1" sx={{ color: statusC.textColor, fontSize: '1.2rem' }}>
                  {String(value)}
                </Typography>
                <Typography variant="body2" sx={{ color: statusC.textColor }}>
                  {t(`statusC.${key}`)} {/* Локализуемый текст */}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <MonthSelectorModal
        open={open}
        onClose={handleClose}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
      />

      <WeeklyTimesheet year={selectedYear} month={selectedMonth} />
    </Box>
  );
};

export default AttendanceSummary;