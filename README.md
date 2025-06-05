# Attendance Web  

## Introduction  
**Attendance Web** is a web application designed for monitoring employee attendance and performance. It helps manage attendance data and provides analytical insights to improve team efficiency.  

## Technical Requirements  
1. **Core Technologies:**  
   - TypeScript  
   - React  
   - Material UI  
2. **System Requirements:**  
   - Node.js  
3. **Libraries Used:**  
   - "axios": "^1.7.7"  
   - "date-fns": "^2.30.0"  
   - "dayjs": "^1.11.13"  
   - "dotenv": "^16.4.5"  
   - "i18n": "^0.15.1"  
   - "i18next": "^23.15.1"  
   - "jsqr": "^1.4.0"  
   - "leaflet": "^1.9.4"  

## Project Structure  
src/ ├── @types/ # TypeScript types ├── admin/ # Admin pages ├── client/ # Client-side components ├── shared/ # Shared components and utilities ├── utils/ # Helper functions └── libs/ # API integrations ├── App.test.tsx # Application tests ├── App.tsx # Main component ├── employees.tsx # Employee list page ├── i18n.ts # i18n configuration ├── index.css # Main styles ├── index.tsx # Entry point of the application ├── LanguageSwitcher.tsx # Language switcher component ├── react-app-env.d.ts
├── reportWebVitals.ts
└── setupTests.ts

## Other files:
.env # Environment configuration file
.gitignore # Git ignored files
docker-compose.yml # Docker Compose settings
Dockerfile # Docker image definition
nginx.conf # Nginx configuration
package-lock.json
package.json
tsconfig.json # TypeScript configuration
README.md # Documentation file

## Installation  
1. Ensure that **Node.js** is installed on your machine.  
2. Clone the project repository:  
   ```bash
   git clone <repository-url>
   cd <project-folder>
3. Install the dependencies: **npm install**

## Running and Building
1. To run the project in development mode: **npm start** 
2. To build the project for production: **npm run build**

## API
All API interactions are defined in **utils/libs/axios.ts.**

Base URL: Defined in the **.env** file via the **BASE_URL** variable.
Axios Instance: Used for simplifying API requests.
Example **.env** configuration: **BASE_URL=https://api.example.com**

