import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/subjects');
      if (Array.isArray(response.data)) {
        setSubjects(response.data);
        toast.success('Subjects refreshed');
      } else {
        setSubjects([]);
        toast.info('No subjects found');
      }
    } catch (error) {
      toast.error('Error fetching subjects');
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const addSubject = async () => {
    if (!newSubject) {
      toast.error('Please enter a subject');
      return;
    }

    try {
      const response = await axios.post('/subjects', { subject: newSubject });
      toast.success(response.data.message || 'Subject added successfully');
      setSubjects([...subjects, newSubject]);
      setNewSubject('');
      fetchSubjects(); // Làm mới danh sách từ server
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error adding subject');
      console.error('Error adding subject:', error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Subject</h2>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <button
          onClick={addSubject}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Add subject
        </button>
        <button
          onClick={fetchSubjects}
          className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>
      <ul className="list-disc pl-6">
        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <li key={index}>{subject}</li>
          ))
        ) : (
          <li className="text-gray-500">No subjects available.</li>
        )}
      </ul>
    </div>
  );
};

export default Subject;