# ⚡ State Management Guide

<div align="center">

*State management architecture for HR-Admin-Hamere-Birhan frontend*

</div>

## 🏗️ State Management Architecture

The application uses **React Context API** combined with **useState/useReducer** for a balanced state management approach.

```mermaid
graph TB
    A[Local State] --> B[useState]
    A --> C[useReducer]
    
    D[Global State] --> E[React Context]
    E --> F[Auth Context]
    E --> G[Employee Context]
    E --> H[UI Context]
    
    style A fill:#3498db
    style D fill:#9b59b6

📊 State Categories
Category	Tools	Use Cases
Local State	useState, useReducer	Form inputs, UI toggles, component data
Global State	React Context	Authentication, employee data, UI themes
Server State	Custom hooks	API data, caching, synchronization
🔐 Authentication Context
Auth Context Implementation
typescript
// contexts/AuthContext.tsx
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('authToken'),
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Initialize auth state from token
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await authService.verifyToken(token);
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            loading: false,
          }));
        } catch (error) {
          localStorage.removeItem('authToken');
          setState(prev => ({
            ...prev,
            token: null,
            isAuthenticated: false,
            loading: false,
          }));
        }
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const { user, token } = response.data;

    localStorage.setItem('authToken', token);
    setState({
      user,
      token,
      isAuthenticated: true,
      loading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
👥 Employee Context
Employee Data Management
typescript
// contexts/EmployeeContext.tsx
interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
}

interface EmployeeContextType extends EmployeeState {
  fetchEmployees: () => Promise<void>;
  selectEmployee: (employee: Employee | null) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: number, updates: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EmployeeState>({
    employees: [],
    selectedEmployee: null,
    loading: false,
    error: null,
  });

  const fetchEmployees = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const employees = await employeeService.getAllEmployees();
      setState(prev => ({
        ...prev,
        employees,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch employees',
        loading: false,
      }));
    }
  };

  const selectEmployee = (employee: Employee | null) => {
    setState(prev => ({ ...prev, selectedEmployee: employee }));
  };

  const addEmployee = (employee: Employee) => {
    setState(prev => ({
      ...prev,
      employees: [...prev.employees, employee],
    }));
  };

  const updateEmployee = (id: number, updates: Partial<Employee>) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.map(emp =>
        emp.id === id ? { ...emp, ...updates } : emp
      ),
      selectedEmployee: prev.selectedEmployee?.id === id 
        ? { ...prev.selectedEmployee, ...updates }
        : prev.selectedEmployee,
    }));
  };

  const deleteEmployee = (id: number) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.filter(emp => emp.id !== id),
      selectedEmployee: prev.selectedEmployee?.id === id 
        ? null 
        : prev.selectedEmployee,
    }));
  };

  const value: EmployeeContextType = {
    ...state,
    fetchEmployees,
    selectEmployee,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
📊 Custom Hooks for Data Fetching
useEmployees Hook
typescript
// hooks/useEmployees.ts
interface UseEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createEmployee: (data: EmployeeFormData) => Promise<void>;
  updateEmployee: (id: number, data: Partial<EmployeeFormData>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
}

export const useEmployees = (): UseEmployeesReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: EmployeeFormData) => {
    try {
      const newEmployee = await employeeService.createEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
    } catch (err) {
      throw new Error('Failed to create employee');
    }
  };

  const updateEmployee = async (id: number, employeeData: Partial<EmployeeFormData>) => {
    try {
      const updatedEmployee = await employeeService.updateEmployee(id, employeeData);
      setEmployees(prev =>
        prev.map(emp => (emp.id === id ? updatedEmployee : emp))
      );
    } catch (err) {
      throw new Error('Failed to update employee');
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      await employeeService.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      throw new Error('Failed to delete employee');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
useAttendance Hook
typescript
// hooks/useAttendance.ts
interface UseAttendanceReturn {
  attendance: AttendanceLog[];
  summary: AttendanceSummary | null;
  loading: boolean;
  error: string | null;
  clockIn: (data: ClockInData) => Promise<void>;
  clockOut: (data: ClockOutData) => Promise<void>;
}

export const useAttendance = (employeeId?: number, month?: number, year?: number): UseAttendanceReturn => {
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    if (!employeeId) return;
    
    try {
      setLoading(true);
      const [logs, summaryData] = await Promise.all([
        attendanceService.getEmployeeAttendance(employeeId, month, year),
        attendanceService.getSummary(employeeId, month, year),
      ]);
      setAttendance(logs);
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async (data: ClockInData) => {
    try {
      const record = await attendanceService.clockIn(data);
      setAttendance(prev => [...prev, record]);
    } catch (err) {
      throw new Error('Failed to clock in');
    }
  };

  const clockOut = async (data: ClockOutData) => {
    try {
      const record = await attendanceService.clockOut(data);
      setAttendance(prev =>
        prev.map(item =>
          item.id === record.id ? record : item
        )
      );
    } catch (err) {
      throw new Error('Failed to clock out');
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [employeeId, month, year]);

  return {
    attendance,
    summary,
    loading,
    error,
    clockIn,
    clockOut,
  };
};
📝 Form State Management
useEmployeeForm Hook
typescript
// hooks/useEmployeeForm.ts
interface UseEmployeeFormReturn {
  values: EmployeeFormData;
  errors: Record<string, string>;
  loading: boolean;
  handleChange: (name: keyof EmployeeFormData, value: any) => void;
  handleSubmit: (onSubmit: (data: EmployeeFormData) => Promise<void>) => void;
  resetForm: () => void;
}

export const useEmployeeForm = (initialValues?: EmployeeFormData): UseEmployeeFormReturn => {
  const [values, setValues] = useState<EmployeeFormData>(
    initialValues || getDefaultEmployeeFormData()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (name: keyof EmployeeFormData, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!values.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!values.departmentId) {
      newErrors.departmentId = 'Department is required';
    }
    if (!values.positionId) {
      newErrors.positionId = 'Position is required';
    }
    if (!values.employmentDate) {
      newErrors.employmentDate = 'Employment date is required';
    }
    if (!values.salary || values.salary < 0) {
      newErrors.salary = 'Valid salary is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSubmit: (data: EmployeeFormData) => Promise<void>) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(values);
      resetForm();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setValues(getDefaultEmployeeFormData());
    setErrors({});
  };

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    resetForm,
  };
};

function getDefaultEmployeeFormData(): EmployeeFormData {
  return {
    firstName: '',
    lastName: '',
    baptismalName: '',
    sex: 'male',
    dateOfBirth: '',
    departmentId: 0,
    positionId: 0,
    employmentDate: '',
    salary: 0,
    phone: '',
    address: '',
  };
}
🔄 Optimistic Updates
Optimistic Update Pattern
typescript
// hooks/useOptimisticUpdate.ts
export const useOptimisticUpdate = <T>(
  currentData: T[],
  updateFn: (data: T[]) => void
) => {
  const [optimisticData, setOptimisticData] = useState<T[]>(currentData);
  const [rollbackData, setRollbackData] = useState<T[] | null>(null);

  const optimisticUpdate = (update: (data: T[]) => T[]) => {
    setRollbackData(optimisticData);
    const newData = update(optimisticData);
    setOptimisticData(newData);
    updateFn(newData);
  };

  const rollback = () => {
    if (rollbackData) {
      setOptimisticData(rollbackData);
      updateFn(rollbackData);
      setRollbackData(null);
    }
  };

  useEffect(() => {
    setOptimisticData(currentData);
  }, [currentData]);

  return {
    optimisticData,
    optimisticUpdate,
    rollback,
  };
};

// Usage example
const EmployeeList: React.FC = () => {
  const { employees, deleteEmployee } = useEmployees();
  const { optimisticData, optimisticUpdate, rollback } = useOptimisticUpdate(
    employees,
    // Update function would go here
  );

  const handleDelete = async (id: number) => {
    optimisticUpdate(data => data.filter(emp => emp.id !== id));
    
    try {
      await deleteEmployee(id);
    } catch (error) {
      rollback();
      // Show error message
    }
  };

  return (
    <div>
      {optimisticData.map(employee => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
🎯 Provider Setup
App Providers
typescript
// App.tsx
export const App: React.FC = () => {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <UIProvider>
          <Router>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </Router>
        </UIProvider>
      </EmployeeProvider>
    </AuthProvider>
  );
};
<div align="center">
⚡ This state management approach ensures predictable and maintainable application state

</div> ```