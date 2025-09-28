# 🎨 Frontend Overview

<div align="center">

*Modern React frontend for HR-Admin-Hamere-Birhan management system*

</div>

## 🏗️ Architecture Overview

The frontend is built with **React 18** and **TypeScript** for type-safe development, featuring a component-based architecture.

## 📁 Project Structure
└── 📁HR_frontend
        └── 📁api
            └── 📁attendance
                └── 📁overview
                    ├── route.js
                └── 📁savetoDB
                    ├── route.js
            └── 📁complaints
                ├── route.js
            └── 📁overtime
                └── 📁[id]
                    ├── route.js
                └── 📁approve
                    └── 📁[id]
                        ├── route.js
                ├── route.js
            └── 📁salary
                └── 📁dashboard
                    ├── route.js
                └── 📁pay
                    └── 📁[id]
                        ├── route.js
                ├── route.js
        └── 📁app
            └── 📁(HOME)
                └── 📁EnrolledEqub
                    ├── page.jsx
            └── 📁(HR)
                └── 📁attendance-overview
                    ├── page.jsx
                └── 📁complain_received
                    └── 📁components
                        ├── ComplainList.jsx
                        ├── ComplaintDetailModal.jsx
                    ├── page.jsx
                └── 📁dashboard
                    └── 📁components
                        ├── AttendanceChart.jsx
                        ├── AttendanceLeaveInfoCard.jsx
                        ├── AttractiveThemeToggle.jsx
                        ├── calendar.css
                        ├── ComplaintsCard.jsx
                        ├── DashboardCalendar.jsx
                        ├── DepartmentHeadsCard.jsx
                        ├── FullListView.jsx
                        ├── InfoWidgets.jsx
                        ├── MeetingSchedule.jsx
                        ├── PendingRequestsCard.jsx
                        ├── SummaryCard.jsx
                        ├── ThemeToggle.jsx
                    ├── loading.jsx
                    ├── page.jsx
                    ├── re.jsx
                └── 📁departments
                    └── 📁components
                        ├── AddEditDepartmentModal.jsx
                        ├── DepartmentCard.jsx
                        ├── DepartmentCarousel.jsx
                        ├── DepartmentDetailView.jsx
                        ├── PayrollPolicyEditor.jsx
                    ├── page.jsx
                └── 📁edit-attendance
                    ├── page.jsx
                └── 📁emp_profile_list
                    └── 📁[id]
                        ├── page.jsx
                    └── 📁components
                        ├── CreateEmployeeModal.jsx
                        ├── EmployeeCard.jsx
                        ├── SearchableDropdown.jsx
                    ├── page.jsx
                └── 📁leave_request
                    └── 📁components
                        ├── StatusDropdown.jsx
                    ├── page.jsx
                └── 📁overtime-approval
                    └── 📁components
                        ├── SimpleStatusDropdown.jsx
                        ├── StatusDropdown.jsx
                    ├── page.jsx
                └── 📁profile
                    ├── page.jsx
                └── 📁reports
                    ├── page.jsx
                └── 📁salary
                    └── 📁components
                        ├── PayrollRulesCard.jsx
                    ├── page.jsx
                └── 📁settings
                    ├── page.jsx
                └── 📁sidebar
                    ├── sidebar.jsx
                └── 📁terminations
                    └── 📁components
                        ├── AddTerminationModal.jsx
                        ├── EditTerminationModal.jsx
                    ├── page.jsx
                ├── layout.jsx
                ├── mockup.js
            └── 📁(intern)
                └── 📁intern
                    └── 📁attendance
                        ├── page.jsx
                    └── 📁complaints
                        ├── page.jsx
                    └── 📁components
                        ├── calender.css
                        ├── DashBoardCalendar.jsx
                    └── 📁performance
                        ├── page.jsx
                    └── 📁profile
                        ├── page.jsx
                    ├── layout.jsx
                    ├── page.jsx
                    ├── Sidebar.jsx
                ├── ClientLayout.js
            └── 📁(Login)
                └── 📁loginpage
                    ├── page.jsx
            └── 📁(Staff)
                └── 📁staff
                    └── 📁attendance
                        ├── page.jsx
                    └── 📁complain
                        ├── page.jsx
                    └── 📁components
                        ├── calender.css
                        ├── DashBoardCalendar.jsx
                    └── 📁profile
                        ├── page.jsx
                    └── 📁setting
                        ├── page.jsx
                    ├── layout.jsx
                    ├── page.jsx
                    ├── Sidebar.jsx
                ├── ClientLayout.js
            └── 📁api
                └── 📁uploadthing
                    ├── core.js
                    ├── route.js
            └── 📁departmentHead
                └── 📁attendace_overview
                    ├── page.jsx
                └── 📁complain
                    ├── page.jsx
                └── 📁components
                    ├── AttractiveThemeToggle.jsx
                    ├── calender.css
                    ├── DashboardCalendar.jsx
                    ├── MeetingBoard.jsx
                └── 📁designation
                    └── 📁components
                        ├── AddEditSubDepartmentModal.jsx
                    ├── page.jsx
                └── 📁leave_request
                    ├── page.jsx
                └── 📁markAttendance
                    ├── page.jsx
                └── 📁overtime_request
                    ├── page.jsx
                └── 📁payment-status
                    ├── page.jsx
                └── 📁performance
                    ├── page.jsx
                └── 📁profile
                    ├── page.jsx
                └── 📁settings
                    ├── page.jsx
                ├── layout.jsx
                ├── page.jsx
                ├── Sidebar.jsx
            └── 📁superAdmin
                ├── ClientLayout.js
                ├── global.css
                ├── layout.jsx
                ├── page.jsx
                ├── Sidebar.jsx
            ├── favicon.ico
            ├── favicon1.ico
            ├── favicon2.ico
            ├── globals.css
            ├── layout.js
            ├── page.jsx
        └── 📁components
            └── 📁ui
                ├── button.jsx
                ├── card.jsx
                ├── dialog.jsx
                ├── input.jsx
                ├── label.jsx
                ├── loader.jsx
                ├── output.jsx
                ├── select.jsx
                ├── switch.jsx
                ├── table.jsx
                ├── tabs.jsx
                ├── textarea.jsx
            ├── ThemeProvider.jsx
        └── 📁lib
            ├── api.js
            ├── mockData.js
            ├── utils.js
        └── 📁public
            └── 📁assets
                └── 📁images
                    ├── logo.jpg
                    ├── logo.png
            └── 📁avatars
                ├── avatar-1.jpg
            ├── banner.webp
            ├── logo.png
            ├── next.svg
            ├── vercel.svg
        ├── .gitignore
        ├── components.json
        ├── favicon.ico
        ├── favicon1.ico
        ├── globals.css
        ├── jsconfig.json
        ├── layout.js
        ├── middleware.js
        ├── middleware.ts
        ├── mockup.js
        ├── next.config.mjs
        ├── OVERTIME_APPROVAL_SETUP.md
        ├── package-lock.json
        ├── package.json
        ├── page.jsx
        ├── postcss.config.mjs
        ├── README.md
        ├── schema.prisma
        ├── tailwind.config.js
        ├── tsconfig.json
        └── z.webm


## 🛠️ Technology Stack

### **Core Technologies**
- **React 18** with functional components and hooks
- **TypeScript** for type safety
- **React Router** for navigation
- **Axios** for HTTP requests
- **Context API** for state management
- **PostCSS** for styling

### **Development Tools**
- **Vite** for fast development and building
- **ESLint** for code linting
- **Prettier** for code formatting

## 🎯 Key Features

### **Employee Management**
- Complete employee CRUD operations
- Employee profile with Ethiopian context
- Department and position assignment
- Document management

### **Attendance Tracking**
- Real-time clock in/out interface
- Attendance summary views
- Session-based tracking display
- Late/absence reporting

### **Payroll Processing**
- Salary calculation displays
- Overtime compensation views
- Payroll history
- Deduction management

### **Leave Management**
- Leave request interface
- Approval workflow UI
- Leave balance tracking
- Calendar integration

## 🔌 API Integration

### **Service Layer Structure**
```typescript
// services/employeeService.ts
import axios from 'axios';
import { Employee, EmployeeFormData } from '../types/employee';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const employeeService = {
  async getAllEmployees(params?: any): Promise<Employee[]> {
    const response = await api.get('/employees', { params });
    return response.data.data.employees;
  },

  async createEmployee(employeeData: EmployeeFormData): Promise<Employee> {
    const response = await api.post('/employees', employeeData);
    return response.data.data;
  },

  async updateEmployee(id: number, employeeData: Partial<EmployeeFormData>) {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data.data;
  }
};

TypeScript Definitions
typescript
// types/employee.ts
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  baptismalName?: string;
  dateOfBirth?: string;
  sex: 'male' | 'female';
  phone?: string;
  address?: string;
  department?: Department;
  position?: Position;
  salary: number;
  employmentDate: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  baptismalName?: string;
  dateOfBirth?: string;
  sex: 'male' | 'female';
  departmentId: number;
  positionId: number;
  salary: number;
  employmentDate: string;
}
🎨 UI/UX Features
Ethiopian Context Support
Amharic language compatibility

Local date formats

Cultural context in forms

Ethiopian holiday integration

Responsive Design
Mobile-friendly interfaces

Tablet-optimized layouts

Desktop-enhanced features

Cross-browser compatibility

Accessibility
Keyboard navigation support

Screen reader compatibility

High contrast options

Focus management

🚀 Performance Optimizations
Code Splitting
typescript
// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
      </Routes>
    </Suspense>
  );
};
Memoization
typescript
// Optimize re-renders
const EmployeeList: React.FC = React.memo(({ employees, onEdit }) => {
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => 
      a.lastName.localeCompare(b.lastName)
    );
  }, [employees]);

  return (
    <div className="employee-list">
      {sortedEmployees.map(employee => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
});
🔐 Authentication Flow
Protected Routes
typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};
<div align="center">
🎨 Explore our Components Guide and State Management

</div> ```