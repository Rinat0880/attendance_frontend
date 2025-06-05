import axios from 'axios';
import axiosInstance from '../../utils/libs/axios.ts';


export const getMonthlyAttendanceData = async (year: number, month: number) => {
  try {
    const monthFormatted = `${year}-${String(month).padStart(2, '0')}-01`;
    const token = localStorage.getItem('access_token');

    const response = await axiosInstance().get('/user/monthly', {
      params: { month: monthFormatted },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error('データ送信中にエラーが発生しました。(Monthly):', error);
    if (axios.isAxiosError(error)) {
      console.error('Axiosエラーの詳細 (Monthly):', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
};
  

export const getWeeklyTimesheetData = async (year: number, month: number, interval: number = 0) => {
  try {
    const monthFormatted = `${year}-${String(month).padStart(2, '0')}-01`;
    const token = localStorage.getItem('access_token');

    const response = await axiosInstance().get('/user/statistics', {
      params: {
        month: monthFormatted,
        interval: interval,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('データ送信中にエラーが発生しました。 (Weekly):', error);
    if (axios.isAxiosError(error)) {
      console.error('Axiosエラーの詳細 (Weekly):', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
    }
    throw error;
  }
};
  
