// app/employee-management/page.js
"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  Calendar,
  FileText,
  Check,
  X,
} from "lucide-react";

// Import modals
import AddEmployeeModal from "../components/employeeManagement/AddEmployeeModal";
import AssignTaskModal from "../components/employeeManagement/AssignTaskModal";
// import ViewEmployeeDetailsModal from "../components/employeeManagement/ViewEmployeeDetailsModal";
import DeleteEmployeeModal from "../components/employeeManagement/DeleteEmployeeModal";
import Modal from "../components/Modal";

export default function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState("active");
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [employees, setEmployees] = useState([
    {
      id: "EMP-1001",
      name: "John Doe",
      role: "Farm Manager",
      department: "Operations",
      status: "active",
      contact: "+1 (555) 123-4567",
      email: "john.doe@farmtech.com",
      hireDate: "2022-03-15",
      salary: 65000,
      performance: "Excellent",
      tasks: [
        {
          id: "T-001",
          title: "Morning Flock Inspection",
          assignedDate: "2025-01-15",
          dueDate: "2025-01-16",
          status: "completed",
        },
        {
          id: "T-002",
          title: "Equipment Maintenance",
          assignedDate: "2025-01-20",
          dueDate: "2025-01-25",
          status: "in-progress",
        },
      ],
      skills: [
        "Livestock Management",
        "Operations Planning",
        "Team Leadership",
      ],
    },
    {
      id: "EMP-1002",
      name: "Sarah Williams",
      role: "Veterinary Technician",
      department: "Animal Health",
      status: "active",
      contact: "+1 (555) 987-6543",
      email: "sarah.williams@farmtech.com",
      hireDate: "2023-06-01",
      salary: 55000,
      performance: "Good",
      tasks: [
        {
          id: "T-003",
          title: "Vaccination Schedule Review",
          assignedDate: "2025-01-18",
          dueDate: "2025-01-22",
          status: "pending",
        },
      ],
      skills: ["Animal Health", "Vaccination", "Medical Record Keeping"],
    },
    {
      id: "EMP-999",
      name: "Michael Brown",
      role: "Senior Farm Hand",
      department: "Operations",
      status: "inactive",
      contact: "+1 (555) 246-8135",
      email: "michael.brown@farmtech.com",
      hireDate: "2021-09-10",
      endDate: "2024-12-31",
      performanceHistory: "Satisfactory",
    },
  ]);

  const handleAddEmployee = () => {
    setModalContent(
      <AddEmployeeModal
        onClose={() => setShowModal(false)}
        onAddEmployee={(newEmployee) => {
          setEmployees([...employees, newEmployee]);
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setModalContent(
      <AddEmployeeModal
        employeeToEdit={employee}
        onClose={() => setShowModal(false)}
        onUpdateEmployee={(updatedEmployee) => {
          setEmployees(
            employees.map((emp) =>
              emp.id === updatedEmployee.id ? updatedEmployee : emp
            )
          );
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleDeleteEmployee = (employeeId) => {
    setEmployees(employees.filter((emp) => emp.id !== employeeId));
    setShowModal(false);
  };

  const handleAssignTask = (employee) => {
    setModalContent(
      <AssignTaskModal
        employee={employee}
        onClose={() => setShowModal(false)}
        onAssignTask={(updatedEmployee) => {
          setEmployees(
            employees.map((emp) =>
              emp.id === updatedEmployee.id ? updatedEmployee : emp
            )
          );
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const filteredEmployees = employees
    .filter((employee) => employee.status === activeTab)
    .filter((employee) => {
      if (!searchTerm) return true;
      return (
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleAddEmployee}
        >
          <Plus size={18} />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[color:var(--border)]">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "active"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active Employees
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "inactive"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive Employees
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search employees..."
            className="input w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-2.5 text-[color:var(--muted-foreground)]"
            size={18}
          />
        </div>
        <button className="input flex items-center gap-2 bg-[color:var(--card)]">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Employees List */}
      <div className="space-y-4">
        {filteredEmployees.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[color:var(--muted-foreground)]">
              No employees found
            </p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div key={employee.id} className="card overflow-hidden">
              <div
                className="p-4 flex items-center cursor-pointer"
                onClick={() =>
                  setExpandedEmployee(
                    expandedEmployee === employee.id ? null : employee.id
                  )
                }
              >
                <div className="mr-4">
                  {expandedEmployee === employee.id ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-lg font-medium">
                        {employee.name}
                      </span>
                      <span className="ml-3 px-2 py-1 text-xs rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
                        {employee.role}
                      </span>
                      <span className="ml-2 text-sm text-[color:var(--muted-foreground)]">
                        ({employee.department})
                      </span>
                    </div>
                    {employee.status === "active" && (
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEmployee(employee);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalContent(
                              <DeleteEmployeeModal
                                employee={employee}
                                onClose={() => setShowModal(false)}
                                onDelete={() =>
                                  handleDeleteEmployee(employee.id)
                                }
                              />
                            );
                            setShowModal(true);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedEmployee === employee.id && (
                <div className="border-t border-[color:var(--border)] p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Employee Information */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Employee Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Employee ID:
                          </span>
                          <span className="font-medium">{employee.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Contact:
                          </span>
                          <span className="font-medium">
                            {employee.contact}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Email:
                          </span>
                          <span className="font-medium">{employee.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Hire Date:
                          </span>
                          <span className="font-medium">
                            {employee.hireDate}
                          </span>
                        </div>
                        {employee.status === "active" && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-[color:var(--muted-foreground)]">
                                Performance:
                              </span>
                              <span
                                className={`font-medium ${
                                  employee.performance === "Excellent"
                                    ? "text-[color:var(--success)]"
                                    : employee.performance === "Good"
                                    ? "text-[color:var(--primary)]"
                                    : "text-[color:var(--destructive)]"
                                }`}
                              >
                                {employee.performance}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[color:var(--muted-foreground)]">
                                Salary:
                              </span>
                              <span className="font-medium">
                                ${employee.salary.toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}
                        {employee.status === "inactive" && (
                          <div className="flex justify-between">
                            <span className="text-[color:var(--muted-foreground)]">
                              End Date:
                            </span>
                            <span className="font-medium">
                              {employee.endDate}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {employee.status === "active" && employee.skills && (
                      <div>
                        <h3 className="font-medium mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {employee.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 text-xs rounded-full bg-[color:var(--card)] text-[color:var(--foreground)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    {employee.status === "active" && employee.tasks && (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Current Tasks</h3>
                          <button
                            className="btn-primary text-xs px-2 py-1"
                            onClick={() => handleAssignTask(employee)}
                          >
                            Assign Task
                          </button>
                        </div>
                        <div className="space-y-2">
                          {employee.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-2 border-l-4 rounded-r-md ${
                                task.status === "completed"
                                  ? "border-l-[color:var(--success)] bg-[color:var(--success)] bg-opacity-5"
                                  : task.status === "in-progress"
                                  ? "border-l-[color:var(--primary)] bg-[color:var(--primary)] bg-opacity-5"
                                  : "border-l-[color:var(--muted-foreground)] bg-[color:var(--muted)] bg-opacity-5"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {task.title}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    task.status === "completed"
                                      ? "bg-[color:var(--success)] bg-opacity-10 text-[color:var(--accent)]"
                                      : task.status === "in-progress"
                                      ? "bg-[color:var(--primary)] bg-opacity-10 text-[color:var(--accent)]"
                                      : "bg-[color:var(--muted)] bg-opacity-10 text-[color:var(--accent)]"
                                  }`}
                                >
                                  {task.status}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-[color:var(--muted-foreground)]">
                                  Assigned: {task.assignedDate}
                                </span>
                                <span className="text-[color:var(--muted-foreground)]">
                                  Due: {task.dueDate}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Container */}
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            setModalContent(null);
          }}
        >
          {modalContent}
        </Modal>
      )}
    </div>
  );
}