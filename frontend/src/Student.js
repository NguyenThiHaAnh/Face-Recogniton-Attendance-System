import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { toast } from 'react-toastify';

const Student = () => {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    major: '',
    year: '',
    class: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    phone: '',
  });
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  const captureImage = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      toast.info('Image captured');
    } else {
      toast.error('Failed to capture image');
    }
  };

  const registerStudent = async () => {
    if (
      !newStudent.id ||
      !newStudent.name ||
      !capturedImage
    ) {
      toast.error('Please enter Student ID, Full Name, and capture an image');
      return;
    }

    const base64Image = capturedImage.split(',')[1];

    try {
      const response = await axios.post('/register_face', {
        studentId: newStudent.id,
        fullName: newStudent.name,
        image: base64Image,
      });
      toast.success(response.data.message || 'Student registered successfully');
      setStudents([...students, { id: newStudent.id, name: newStudent.name }]);
      setNewStudent({
        id: '',
        name: '',
        major: '',
        year: '',
        class: '',
        gender: '',
        dateOfBirth: '',
        email: '',
        phone: '',
      });
      setCapturedImage(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error registering student');
      console.error('Error registering student:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Student ID</label>
          <input
            type="text"
            placeholder="Enter your student ID"
            value={newStudent.id}
            onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Major</label>
          <select
            value={newStudent.major}
            onChange={(e) => setNewStudent({ ...newStudent, major: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose major</option>
            <option value="ICT">ICT - Information and Communication Technology</option>
            <option value="CS">CS - Cyber Security</option>
            <option value="DS">DS - Data Science</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Academic Year</label>
          <select
            value={newStudent.year}
            onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose academic year</option>
            <option value="B0">B0</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="B3">B3</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Class</label>
          <input
            type="text"
            placeholder="Enter your class"
            value={newStudent.class}
            onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Gender</label>
          <select
            value={newStudent.gender}
            onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Date of Birth</label>
          <input
            type="date"
            value={newStudent.dateOfBirth}
            onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={newStudent.email}
            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={newStudent.phone}
            onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="col-span-2 flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">Capture Face</label>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full rounded border"
              style={{ height: '200px', objectFit: 'cover' }}
            />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <button
              onClick={captureImage}
              className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700 mb-2"
            >
              Capture Image
            </button>
            {capturedImage && (
              <div className="mt-2">
                <h4 className="text-md font-semibold text-gray-700">Preview:</h4>
                <img src={capturedImage} alt="Preview" className="w-full rounded mt-2" />
              </div>
            )}
          </div>
        </div>
        <button
          onClick={registerStudent}
          className="col-span-2 bg-green-500 text-white p-2 rounded hover:bg-green-600"
          disabled={!newStudent.id || !newStudent.name || !capturedImage}
        >
          Register Student
        </button>
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Student ID</th>
            <th className="border p-2">Full name</th>
            <th className="border p-2">Major</th>
            <th className="border p-2">Year</th>
            <th className="border p-2">Class</th>
            <th className="border p-2">Gender</th>
            <th className="border p-2">Date of Birth</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td className="border p-2">{student.id}</td>
              <td className="border p-2">{student.name}</td>
              <td className="border p-2">{student.major}</td>
              <td className="border p-2">{student.year}</td>
              <td className="border p-2">{student.class}</td>
              <td className="border p-2">{student.gender}</td>
              <td className="border p-2">{student.dateOfBirth}</td>
              <td className="border p-2">{student.email}</td>
              <td className="border p-2">{student.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Student;