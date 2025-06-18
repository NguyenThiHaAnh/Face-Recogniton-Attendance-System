import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaBook, FaCalendarAlt, FaCheckCircle, FaClipboardList } from 'react-icons/fa';

const Home = () => {
  const sections = [
    { id: 'student', title: 'Student', path: '/student', icon: <FaUserGraduate className="text-7xl" /> },
    { id: 'subject', title: 'Subject', path: '/subject', icon: <FaBook className="text-7xl" /> },
    { id: 'lecture', title: 'Lecture', path: '/lecture', icon: <FaCalendarAlt className="text-7xl" /> },
    { id: 'attendance', title: 'Attendance Check', path: '/attendance', icon: <FaCheckCircle className="text-7xl" /> },
    { id: 'management', title: 'Attendance Management', path: '/management', icon: <FaClipboardList className="text-7xl" /> },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Home</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.id}
            to={section.path}
            className="block"
          >
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center h-60">
              {section.icon}
              <h3 className="text-lg font-semibold text-gray-700 mt-2 text-center">{section.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;