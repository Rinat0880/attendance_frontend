import { Employee, Department } from "../../admin/components/Table/types.ts";
import axios from "axios";

const axiosInstance = () => {
  const defaultOptions = {
    baseURL: process.env.REACT_APP_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };

  let instance = axios.create(defaultOptions);

  instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("access_token");
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async function (error) {
      const originalRequest = error.config;

      const isAuthEndpoint =
        originalRequest.url &&
        (originalRequest.url.includes("/sign-in") ||
          originalRequest.url.includes("/sign-up"));

      if (
        error.response.status === 401 &&
        error.response.data.error === "attempted action is not allowed"
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }

      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        !isAuthEndpoint
      ) {
        originalRequest._retry = true;

        try {
          const refresh_token = localStorage.getItem("refresh_token");
          const access_token = localStorage.getItem("access_token");

          const response = await axios.post(
            process.env.REACT_APP_BASE_URL + "/refresh-token",
            {
              access_token: access_token,
              refresh_token: refresh_token,
            },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          console.log("response: ", response);

          if (response.data?.data?.access_token) {
            localStorage.setItem(
              "access_token",
              response.data.data.access_token
            );
            localStorage.setItem(
              "refresh_token",
              response.data.data.refresh_token
            );

            originalRequest.headers.Authorization = `Bearer ${response.data.data.access_token}`;

            return axios(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          // Optional: redirect to login page
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default axiosInstance;

// setupDashboardSSE.ts
export const setupDashboardSSE = (
  onDataUpdate: (data: {
    colors?: { new_absent_color: string; new_present_color: string };
    employee_list: Employee[];
    total_employee_count: number;
    department: Department[];
    bold: boolean;
  }) => void,
  onError?: (error: Error) => void
) => {
  const sseUrl = `${process.env.REACT_APP_BASE_URL}/user/dashboardlist`;
  const eventSource = new EventSource(sseUrl);

  eventSource.onmessage = (event) => {
    try {
      const rawData = JSON.parse(event.data);
      

      if (!rawData?.data?.results) {
        throw new Error(
          "SSEデータの構造が無効です。サーバーを確認してください。"
        );
      }

      const employee_list: Employee[] = rawData.data.results.flatMap(
        (dept: any) =>
          dept.result.map((emp: any) => ({
            id: emp.id,
            employee_id: emp.employee_id,
            department_id: emp.department_id,
            department_name: emp.department_name,
            department_nickname: emp.department_nickname,
            display_number: emp.display_number,
            last_name: emp.last_name,
            nick_name: emp.nick_name,
            status: emp.status,
          }))
      );

      const department: Department[] = rawData.data.results.map(
        (dept: any) => ({
          department_name: dept.department_name,
          department_nickname: dept.department_nickname,
          display_number: dept.display_number,
          result: dept.result,
        })
      );

      const transformedData = {
        colors: rawData.Colors,
        employee_list,
        total_employee_count: rawData.data.count,
        department,
        bold: rawData.bold
      };
      onDataUpdate(transformedData);
    } catch (error) {
      console.error("SSEデータ処理エラー", error);
      onError && onError(error as Error);
    }
  };

  eventSource.onerror = (error) => {
    console.error("SSEエラー", error);
    onError && onError(new Error("SSE接続エラー"));
    eventSource.close();
  };

  return () => eventSource.close();
};

export const fetchDepartments = async () => {
  try {
    const response = await axiosInstance().get("/department/list");
    if (response.data.status) {
      const departments = response.data.data.results;
      const nextDisplayNumber = response.data.data.displayNumber;
      return { departments, nextDisplayNumber };
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const fetchPositions = async () => {
  try {
    const response = await axiosInstance().get("/position/list");
    if (response.data.status) {
      const positions = response.data.data.results;
      return positions;
    }
  } catch (error) {
    console.error("Error fetching positions:", error);
  }
};

export const createDepartment = async (
  name: string,
  display_number: number,
  department_nickname: string
) => {
  const response = await axiosInstance().post("/department/create", {
    name,
    display_number,
    department_nickname,
  });
  return response.data;
};

export const updateDepartment = async (
  id: number,
  name: string,
  display_number: number,
  department_nickname: string
) => {
  const response = await axiosInstance().patch(`/department/${id}`, {
    name,
    display_number,
    department_nickname,
  });
  return response.data;
};

export const deleteDepartment = async (id: number) => {
  const response = await axiosInstance().delete(`/department/${id}`);
  return response.data;
};

export const createPosition = async (name: string, department_id: number) => {
  const response = await axiosInstance().post("/position/create", {
    name,
    department_id,
  });
  return response.data;
};

export const updatePosition = async (
  id: number,
  name: string,
  department_id: number
) => {
  const response = await axiosInstance().put(`/position/${id}`, {
    name,
    department_id,
  });
  return response.data;
};

export const deletePosition = async (id: number) => {
  const response = await axiosInstance().delete(`/position/${id}`);
  return response.data;
};

export const createUser = async (
  password: string,
  employee_id: string,
  role: string,
  first_name: string,
  last_name: string,
  department_id: number,
  position_id: number | null, // Allow null for optional position
  phone: string,
  email: string,
  nick_name?: string
) => {
  const response = await axiosInstance().post(
    `/user/create`,
    {
      password,
      employee_id,
      role,
      first_name,
      last_name,
      department_id,
      position_id,
      phone,
      email,
      nick_name,
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const updateUser = async (
  id: number,
  employee_id: string,
  password: string,
  role: string,
  first_name: string,
  last_name: string,
  department_id: number,
  position_id: number | null, // Allow null for optional position
  phone: string,
  email: string,
  nick_name?: string
) => {
  const response = await axiosInstance().patch(
    `/user/${id}`,
    {
      password,
      employee_id,
      role,
      first_name,
      last_name,
      department_id,
      position_id,
      phone,
      email,
      nick_name,
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await axiosInstance().delete(`/user/${id}`);
  return response.data;
};

export const uploadExcelFile = async (excell: FormData) => {
  try {
    const endpoint = "user/create_excell";

    const response = await axiosInstance().post(endpoint, excell, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("エラーの詳細：", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config,
      });
    } else {
      console.error("不明なエラー", error);
    }
    throw error;
  }
};

export const downloadSampleFile = async () => {
  try {
    const response = await axiosInstance().get("/user/export_template", {
      responseType: "blob",
    });
    if (response.data) {
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sample.xlsx");

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      return response.data;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "サンプルファイルのダウンロード中にエラーが発生しました。",
        error.response?.data || error.message
      );
    } else {
      console.error("不明なエラー", error);
    }
    throw error;
  }
};

export const createByQRCode = async (employee_id: string) => {
  try {
    const response = await axiosInstance().post("/attendance/createbyqrcode", {
      employee_id,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating record by QR code:", error);
    if (error.response && error.response.data) {
      // Если сервер вернул ответ с ошибкой
      return error.response.data; // Возвращаем данные из ответа
    }
    throw new Error("Network or unexpected error");
  }
};

export const fetchCompanySettings = async () => {
  try {
    const response = await axiosInstance().get("/company_info/list");
    if (response.data.status) {
      return response.data.data;
    }
    throw new Error("Failed to fetch company settings");
  } catch (error) {
    console.error("Error fetching company settings:", error);
    throw error;
  }
};

export const updateCompanySettings = async (settings: FormData) => {
  try {
    const id = settings.get("id");
    if (!id) {
      throw new Error("Company ID is missing");
    }

    const response = await axiosInstance().put(
      `/company_info/${id}`,
      settings,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating company settings:", error);
    throw error;
  }
};

export const downloadEmployeeQRCode = async (employee_id: string) => {
  try {
    const response = await axiosInstance().get(`/user/qrcode`, {
      params: { employee_id },
      responseType: "blob",
    });

    if (response && response.status === 200 && response.data) {
      const blob = new Blob([response.data], { type: "image/png" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `employee_${employee_id}_qrcode.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response.data;
    } else {
      throw new Error(
        "QRコードのダウンロードに失敗しました。サーバーが無効な応答を返しました。"
      );
    }
  } catch (error) {
    console.error(
      "従業員のQRコードのダウンロード中にエラーが発生しました。",
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      console.error("応答ステータス：", error.response.status);
      console.error("応答データ：", error.response.data);
    }
    throw error;
  }
};

export const downloadEmployeeQRCodeByHimself = async (employee_id: string) => {
  try {
    const response = await axiosInstance().get(`/user/qrcodehimself`, {
      params: { employee_id },
      responseType: "blob",
    });

    if (response && response.status === 200 && response.data) {
      const blob = new Blob([response.data], { type: "image/png" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `employee_${employee_id}_qrcode.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response.data;
    } else {
      throw new Error(
        "QRコードのダウンロードに失敗しました。サーバーが無効な応答を返しました。"
      );
    }
  } catch (error) {
    console.error(
      "従業員のQRコードのダウンロード中にエラーが発生しました。",
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      console.error("応答ステータス：", error.response.status);
      console.error("応答データ：", error.response.data);
    }
    throw error;
  }
};

export const fetchQRCodeList = async (): Promise<Blob> => {
  const response = await axiosInstance().get("/user/qrcodelist", {
    responseType: "blob",
  });
  return response.data; // Return the response.data, which will be of type Blob
};
