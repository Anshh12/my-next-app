"use client";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const AdminPanel = () => {
  const [employeesInput, setEmployeesInput] = useState("");
  const [employees, setEmployees] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState({});
  const [socket, setSocket] = useState(null);

  // Establish socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:4000"); // Replace with your server URL
    setSocket(newSocket);

    // Listen for new ticket notifications
    newSocket.on("newTicket", (data) => {
      setTickets((prevTickets) => [data, ...prevTickets]); // Add new ticket to the list
    });

    // Listen for employees updates
    newSocket.on("employeesUpdated", (updatedEmployees) => {
      setEmployees(updatedEmployees);
    });

    // Listen for assigned tickets updates
    newSocket.on("assignedTicketsUpdated", (updatedAssignedTickets) => {
      setAssignedTickets(updatedAssignedTickets);
    });

    return () => newSocket.close();
  }, []);

  // Handle input for multiple employees
  const handleEmployeesInput = (e) => {
    setEmployeesInput(e.target.value);
  };

  // Handle form submission for bulk adding employees
  const handleAddEmployees = (e) => {
    e.preventDefault();
    const newEmployees = employeesInput
      .split("\n")
      .map((line) => {
        const parts = line.split(",").map((part) => part?.trim());
        if (parts.length === 3) {
          const [name, username, password] = parts;
          return { name, username, password };
        }
        return null;
      })
      .filter((emp) => emp && emp.name && emp.username && emp.password);

    if (newEmployees.length === 0) {
      alert("Please ensure all entries are in the 'Name,Username,Password' format.");
      return;
    }

    if (socket) {
      socket.emit("addEmployees", newEmployees); // Emit all employees to the server
    }

    setEmployeesInput(""); // Clear input
  };

  // Handle ticket assignment
  const handleAssignTicket = (ticket, employeeUsername) => {
    const employee = employees.find((emp) => emp.username === employeeUsername);
    if (socket && employee) {
      socket.emit("assignTicket", { ticket, employee });
    }
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-center">Admin Panel</h2>

      {/* Employee Management Section */}
      <div className="w-full max-w-4xl bg-white p-6 rounded shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Employee Management</h3>

        {/* Employee Bulk Form */}
        <form className="mb-6" onSubmit={handleAddEmployees}>
          <textarea
            value={employeesInput}
            onChange={handleEmployeesInput}
            placeholder="Enter employees in 'Name,Username,Password' format (one per line)"
            className="w-full border p-3 rounded h-32 resize-none"
            required
          ></textarea>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded font-bold mt-4"
          >
            Add Employees
          </button>
        </form>

        {/* Employees List */}
        <h4 className="text-lg font-bold mb-4">Employees List</h4>
        <ul className="space-y-2">
          {employees.length > 0 ? (
            employees.map((emp) => (
              <li key={emp.username} className="p-2 border rounded shadow-sm hover:bg-gray-50">
                {emp.name} - {emp.username}
              </li>
            ))
          ) : (
            <p>No employees added yet.</p>
          )}
        </ul>
      </div>

      {/* Ticket Management Section */}
      <div className="w-full max-w-4xl bg-white p-6 rounded shadow-md">
        <h3 className="text-xl font-semibold mb-4">Ticket Management</h3>
        <div className="space-y-4">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div
                key={ticket.id} // This is the unique key for each ticket
                className="p-4 border rounded shadow-sm hover:bg-gray-50"
              >
                <p><strong>Name:</strong> {ticket.name}</p>
                <p><strong>Email:</strong> {ticket.email}</p>
                <p><strong>Mobile:</strong> {ticket.mobile}</p>
                <p><strong>Assigned To:</strong> {assignedTickets[ticket.id]?.name || "Unassigned"}</p>
                <div className="mt-4">
                  <label htmlFor={`employee-${ticket.id}`}>Assign to:</label>
                  <select
                    id={`employee-${ticket.id}`}
                    className="ml-2 p-2 border rounded"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.username} value={emp.username}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const select = document.getElementById(`employee-${ticket.id}`);
                      handleAssignTicket(ticket, select.value);
                    }}
                    className="ml-2 bg-green-500 text-white px-4 py-2 rounded font-bold"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No new tickets yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
