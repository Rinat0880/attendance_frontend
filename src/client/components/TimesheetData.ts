// TimesheetData.ts

export interface TimesheetDay {
    work_day: string; 
    come_time: string | null;
    leave_time: string | null;
    total_hours: string | null;
    weekday?: string; 
  }
  
  export interface TimesheetWeekData {
    [key: string]: TimesheetDay[];
  }
  
  export const intervals = ['0', '1', '2'];
  
