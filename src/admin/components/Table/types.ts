// src/admin/components/Table/types.ts

export type DateOrString = Date | string | number | undefined;

export interface FilterState {
    [key: string]: string[];
  }

export interface TableData {
    id: number;
    employee_id: string;
    password: string;
    role: string;
    full_name: string;
    last_name: string;
    first_name: string;
    department: string;
    department_id?: number;
    position: string;
    position_id?: number;
    date?: DateOrString;
    status?: boolean;
    come_time?: DateOrString;
    leave_time?: DateOrString;
    totalHrs?: number;
    phone?: string;
    email?: string;
    nick_name: string;
    forget_leave: boolean;
    apsent_color?: string;
    come_time_color?: string;
    forget_time_color?: string;
    leave_time_color?: string;
    present_color?: string;
  }

export interface Column {
    id: keyof TableData | 'action';
    label: string;
    filterable?: boolean;
    filterValues?: string[];
  }

  export interface Employee {
    id: number;
    employee_id: string;
    department_id: number;
    department_name: string;
    display_number: number;
    full_name?: string;
    last_name: string;
    first_name?: string;
    status: boolean;
}

export interface Department {
    department_name: string;
    display_number: number;
    result: Employee[];
}

export interface ApiResponseData {
    count: number;
    results: Department[];
}

export interface ApiResponse {
    data: ApiResponseData;
    status: boolean;
}

export interface AxiosError extends Error {
  response?: {
    headers: any;
    data: {
      error: string;
    };
  };
}

export interface FormErrors {
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  nick_name?: string;
  password?: string;
  role?: string;
  department?: string;
  position?: string;
  phone?: string;
  email?: string;
  general?: string; 
}