# Key Components

This section highlights some of the most important UI components.

### EmployeeTable

- **Description**: Displays a list of all employees in a sortable and filterable table.
- **Props**:
    - `employees`: `Array` - The list of employee data to display.
    - `onEdit`: `Function` - Callback function triggered when the edit button is clicked.

### AddEmployeeModal

- **Description**: A popup modal form for creating or editing an employee's details.
- **Props**:
    - `isOpen`: `Boolean` - Controls the visibility of the modal.
    - `onClose`: `Function` - Function to call when the modal should be closed.
    - `onSubmit`: `Function` - Callback that passes the form data upon submission.