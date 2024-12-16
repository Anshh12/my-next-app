const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" }, // Ensure this matches your frontend URL
});

let employees = []; // Employee storage
let tickets = [];   // Ticket storage
let assignedTickets = {}; // Track assigned tickets

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Store the employee username with socket id for easier targeting
  let currentEmployee = null;

  // Handle ticket submission
  socket.on("formSubmit", (data) => {
    tickets.push(data); // Save the ticket to storage
    io.emit("newTicket", data); // Notify all clients about the new ticket
    console.log("New ticket submitted:", data);
  });

  // Handle ticket assignment to an employee
  socket.on("assignTicket", ({ ticket, employeeEmail }) => {
    console.log(`Assigned ticket: ${ticket.email} to ${employeeEmail}`);

    // Save the assignment to the server-side mapping
    if (!assignedTickets[employeeEmail]) {
      assignedTickets[employeeEmail] = [];
    }
    assignedTickets[employeeEmail].push(ticket);

    // Emit the assigned tickets update to the assigned employee
    if (currentEmployee && currentEmployee.username === employeeEmail) {
      io.to(socket.id).emit("assignedTicketsUpdated", assignedTickets[employeeEmail]);
    }

    // Emit the updated assigned tickets to all clients
    io.emit("assignedTicketsUpdated", assignedTickets);
  });

  // Add multiple employees
  socket.on("addEmployees", (newEmployees) => {
    employees = [...employees, ...newEmployees]; // Add employees to storage
    io.emit("employeesUpdated", employees); // Notify all clients of updated employee list
    console.log("Employees added:", newEmployees);
  });

  // Employee login
  socket.on("login", (credentials, callback) => {
    const employee = employees.find(
      (emp) => emp.username === credentials.username && emp.password === credentials.password
    );
    if (employee) {
      // Save the current employee to the socket for easier assignment of tickets
      currentEmployee = employee;

      // Return assigned tickets for the logged-in employee
      const employeeTickets = assignedTickets[credentials.username] || [];
      callback({
        success: true,
        message: `Hi, ${employee.name}!`,
        assignedTickets: employeeTickets, // Send assigned tickets to the employee on login
      });
      console.log(`Employee logged in: ${employee.name}`);
    } else {
      callback({ success: false, message: "Invalid username or password." });
    }
  });

  // Handle disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // If the disconnected user was an employee, remove from the tracking
    if (currentEmployee) {
      console.log(`Employee ${currentEmployee.name} disconnected.`);
      currentEmployee = null; // Reset the current employee on disconnect
    }
  });
});

// Server listening on port
const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
