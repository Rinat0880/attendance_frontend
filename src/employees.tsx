export interface Employee {
    id: string;
    username: string;
    password: string;
    role: 'ADMIN' | 'EMPLOYEE' | 'QRCODE' |'DASHBOARD'; 
    checkInTime: Date | null;
    checkOutTime: Date | null;
    location: string;
    position: string; // Новый тип для позиции
    status: 'Present' | 'Absent' | 'EarlyLeave' ; // Оставляем как есть
    attendanceSummary: {
      earlyLeaves: number;
      absences: number;
      lateIns: number;
      leaves: number;
    };
  }
  
  export const employees: Employee[] = [
    {
      id: '1',
      username: 'Cat',
      password: 'cat123',
      role: 'ADMIN',
      checkInTime: new Date(),  
      checkOutTime: null, 
      location: 'office',      
      position: 'Administrator',
      status: 'Present',
      attendanceSummary: {
        earlyLeaves: 1,
        absences: 2,
        lateIns: 3,
        leaves: 4
      }
    },
    {
      id: '2',
      username: 'Dog',
      password: 'dog123',
      role: 'EMPLOYEE',
      checkInTime: new Date(),  
      checkOutTime: null, 
      location: 'office',      
      position: 'developer',
      status: 'Present',
      attendanceSummary: {
        earlyLeaves: 0,
        absences: 0,
        lateIns: 0,
        leaves: 0
      }
    },
    
  ];
