import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LineChartComponent from "../components/LineChart.tsx";
import PieChartWithCustomizedLabel from "../components/pie.tsx";
import SimpleBarChart from "../components/Bar.tsx";
import AttendanceTable from "../components/Table/AttendanceTable.tsx";
import { Column } from "../components/Table/types.ts";
import axiosInstance, { fetchDepartments, fetchPositions } from '../../utils/libs/axios.ts';

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

function AdminDashboardContent() {
  const { t } = useTranslation('admin');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({
    total_employee: 0,
    ontime: 0,
    absent: 0,
    late_arrival: 0,
    early_departures: 0,
    early_come: 0,
  });

  const columns: Column[] = [
    { id: 'employee_id', label: t('employeeId') },
    { id: 'full_name', label: t('fullName'), filterable: true },
    { id: 'nick_name', label: t('nickName')},
    { id: 'department', label: t('department'), filterable: true },
    { id: 'position', label: t('position'), filterable: true },
    { id: 'work_day', label: t('workDay') },
    { id: 'status', label: t('status'), filterable: true },
    { id: 'come_time', label: t('comeTime') },
    { id: 'leave_time', label: t('leaveTime') },
    { id: 'total_hourse', label: t('totalHours') },
  ] as Column[];

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      try {
        const response = await axiosInstance().get("/attendance");
        if (response.status === 200 && response.data.status) {
          setAttendanceStats(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching attendance data:", err);
      }
    };

    fetchAttendanceStats();
  }, []);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await fetchDepartments();
  
        if (response) {
          const { departments, nextDisplayNumber } = response;
          if (departments && nextDisplayNumber !== undefined) {
            setDepartments(departments);
          }
        }
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };
  
    const loadPositions = async () => {
      try {
        const response = await fetchPositions();
        setPositions(response); 
      } catch (error) {
        console.error("Failed to fetch positions", error);
      }
    };
  
    loadDepartments();
    loadPositions();
  }, []);
  

  return (
    <>
      <div className="DashboardContainer">
        <div className="Chart-2">
          <PieChartWithCustomizedLabel />
        </div>
        <div className="Cards">
          <div className="Card">
            <div className="data">
              <p className="Card-amount">{attendanceStats.total_employee}</p>
              <p className="Card-text">{t('totalEmployee')}</p>
            </div>
            <div className="icon">
              <img src={require("../../shared/png/total_employees.png")} alt={t('totalEmployeesIconAlt') || 'Total Employees'} />
            </div>
          </div>
          <div className="Card">
            <div className="data">
              <p className="Card-amount">{attendanceStats.ontime}</p>
              <p className="Card-text">{t('onTime')}</p>
            </div>
            <div className="icon">
              <img src={require("../../shared/png/on_time.png")} alt={t('onTimeIconAlt') || 'On Time'} />
            </div>
          </div>
          <div className="Card">
            <div className="data">
              <p className="Card-amount">{attendanceStats.absent}</p>
              <p className="Card-text">{t('absent')}</p>
            </div>
            <div className="icon">
              <img src={require("../../shared/png/absent.png")} alt={t('absentIconAlt') || 'Absent'} />
            </div>
          </div>
          <div className="Card">
            <div className="data">
              <p className="Card-amount">{attendanceStats.late_arrival}</p>
              <p className="Card-text">{t('lateArrival')}</p>
            </div>
            <div className="icon">
              <img src={require("../../shared/png/late_arrival.png")} alt={t('lateArrivalIconAlt') || 'Late Arrival'} />
            </div>
          </div>
          <div className="Card">
            <div className="data">
              <p className="Card-amount">{attendanceStats.early_departures}</p>
              <p className="Card-text">{t('earlyDepartures')}</p>
            </div>
            <div className="icon">
              <img src={require("../../shared/png/early_departures.png")} alt={t('earlyDeparturesIconAlt') || 'Early Departures'} />
            </div>
          </div>
          <div className="Card">
            <div className="data">
              <p className="Card-amount">{attendanceStats.early_come}</p>
              <p className="Card-text">{t('earlyCome')}</p>
            </div>
            <div className="icon">
              <img src={require("../../shared/png/time-off.png")} alt={t('earlyComeIconAlt') || 'Early Come'} />
            </div>
          </div>
        </div>
      </div>
      <div className="Charts">
        <div className="Chart-1">
          <LineChartComponent />
        </div>
        <div className="Chart-3">
          <SimpleBarChart />
        </div>
      </div>
      <div className="TableSection">
        <AttendanceTable departments={departments} positions={positions} columns={columns} showCalendar={true} tableTitle={t('common:table.title')} />
      </div>
    </>
  );
}

export default AdminDashboardContent;
