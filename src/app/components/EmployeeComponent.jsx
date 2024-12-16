"use client"
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function EmployeeDashboard() {
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [employeeName, setEmployeeName] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // Handle employee login
  const handleLogin = (credentials) => {
    socket.emit('login', credentials, (response) => {
      if (response.success) {
        setEmployeeName(response.message);
        setAssignedTickets(response.assignedTickets);
        setLoggedIn(true);
      } else {
        alert(response.message); // Show login error
      }
    });
  };

  // Listen for assigned tickets update
  useEffect(() => {
    socket.on('assignedTicketsUpdated', (assignedTickets) => {
      setAssignedTickets(assignedTickets);
    });

    return () => {
      socket.off('assignedTicketsUpdated'); // Clean up on unmount
    };
  }, []);

  // Handle new ticket submission (example)
  const handleNewTicket = (ticket) => {
    socket.emit('formSubmit', ticket);
  };

  return (
    <div>
      {!loggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <div>
          <h2>Welcome, {employeeName}</h2>
          <h3>Assigned Tickets:</h3>
          <ul>
            {assignedTickets.length > 0 ? (
              assignedTickets.map((ticket, index) => (
                <li key={index}>{ticket.title} - {ticket.description}</li>
              ))
            ) : (
              <p>No tickets assigned yet.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default EmployeeDashboard;
