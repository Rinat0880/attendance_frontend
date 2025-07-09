# Attendance Management System - Frontend

A comprehensive React-based attendance management system with role-based access control, QR code scanning, and real-time dashboard capabilities.

## 🚀 Features

### Multi-Role Authentication
- **Admin Dashboard**: Complete system management and analytics
- **Employee Portal**: Personal attendance tracking and timesheet management
- **QR Code Scanner**: Dedicated QR scanning interface for attendance tracking
- **Dashboard Display**: Large screen display for office attendance overview
- **Google OAuth Integration**: Seamless authentication with Google accounts

## Key Components

#### 1. **New Department Table** (`NewDepartmentTable.tsx`)
A large-screen optimized attendance display component designed for office dashboards:
- Real-time attendance status updates via Server-Sent Events (SSE)
- Responsive grid layout adapting to different screen sizes (1024px to 4K)
- Department-based employee grouping with customizable display
- Color-coded attendance status with configurable themes
- Pagination support for large employee datasets
- Department filtering and selection capabilities
- **Usage**: Perfect for wall-mounted displays showing current office attendance

#### 2. **QR Code Scanner** (`QrCodeScanner.tsx`)
High-performance QR code scanning interface:
- Real-time camera feed with optimized scanning area
- Fast QR code detection using jsQR library
- Automatic attendance logging upon successful scan
- Visual feedback with success/error animations
- Support for both front and rear cameras
- **Usage**: Stationed at office entrances for quick check-in/check-out

#### 3. **Attendance Table** (`AttendanceTable.tsx`)
Comprehensive attendance management interface:
- Filterable and searchable employee records
- Date range selection with calendar integration
- Export functionality for attendance reports
- Real-time status updates with color coding
- Pagination and sorting capabilities
- Multi-language support (Japanese/English)
- **Usage**: Admin interface for detailed attendance management

#### 4. **Employee Dashboard** (`MainContent.tsx`)
Personal attendance portal for employees:
- Real-time clock with current date display
- Check-in/Check-out functionality with GPS validation
- Personal timesheet with weekly/monthly views
- Attendance statistics and summaries
- Mobile-optimized responsive design
- **Usage**: Employee self-service portal

#### 5. **Company Settings** (`CompanySettingsPage.tsx`)
Administrative configuration interface:
- Company location settings with interactive map
- Working hours and overtime configuration
- Color theme customization for attendance status
- Logo and company information management
- Attendance rules and late time thresholds
- **Usage**: System configuration by administrators

## 🛠 Technology Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Internationalization**: react-i18next
- **Date Handling**: date-fns
- **QR Code**: jsQR library
- **Charts**: Recharts & MUI X Charts
- **Maps**: Leaflet with OpenStreetMap
- **Camera**: react-webcam
- **File Handling**: PapaParse (CSV), SheetJS (Excel)

## 📁 Project Structure

```
src/
├── admin/                          # Admin-specific components
│   ├── components/
│   │   ├── Table/
│   │   │   ├── NewDepartmentTable.tsx    # Large screen attendance display
│   │   │   ├── AttendanceTable.tsx       # Standard attendance table
│   │   │   ├── EmployeeTable.tsx         # Employee management table
│   │   │   └── ...
│   │   ├── DepartmentDialog.tsx          # Department management modal
│   │   ├── ColorPicker.tsx               # Theme customization component
│   │   └── MapComponent.tsx              # Interactive location picker
│   └── pages/
│       ├── AdminDashboard.tsx            # Main admin interface
│       ├── CompanySettingsPage.tsx       # System configuration
│       └── DepartmentPositionManagement.tsx
├── client/                         # Employee/Client components
│   ├── components/
│   │   ├── Header.tsx                    # Navigation header
│   │   ├── MainContent.tsx               # Employee dashboard
│   │   ├── AttendanceSummary.tsx         # Personal attendance stats
│   │   ├── WeeklyTimesheet.tsx           # Weekly attendance view
│   │   └── TabsComponent.tsx             # Tab navigation
│   └── pages/
│       ├── LoginPage.tsx                 # Authentication interface
│       ├── DashboardPage.tsx             # Employee main page
│       ├── QrCodeScanner.tsx             # QR scanning interface
│       └── BigTable.tsx                  # Large screen display page
├── shared/                         # Shared utilities
│   ├── protection/
│   │   └── ProtectedRoute.tsx            # Route authentication
│   └── styles/
│       └── App.css                       # Global styles
└── utils/
    └── libs/
        └── axios.ts                      # API configuration & interceptors
```

## 🎨 Key Features by User Role

### **Admin Users**
- Complete dashboard with attendance analytics
- Employee management (CRUD operations)
- Department and position management
- Excel import/export functionality
- QR code generation for employees
- Company settings configuration
- Real-time attendance monitoring

### **Regular Employees**
- Personal check-in/check-out interface
- Attendance history and statistics
- Weekly/monthly timesheet views
- QR code download for personal use
- Multi-language interface

### **QR Scanner Role**
- Dedicated QR scanning interface
- Optimized for tablet/mobile devices
- Real-time attendance processing
- Visual feedback for scan results

### **Dashboard Display Role**
- Large screen attendance overview
- Real-time updates via SSE
- Department-based grouping
- Color-coded status indicators
- Responsive scaling for different screen sizes

## 🌐 Internationalization

The application supports multiple languages:
- **Japanese (ja)**: Primary language
- **English (en)**: Secondary language

Language switching is available through the UI, with automatic locale detection and persistence.

## 🔐 Security Features

- JWT token-based authentication
- Automatic token refresh
- Role-based access control

## 📊 Real-time Features

The application uses Server-Sent Events (SSE) for real-time updates:
- Live attendance status changes
- Real-time employee count updates
- Instant dashboard refreshes
- Color theme updates

## 🔧 Customization

### Color Themes
Administrators can customize attendance status colors through the settings interface:
- Present/Absent status colors
- Check-in/Check-out time colors
- Warning and error state colors

### Display Settings
- Toggle bold text for better visibility on large screens
- Configurable department display names
- Adjustable grid layouts for different screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd attendance-frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

4. Start the development server
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Environment Variables

```env
REACT_APP_BASE_URL=http://localhost:8000
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

---