import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { format } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import AttendanceSummary from './AttendanceSummary.tsx';
import TabsComponent from './TabsComponent.tsx';
import { AxiosError, Column } from '../../admin/components/Table/types.ts';
import axiosInstance from '../../utils/libs/axios.ts';
import axios from 'axios';
import AttendanceTable from '../../admin/components/Table/AttendanceTable.tsx';

interface MainContentProps {
  tabIndex: number;
  handleTabChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
  attendanceSummary: {
    [key: string]: number;
  };
  employeeId: string;
  username: string; 
  tableColumns: Column[];
}

interface DashboardData {
  come_time: string;
  leave_time: string;
  total_hours: string;
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

const MainContent: React.FC<MainContentProps> = ({
  tabIndex,
  handleTabChange,
  attendanceSummary,
  employeeId,
}) => {
  const { t, i18n } = useTranslation(['common', 'user']);
  const [checkInTime, setCheckInTime] = useState<string>('--:--');
  const [checkOutTime, setCheckOutTime] = useState<string>('--:--');
  const [totalHours, setTotalHours] = useState<string>('--:--');
  const [message, setMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState<string>('#000');
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), 'HH:mm:ss'));
  const [loadingCome, setLoadingCome] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [dashboardEmployeeId, setDashboardEmployeeId] = useState<string | null>(null);
  const departments: Department[] = [];
  const positions: Position[] = [];

  const columns: Column[] = [
    { id: 'employee_id', label: t('employeeId') },
    { id: 'full_name', label: t('fullName'), filterable: true },
    { id: 'status', label: t('status'), filterable: true, filterValues: [t('present'), t('absent')] },
  ] as Column[];

  const formatTime = (time: string): string => {
    return time && time !== '--:--' ? time.slice(0, 5) : time;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      let response = await axiosInstance().get<{ data: DashboardData, employee_id: string, status: boolean }>('/user/dashboard');
      console.log(response);   
  
      if (response.data.status) {
        let { come_time, leave_time, total_hours } = response.data.data;
  
        setCheckInTime(formatTime(come_time) || '--:--');
        setCheckOutTime(leave_time === null ? '--:--' : formatTime(leave_time) || '--:--');
        setTotalHours(total_hours || '--:--');
        setDashboardEmployeeId(response.data.employee_id);
      }
    } catch (error) {
      console.error('ダッシュボードデータの取得中にエラーが発生しました。', error);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm:ss'));
    }, 1000);

    fetchDashboardData();

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('あなたのブラウザは位置情報をサポートしていません。'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(position);
          },
          (error) => {
            console.error('位置情報の取得中にエラーが発生しました。', error);
            reject(new Error('位置情報の取得エラー。許可設定が正しいことを確認し、もう一度試してください。'));
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    });
  };

  const sendComeData = async () => {
    if (!dashboardEmployeeId) {
      console.error('Не удалось получить employee_id');
      return;
    }
  
    try {
      const position = await getCurrentPosition();
      const data = {
        employee_id: dashboardEmployeeId, // Используем ID из fetchDashboardData
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
  
      const response = await axiosInstance().post('/attendance/createbyphone', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`データのチェックイン送信中にエラーが発生しました。`, error.response?.data);
      } else {
        console.error(`データのチェックイン送信中に不明なエラーが発生しました。`, error);
      }
      throw error;
    }
  };
  
  const sendLeaveData = async () => {
    if (!dashboardEmployeeId) {
      console.error('Не удалось получить employee_id');
      return;
    }
  
    try {
      const data = {
        employee_id: dashboardEmployeeId,
      };
  
      const response = await axiosInstance().patch('/attendance/exitbyphone', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`データのチェックアウト送信中にエラーが発生しました。`, error.response?.data);
      } else {
        console.error(`データのチェックアウト送信中に不明なエラーが発生しました。`, error);
      }
      throw error;
    }
  };
  
  const handleComeClick = async () => {
    setLoadingCome(true); // Начинаем загрузку
    try {
      const result = await sendComeData();
      if (result && result.status) {
        setCheckInTime(formatTime(result.data.come_time));
        setCheckOutTime(result.data.leave_time === null ? '--:--' : formatTime(result.data.leave_time));
        setMessage(`仕事へようこそ！出勤した時間 ${formatTime(result.data.come_time)}`);
        setMessageColor('#000');
        await fetchDashboardData();
      } else {
        setMessage(result.error || 'しばらくしてからもう一度お試しください。');
        setMessageColor('#ff0000');
      }
    } catch (error) {
      console.error('出勤記録のリクエスト送信中にエラーが発生しました', error);
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        setMessage(axiosError.response.data.error);
      } else {
        setMessage("予期せぬエラーが発生しました");
      }
      setMessageColor('#ff0000');
    } finally {
      setLoadingCome(false);
    }
  };
  
  const handleLeaveClick = async () => {
    setLoadingLeave(true);
    try {
      const result = await sendLeaveData();
      if (result?.status) {
        setCheckOutTime(formatTime(result.data.leave_time));
        setTotalHours(result.data.total_hours);
        setMessage(`退勤した時間 ${formatTime(result.data.leave_time)}`);
        setMessageColor('#000');
        await fetchDashboardData();
      } else {
        setMessage(result.error || 'しばらくしてからもう一度お試しください。');
        setMessageColor('#ff0000');
      }
    } catch (error) {
      console.error('退勤リクエスト中にエラーが発生しました', error);
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        setMessage(axiosError.response.data.error);
      } else {
        setMessage("予期せぬエラーが発生しました");
      }
      setMessageColor('#ff0000');
    } finally {
      setLoadingLeave(false);
    }
  };

  useEffect(() => {
    setLoadingCome(false);
    setLoadingLeave(false);
  }, []);

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: 'white',
        borderRadius: 4,
        boxShadow: 3,
        p: 3,
        overflow: 'hidden',
        textAlign: 'center',
        position: 'relative',
        padding: 1,
      }}
    >
      <TabsComponent tabIndex={tabIndex} handleTabChange={handleTabChange} />

      {tabIndex === 0 && (
        <>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1c1f26' }}>
            {currentTime}
          </Typography>
          <Typography variant="h6" color="#666666" sx={{ fontSize: '0.70rem' }}>
            {format(new Date(), i18n.language === 'ja' ? 'yyyy年MM月dd日 (EEEE)' : 'MMMM d, yyyy (EEEE)', { locale: i18n.language === 'ja' ? ja : enUS })}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#1c1f26' }}>
                {checkInTime}
              </Typography>
              <Typography variant="body2" color="#666666" sx={{ mt: 1 }}>
                {t('user:checkInTime')}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#d6d6d6' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#1c1f26' }}>
                {checkOutTime}
              </Typography>
              <Typography variant="body2" color="#666666" sx={{ mt: 1 }}>
                {t('user:checkOutTime')}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#d6d6d6' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#1c1f26' }}>
                {totalHours}
              </Typography>
              <Typography variant="body2" color="#666666" sx={{ mt: 1 }}>
                {t('user:totalWorkHours')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleComeClick}
              disabled={loadingCome}
              sx={{
                borderRadius: 28,
                mb: '12px',
                backgroundColor: loadingCome ? '#ccc' : '#1cbeca',
                '&:hover': {
                  backgroundColor: loadingCome ? '#ccc' : '#1a9bde',
                },
              }}
            >
              {loadingCome ? '読み込み中' : t('user:checkIn')}
            </Button>

            <Button
              variant="contained"
              onClick={handleLeaveClick}
              disabled={loadingLeave}
              sx={{
                borderRadius: 28,
                mb: '12px',
                backgroundColor: loadingLeave ? '#ccc' : '#ff9500',
                '&:hover': {
                  backgroundColor: loadingLeave ? '#ccc' : '#e88e00',
                },
              }}
            >
              {loadingLeave ? '読み込み中' : t('user:checkOut')}
            </Button>
          </Box>
          {message && (
            <Typography variant="body1" align="center" sx={{ mt: 2, color: messageColor }}>
              {message}
            </Typography>
          )}
        </>
      )}

      {tabIndex === 1 && <AttendanceSummary attendanceSummary={attendanceSummary}/>}

      {tabIndex === 2 && (
        <Box sx={{ overflowX: 'auto' }}>
          <AttendanceTable columns={columns} showCalendar={false} tableTitle={t('common:table.title')} departments={departments}
            positions={positions}/>
        </Box>
      )}
    </Box>
  );
};

export default MainContent;