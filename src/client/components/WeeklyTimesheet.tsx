import React, { useMemo, useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, ButtonGroup } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { intervals } from './TimesheetData.ts';
import { getWeeklyTimesheetData } from './attendanceService.ts';
import { useTranslation } from 'react-i18next';

export interface TimesheetDay {
  work_day: string;
  come_time: string | null;
  leave_time: string | null;
  total_hours: string | null;
}


interface TimeDisplayProps {
  time: string;
  color: string;
}


interface WeeklyTimesheetProps {
  year: number;
  month: number;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ time, color }) => (
  <Typography 
    variant="body2" 
    sx={{ 
      color, 
      fontSize: '16px', 
      fontFamily: 'Roboto Mono', 
      fontWeight: '500',
      width: '4ch',  // Width equal to 5 characters
      display: 'inline-block',
      textAlign: 'center'
    }}
  >
    {time}
  </Typography>
);




const getWeekRangeFromDate = (workDay: string): string => {
  const day = parseInt(workDay.split('-')[2], 10);
  if (day >= 1 && day <= 10) return '0';
  if (day >= 11 && day <= 20) return '1';
  return '2';
};

const formatDay = (day: string): string => {
  const dayNumber = parseInt(day.split('-')[2], 10);
  return String(dayNumber).padStart(2, '0');
};

const formatTime = (time: string | null): string => {
  if (!time || time === '00:00') return '--:--';
  return time;
};

const getTimeColor = (time: string | null): string => {
  if (!time || time === '00:00' || time === '--:--') return '#cccccc';
  const [hours, minutes] = time.split(':').map(Number);
  
  if (hours < 10 || (hours === 10 && minutes <= 30)) {
    return '#00af6c';  
  } else {
    return '#ff9500';  
  }
};

const getTotalHoursColor = (totalHours: string | null): string => {
  if (!totalHours || totalHours === '00:00' || totalHours === '--:--') return '#cccccc';
  return '#2196f3';
};

const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date.getDay() === 0 || date.getDay() === 6;
};

const isAbsent = (day: TimesheetDay): boolean => {
  const today = new Date();
  const dayDate = new Date(day.work_day);
  return dayDate < today && (!day.come_time || day.come_time === '00:00') && (!day.leave_time || day.leave_time === '00:00') && (!day.total_hours || day.total_hours === '00:00');
};

const getIconColor = (day: TimesheetDay, timeType: 'come' | 'leave' | 'total'): string => {
  if (isWeekend(day.work_day)) return '#cccccc';
  if (isAbsent(day)) return '#ff0000';
  return timeType === 'total' ? getTotalHoursColor(day.total_hours) : getTimeColor(day[`${timeType}_time`]);
};


const getJapaneseDateRange = (interval: string, daysInMonth: number, t: any): string => {
  switch (interval) {
    case '0':
      return t('weeklyTimesheet.dateRange.first');
    case '1':
      return t('weeklyTimesheet.dateRange.second');
    case '2':
      return t('weeklyTimesheet.dateRange.third', { lastDay: daysInMonth });
    default:
      return '';
  }
};

const getWeekday = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return t(`weeklyTimesheet.weekdays.${weekdays[date.getDay()]}`);
};

const getDefaultInterval = (): string => {
  const currentDay = new Date().getDate();
  if (currentDay >= 1 && currentDay <= 10) return '0';
  if (currentDay >= 11 && currentDay <= 20) return '1';
  return '2';
};

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({ year, month }) => {
  const { t } = useTranslation('user');
  const [selectedInterval, setSelectedInterval] = useState<string>(getDefaultInterval());
  const [timesheetData, setTimesheetData] = useState<TimesheetDay[] | null>(null);

  const daysInMonth = new Date(year, month, 0).getDate();

  const handleIntervalChange = (interval: string) => {
    setSelectedInterval(interval);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const interval = parseInt(selectedInterval, 10);
        const response = await getWeeklyTimesheetData(year, month, interval);
        if (response && response.data && Array.isArray(response.data.results)) {
          setTimesheetData(response.data.results);
        } else {
          console.error('データ形式が無効です。', response);
        }
      } catch (error) {
        console.error('データの読み込み中にエラーが発生しました。', error);
      }
    };

    fetchData();
  }, [year, month, selectedInterval]);

  const intervalDisplayNames = intervals.map(interval => getJapaneseDateRange(interval, daysInMonth, t));

  const selectedDays = useMemo(() => {
    if (!timesheetData) return [];

    return timesheetData
      .filter(day => {
        const weekRange = getWeekRangeFromDate(day.work_day);
        return weekRange === selectedInterval;
      })
      .sort((a, b) => a.work_day.localeCompare(b.work_day));
  }, [timesheetData, selectedInterval]);

  return (
    <Box id='WEEKLY' sx={{ mb: 3, mt: 3, backgroundColor: '#ffffff', borderRadius: 2, overflow: 'hidden', boxShadow: 1, p: 1 }}>
      {/* Button interval / spacing */}
      <ButtonGroup size='large' variant="outlined" aria-label="выбор интервала" sx={{
        borderColor: 'transparent',
        boxShadow: '0 0 5px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        p: '0.1px',
        mb: '16px',
        width: '100%',
      }}>
        {intervals.map((interval, index) => (
          <Button
            key={interval}
            onClick={() => handleIntervalChange(interval)}
            variant={selectedInterval === interval ? 'contained' : 'outlined'}
            sx={{
              cursor: 'pointer',
              flexGrow: 1,
              borderRadius: '8px',
              borderColor: selectedInterval === interval ? 'transparent' : '#e0e0e0',
              backgroundColor: selectedInterval === interval ? '#105e82' : 'white',
              color: selectedInterval === interval ? 'white' : '#105e82',
              transition: 'all 0.3s ease',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: selectedInterval === interval ? '#0d4b66' : '#f0f0f0',
              },
              '&:focus': {
                outline: 'none',
              },
              '&:not(:last-child)': {
                borderRight: '1px solid #e0e0e0',
              },
              padding: '8px 14px',
              mb: '0.1px',
              minWidth: '80px',
            }}
          >
            {intervalDisplayNames[index]}
          </Button>
        ))}
      </ButtonGroup>
      
      <Grid container spacing={1}>
      {selectedDays.length > 0 ? (
        selectedDays.map((day) => {
          const weekday = getWeekday(day.work_day, t);

          return (
            <Grid item xs={12} key={day.work_day}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                borderRadius: 1,
                p: 1,
                boxShadow: 1,
                height: 'auto',
                flexDirection: 'row',
                textAlign: 'center',
              }}>
                {/* Date and day of the week */}
                <Box sx={{ width: '17%', p: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '16px', fontFamily:'Roboto mono', lineHeight: '1.5' }}>
                    {formatDay(day.work_day)} {weekday}
                  </Typography>
                </Box>

                {/* Entry, exit, total */}
                <Box id='come,leave,total' sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  flexGrow: 1,
                  width: '80%',
                }}>
                  {/* Entry */}
                  <Box id='come' sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 20, color: getIconColor(day, 'come'), mr: 0.5 }} />
                    <TimeDisplay time={formatTime(day.come_time)} color={getTimeColor(day.come_time)} />
                  </Box>

                  {/* Exit */}
                  <Box id='leave' sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    <ExitToAppIcon sx={{ fontSize: 20, color: getIconColor(day, 'leave'), mr: 0.5 }} />
                    <TimeDisplay time={formatTime(day.leave_time)} color={getTimeColor(day.leave_time)} />
                  </Box>

                  {/* Total */}
                  <Box id='total' sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    <TimelapseIcon sx={{ fontSize: 20, color: getIconColor(day, 'total'), mr: 0.5 }} />
                    <TimeDisplay time={formatTime(day.total_hours)} color={getTotalHoursColor(day.total_hours)} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          );
        })
      ) : (
        <Grid item xs={12}>
          <Typography variant="body2" align="center">{t('weeklyTimesheet.noData')}</Typography>
        </Grid>
      )}
    </Grid>
    </Box>
  );
};

export default WeeklyTimesheet;