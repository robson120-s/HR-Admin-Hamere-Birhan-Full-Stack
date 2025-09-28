# 🧩 Components Guide

<div align="center">

*Comprehensive guide to React components in HR-Admin-Hamere-Birhan*

</div>

## 📋 Component Categories

| Category | Purpose | Key Components |
|----------|---------|----------------|
| **Layout** | Page structure | `AppLayout`, `Sidebar`, `Header` |
| **Employee** | Employee management | `EmployeeTable`, `EmployeeForm` |
| **Attendance** | Time tracking | `ClockInOut`, `AttendanceSummary` |
| **Payroll** | Salary management | `SalaryCalculator`, `PayrollTable` |
| **Forms** | User input | `EmployeeForm`, `LeaveRequestForm` |

## 🏗️ Layout Components

### **AppLayout**
Main application layout wrapper.

```typescript
// components/layout/AppLayout.tsx
interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  sidebar = <DefaultSidebar />,
  header = <DefaultHeader />
}) => {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        {sidebar}
      </aside>
      <main className="main-content">
        <header className="app-header">
          {header}
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};
👥 Employee Components
EmployeeTable
Data table for displaying employees with Ethiopian context.

typescript
// components/employees/EmployeeTable.tsx
interface EmployeeTableProps {
  employees: Employee[];
  loading?: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  departmentFilter?: number;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading = false,
  onEdit,
  onDelete,
  departmentFilter,
}) => {
  const filteredEmployees = departmentFilter
    ? employees.filter(emp => emp.department?.id === departmentFilter)
    : employees;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="employee-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Baptismal Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Salary</th>
            <th>Employment Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map(employee => (
            <tr key={employee.id}>
              <td>{employee.firstName} {employee.lastName}</td>
              <td>{employee.baptismalName || '-'}</td>
              <td>{employee.department?.name || '-'}</td>
              <td>{employee.position?.name || '-'}</td>
              <td>${employee.salary.toLocaleString()}</td>
              <td>{new Date(employee.employmentDate).toLocaleDateString()}</td>
              <td>
                <button onClick={() => onEdit(employee)}>Edit</button>
                <button onClick={() => onDelete(employee.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
EmployeeForm
Comprehensive form for creating/editing employees.

typescript
// components/employees/EmployeeForm.tsx
interface EmployeeFormProps {
  employee?: Employee | null;
  departments: Department[];
  positions: Position[];
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  departments,
  positions,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EmployeeFormData>({
    defaultValues: employee ? {
      firstName: employee.firstName,
      lastName: employee.lastName,
      baptismalName: employee.baptismalName,
      // ... other fields
    } : {},
  });

  const handleFormSubmit = (data: EmployeeFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="employee-form">
      <div className="form-section">
        <h3>Personal Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input
              {...register('firstName', { required: 'First name is required' })}
            />
            {errors.firstName && <span className="error">{errors.firstName.message}</span>}
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input
              {...register('lastName', { required: 'Last name is required' })}
            />
            {errors.lastName && <span className="error">{errors.lastName.message}</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label>Baptismal Name</label>
          <input {...register('baptismalName')} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sex *</label>
            <select {...register('sex', { required: 'Sex is required' })}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" {...register('dateOfBirth')} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Employment Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Department *</label>
            <select {...register('departmentId', { required: 'Department is required' })}>
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Position *</label>
            <select {...register('positionId', { required: 'Position is required' })}>
              <option value="">Select Position</option>
              {positions.map(position => (
                <option key={position.id} value={position.id}>{position.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Employment Date *</label>
            <input 
              type="date" 
              {...register('employmentDate', { required: 'Employment date is required' })} 
            />
          </div>
          
          <div className="form-group">
            <label>Salary *</label>
            <input 
              type="number" 
              step="0.01"
              {...register('salary', { required: 'Salary is required', min: 0 })} 
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
        </button>
      </div>
    </form>
  );
};
⏰ Attendance Components
ClockInOut
Component for employee clock in/out operations.

typescript
// components/attendance/ClockInOut.tsx
interface ClockInOutProps {
  employeeId: number;
  currentSession?: SessionDefinition;
  onClockIn: (data: ClockInData) => void;
  onClockOut: (data: ClockOutData) => void;
}

export const ClockInOut: React.FC<ClockInOutProps> = ({
  employeeId,
  currentSession,
  onClockIn,
  onClockOut,
}) => {
  const [clockInTime, setClockInTime] = useState<Date | null>(null);

  const handleClockIn = () => {
    const now = new Date();
    setClockInTime(now);
    onClockIn({
      employeeId,
      sessionId: currentSession?.id!,
      actualClockIn: now.toISOString(),
    });
  };

  const handleClockOut = () => {
    const now = new Date();
    onClockOut({
      employeeId, 
      sessionId: currentSession?.id!,
      actualClockOut: now.toISOString(),
    });
    setClockInTime(null);
  };

  return (
    <div className="clock-in-out">
      <div className="session-info">
        <h3>Current Session</h3>
        <p>Expected: {currentSession?.expectedClockIn} - {currentSession?.expectedClockOut}</p>
      </div>
      
      <div className="clock-actions">
        {!clockInTime ? (
          <button onClick={handleClockIn} className="clock-in-btn">
            Clock In
          </button>
        ) : (
          <button onClick={handleClockOut} className="clock-out-btn">
            Clock Out
          </button>
        )}
      </div>

      {clockInTime && (
        <div className="current-session">
          <p>Clocked in at: {clockInTime.toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};
AttendanceSummary
Display attendance records and statistics.

typescript
// components/attendance/AttendanceSummary.tsx
interface AttendanceSummaryProps {
  employeeId: number;
  month: number;
  year: number;
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({
  employeeId,
  month,
  year,
}) => {
  const { attendance, loading, error } = useAttendance(employeeId, month, year);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const stats = calculateAttendanceStats(attendance);

  return (
    <div className="attendance-summary">
      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-value">{stats.presentDays}</span>
          <span className="stat-label">Present</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.absentDays}</span>
          <span className="stat-label">Absent</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.lateDays}</span>
          <span className="stat-label">Late</span>
        </div>
      </div>

      <div className="attendance-calendar">
        <h4>Daily Attendance</h4>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Session</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(record => (
              <tr key={record.id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>Session {record.sessionId}</td>
                <td>{record.actualClockIn ? new Date(record.actualClockIn).toLocaleTimeString() : '-'}</td>
                <td>{record.actualClockOut ? new Date(record.actualClockOut).toLocaleTimeString() : '-'}</td>
                <td>
                  <StatusBadge status={record.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
💰 Payroll Components
SalaryCalculator
Component for calculating and displaying salary information.

typescript
// components/payroll/SalaryCalculator.tsx
interface SalaryCalculatorProps {
  employee: Employee;
  month: number;
  year: number;
}

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  employee,
  month,
  year,
}) => {
  const { salaryData, overtime, deductions, loading } = useSalaryCalculation(
    employee.id,
    month,
    year
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="salary-calculator">
      <h3>Salary Calculation for {month}/{year}</h3>
      
      <div className="calculation-breakdown">
        <div className="breakdown-item">
          <span>Base Salary:</span>
          <span>${salaryData.baseSalary.toLocaleString()}</span>
        </div>
        
        <div className="breakdown-item">
          <span>Overtime Hours:</span>
          <span>{overtime.hours} hours</span>
        </div>
        
        <div className="breakdown-item">
          <span>Overtime Pay:</span>
          <span>${overtime.pay.toLocaleString()}</span>
        </div>
        
        <div className="breakdown-item">
          <span>Deductions:</span>
          <span>${deductions.total.toLocaleString()}</span>
        </div>
        
        <div className="breakdown-item total">
          <span>Net Salary:</span>
          <span>${salaryData.netSalary.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
🎯 Utility Components
LoadingSpinner
Reusable loading indicator.

typescript
// components/common/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
}) => {
  return (
    <div className={`loading-spinner size-${size}`}>
      <div className="spinner"></div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};
StatusBadge
Visual status indicators.

typescript
// components/common/StatusBadge.tsx
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      present: { label: 'Present', color: 'green' },
      absent: { label: 'Absent', color: 'red' },
      late: { label: 'Late', color: 'orange' },
      pending: { label: 'Pending', color: 'blue' },
      approved: { label: 'Approved', color: 'green' },
      rejected: { label: 'Rejected', color: 'red' },
    };
    
    return configs[status] || { label: status, color: 'gray' };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`status-badge status-${config.color} size-${size}`}>
      {config.label}
    </span>
  );
};
<div align="center">
🧩 These components form the building blocks of the HR Admin interface

</div> ```