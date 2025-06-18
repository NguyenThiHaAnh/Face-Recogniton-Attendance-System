import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Lecture = () => {
  const [lectures, setLectures] = useState([]);
  const [newLecture, setNewLecture] = useState({
    subject: '',
    time: '',
    session: '',
    teacher: '',
  });

  const fetchLectures = async () => {
    try {
      const response = await axios.get('/lectures');
      if (Array.isArray(response.data)) {
        setLectures(response.data);
        toast.success('Lectures refreshed');
      } else {
        setLectures([]);
        toast.info('No lectures found');
      }
    } catch (error) {
      toast.error('Error fetching lectures');
      console.error('Error fetching lectures:', error);
      setLectures([]);
    }
  };

  const addLecture = async () => {
    if (!newLecture.subject || !newLecture.time || !newLecture.session || !newLecture.teacher) {
      toast.error('Please enter full information');
      return;
    }

    try {
      const response = await axios.post('/lectures', newLecture);
      toast.success(response.data.message || 'Lecture added successfully');
      setLectures([...lectures, newLecture]);
      setNewLecture({ subject: '', time: '', session: '', teacher: '' });
      fetchLectures(); // Làm mới danh sách từ server
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error adding lecture');
      console.error('Error adding lecture:', error);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lecture</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Subject"
          value={newLecture.subject}
          onChange={(e) => setNewLecture({ ...newLecture, subject: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Time (Ex: 08:00-10:00)"
          value={newLecture.time}
          onChange={(e) => setNewLecture({ ...newLecture, time: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Lecture (Ex: Lecture 1)"
          value={newLecture.session}
          onChange={(e) => setNewLecture({ ...newLecture, session: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Lecturer"
          value={newLecture.teacher}
          onChange={(e) => setNewLecture({ ...newLecture, teacher: e.target.value })}
          className="p-2 border rounded"
        />
        <div className="col-span-2 flex gap-4">
          <button
            onClick={addLecture}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex-1"
          >
            Add lecture
          </button>
          <button
            onClick={fetchLectures}
            className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700 flex-1"
          >
            Refresh
          </button>
        </div>
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Subject</th>
            <th className="border p-2">Time</th>
            <th className="border p-2">Lecture</th>
            <th className="border p-2">Lecturer</th>
          </tr>
        </thead>
        <tbody>
          {lectures.length > 0 ? (
            lectures.map((lecture, index) => (
              <tr key={index}>
                <td className="border p-2">{lecture.subject || 'N/A'}</td>
                <td className="border p-2">{lecture.time || 'N/A'}</td>
                <td className="border p-2">{lecture.session || 'N/A'}</td>
                <td className="border p-2">{lecture.teacher || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border p-2 text-center text-gray-500">
                No lectures available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Lecture;