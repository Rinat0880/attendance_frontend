# Employee Attendance Management System

A comprehensive web-based attendance tracking system built with React and TypeScript. This system allows companies to manage employee attendance through QR codes, geolocation, and manual check-ins, with real-time dashboards and detailed reporting.

## 🌟 Features

### For Employees
- **QR Code Check-in/Check-out**: Scan QR codes to mark attendance
- **Geolocation-based Attendance**: Check-in using location within company radius
- **Personal Dashboard**: View daily attendance, weekly timesheets, and statistics
- **Mobile-responsive Design**: Works seamlessly on smartphones and tablets
- **Multi-language Support**: Japanese and English interface

### For Administrators
- **Real-time Attendance Dashboard**: Live updates of employee attendance status
- **Employee Management**: Create, edit, delete employee records
- **Department & Position Management**: Organize employees by departments and roles
- **Excel Import/Export**: Bulk employee data management
- **Interactive Charts**: Visual attendance statistics and trends
- **Company Settings**: Configure work hours, location, colors, and attendance rules
- **QR Code Generation**: Generate individual or bulk QR codes for employees

### Advanced Features
- **Server-Sent Events (SSE)**: Real-time updates without page refresh
- **Color Customization**: Customize interface colors for different attendance statuses
- **Interactive Maps**: Set company location and attendance radius using Leaflet maps
- **Comprehensive Filtering**: Advanced table filtering and search functionality
- **Role-based Access Control**: Admin and Employee roles with different permissions

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **MUI X Charts** for data visualization
- **React Router** for navigation
- **i18next** for internationalization
- **Leaflet** for interactive maps
- **Axios** for HTTP requests
- **date-fns** for date manipulation

### Key Libraries
- `jsqr` - QR code scanning
- `react-webcam` - Camera access for QR scanning
- `js-cookie` - Cookie management
- `react-leaflet` - Map integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16.0 or higher)
- **npm** or **yarn** package manager
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Backend API server** (not included in this repository)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd attendance-management-system
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_BASE_URL=http://localhost:8000/api
REACT_APP_API_BASE_URL=http://localhost:8000

# Google OAuth (optional)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# Other configurations
GENERATE_SOURCEMAP=false
```

### 4. Start Development Server
```bash
npm start
# or
yarn start
```

The application will open at `http://localhost:3000`

## 🔧 Configuration

### API Integration
The system expects a REST API backend. Key endpoints include:

```typescript
// Authentication
POST /sign-in
POST /refresh-token

// User Management
GET /user/list
POST /user/create
PUT /user/{id}
DELETE /user/{id}

// Attendance
GET /attendance/list
POST /attendance/createbyqrcode
POST /attendance/createbyphone

// Company Settings
GET /company_info/list
PUT /company_info/{id}

// Departments & Positions
GET /department/list
POST /department/create
GET /position/list
POST /position/create
```

### Geolocation Settings
Configure company location and attendance radius in the admin panel:
1. Go to **Company Settings**
2. Set **Company Coordinates** (latitude, longitude)
3. Define **Attendance Radius** in meters
4. Save settings

## 📱 Usage Guide

### For Employees

#### 1. Login
- Access the application at your company's URL
- Enter your employee ID and password
- Or use Google OAuth if configured

#### 2. Check-in/Check-out Options

**QR Code Method:**
- Navigate to QR Scanner
- Scan your personal QR code
- System will automatically record attendance

**Manual Method:**
- Click "Come" button on dashboard
- Allow location access when prompted
- System verifies you're within company radius

#### 3. View Attendance
- Dashboard shows today's check-in/out times
- **Attendance Summary** tab displays monthly statistics
- **Weekly Timesheet** shows detailed daily records

### For Administrators

#### 1. Access Admin Panel
- Login with admin credentials
- Navigate to admin dashboard

#### 2. Employee Management
- **Create Employees**: Add individual employees or upload Excel files
- **Edit Information**: Update employee details, departments, positions
- **Generate QR Codes**: Create QR codes for attendance tracking

#### 3. Monitor Attendance
- **Real-time Dashboard**: View live attendance status
- **Attendance Table**: Filter and search attendance records
- **Charts & Analytics**: Analyze attendance trends and patterns

#### 4. System Configuration
- **Company Settings**: Configure work hours, location, colors
- **Departments & Positions**: Organize company structure
- **Color Customization**: Customize interface appearance

## 🎨 Customization

### Color Themes
Administrators can customize colors for different attendance statuses:
- Present/Absent indicators
- Time-based color coding
- Table highlighting
- Chart colors

### Language Support
The system supports:
- Japanese (日本語) - Default
- English

Add new languages by extending the i18n configuration in `src/i18n.ts`.

## 📊 Data Management

### Excel Import/Export
**Import Employees:**
1. Download sample Excel template
2. Fill employee information
3. Upload via admin panel
4. System validates and imports data

**Export Data:**
- Employee lists
- Attendance records
- QR codes (PDF format)

### Data Validation
The system includes comprehensive validation for:
- Employee ID uniqueness
- Email format validation
- Required field validation
- Department/Position relationships

## 🔐 Security Features

- **JWT Authentication** with automatic token refresh
- **Role-based Access Control** (Admin/Employee)
- **Route Protection** prevents unauthorized access
- **Input Validation** on all forms
- **Secure Cookie Handling** for session management

## 🚀 Deployment

### Production Build
```bash
npm run build
# or
yarn build
```

### Environment Variables for Production
```env
REACT_APP_BASE_URL=https://your-api-domain.com/api
GENERATE_SOURCEMAP=false
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Web Servers**: Nginx, Apache
- **Cloud Platforms**: AWS S3, Google Cloud Storage

## 🔧 Troubleshooting

### Common Issues

**1. QR Code Scanner Not Working**
- Ensure HTTPS connection (required for camera access)
- Check browser permissions for camera
- Verify lighting conditions for QR code visibility

**2. Geolocation Issues**
- Enable location services in browser
- Check company radius settings
- Ensure GPS accuracy on mobile devices

**3. Login Problems**
- Verify API endpoint configuration
- Check network connectivity
- Clear browser cache and cookies

**4. Real-time Updates Not Working**
- Check Server-Sent Events (SSE) support
- Verify WebSocket connections
- Check firewall settings

### Browser Compatibility
- **Chrome**: Fully supported
- **Firefox**: Fully supported
- **Safari**: Supported (iOS 12+)
- **Edge**: Supported

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For support and questions:
1. Check the troubleshooting section above
2. Review the project documentation
3. Create an issue in the repository
4. Contact your system administrator

## 📈 Roadmap

Future enhancements may include:
- Mobile application (React Native)
- Biometric authentication
- Advanced reporting features
- Integration with HR systems
- Multi-company support
- Shift scheduling
- Overtime calculations

---

## Quick Start Checklist

- [ ] Node.js installed (v16+)
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment file configured (`.env`)
- [ ] Backend API running
- [ ] Development server started (`npm start`)
- [ ] Admin account created
- [ ] Company settings configured
- [ ] Test employee created
- [ ] QR codes generated
