import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AttendanceManagement = () => {
  const [attendances, setAttendances] = useState([]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('/attendance');
      if (Object.keys(response.data).length > 0) {
        setAttendances([{
          id: response.data.student_id,
          name: response.data.full_name,
          subject: response.data.subject,
          time: response.data.attendance_time,
        }]);
        toast.success('Attendance data refreshed');
      } else {
        setAttendances([]);
        toast.info('No attendance data found');
      }
    } catch (error) {
      toast.error('Error fetching attendance data');
      console.error('Error fetching attendance:', error);
      setAttendances([]);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance Management</h2>
      <button
        onClick={fetchAttendance}
        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mb-4"
      >
        Refresh Attendance
      </button>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Student ID</th>
            <th className="border p-2">Full Name</th>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {attendances.length > 0 ? (
            attendances.map((attendance, index) => (
              <tr key={index}>
                <td className="border p-2">{attendance.id || 'N/A'}</td>
                <td className="border p-2">{attendance.name || 'N/A'}</td>
                <td className="border p-2">{attendance.subject || 'N/A'}</td>
                <td className="border p-2">{attendance.time || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border p-2 text-center text-gray-500">
                No attendance records available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceManagement;