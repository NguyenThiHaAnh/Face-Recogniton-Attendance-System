import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/student">Student</Link></li>
        <li><Link to="/subject">Subject</Link></li>
        <li><Link to="/lecture">Lecture</Link></li>
        <li><Link to="/attendancecheck">Attendance Check</Link></li>
        <li><Link to="/attendancemanagement">Attendance Management</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
