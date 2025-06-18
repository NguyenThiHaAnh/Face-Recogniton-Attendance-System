import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Login';
import Home from './Home';
import User from './User';
import Settings from './Settings';
import Student from './Student';
import Subject from './Subject';
import Lecture from './Lecture';
import AttendanceCheck from './AttendanceCheck';
import AttendanceManagement from './AttendanceManagement';
import Clock from './Clock';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-2xl">
            <FaBars />
          </button>
          <h1 className="text-xl font-bold">ATTENDANCE SYSTEM</h1>
        </div>
        <Clock />
      </nav>
      <div className="flex flex-1 overflow-auto">
        <div
          className={`bg-white shadow-md flex flex-col min-h-screen transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-16'
          } overflow-hidden`}
        >
          <ul className="p-4 flex flex-col h-full space-y-6">
            <li className="p-2">
              <Link to="/" className="flex items-center gap-3 text-lg hover:bg-blue-100 rounded">
                <FaHome /> {isSidebarOpen && 'Home'}
              </Link>
            </li>
            <li className="p-2">
              <Link to="/user" className="flex items-center gap-3 text-lg hover:bg-blue-100 rounded">
                <FaUser /> {isSidebarOpen && 'User'}
              </Link>
            </li>
            <li className="p-2">
              <Link to="/settings" className="flex items-center gap-3 text-lg hover:bg-blue-100 rounded">
                <FaCog /> {isSidebarOpen && 'Settings'}
              </Link>
            </li>
            <li className="p-2 mt-auto">
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  setIsLoggedIn(false);
                }}
                className="flex items-center gap-3 w-full text-left text-lg hover:bg-blue-100 rounded"
              >
                <FaSignOutAlt /> {isSidebarOpen && 'Log out'}
              </button>
            </li>
          </ul>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user" element={<User />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/student" element={<Student />} />
            <Route path="/subject" element={<Subject />} />
            <Route path="/lecture" element={<Lecture />} />
            <Route path="/attendance" element={<AttendanceCheck />} />
            <Route path="/management" element={<AttendanceManagement />} />
          </Routes>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;