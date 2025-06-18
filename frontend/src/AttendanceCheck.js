import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AttendanceCheck = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [streamUrl, setStreamUrl] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [attendanceInfo, setAttendanceInfo] = useState({
    studentId: '',
    fullName: '',
    attendanceTime: '',
    imageUrl: 'https://via.placeholder.com/150',
  });
  const [lectureSchedule, setLectureSchedule] = useState([]);
  const [lectureInfo, setLectureInfo] = useState({ subject: '', lecture: '', time: '', teacher: '' });
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await axios.get('/lectures');
        setLectureSchedule(response.data || []);
      } catch (error) {
        toast.error('Error fetching lecture schedule');
        console.error('Error fetching lecture schedule:', error);
        setLectureSchedule([]);
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/subjects');
        setSubjects(response.data || []);
        if (response.data.length > 0) {
          setSelectedSubject(response.data[0]);
        }
      } catch (error) {
        toast.error('Error fetching subjects');
        console.error('Error fetching subjects:', error);
        setSubjects([]);
      }
    };

    fetchLectures();
    fetchSubjects();
  }, []);

  useEffect(() => {
    const selectedLecture = lectureSchedule.find(item => item.subject === selectedSubject);
    if (selectedLecture) {
      setLectureInfo(selectedLecture);
    } else {
      setLectureInfo({ subject: '', lecture: '', time: '', teacher: '' });
    }
  }, [selectedSubject, lectureSchedule]); // Thêm lectureSchedule vào dependency array để sửa lỗi ESLint

  const startCapture = async () => {
    try {
      const response = await axios.post('/start_capture');
      if (response.data.status === 'started') {
        setStreamUrl('http://localhost:5000/video_feed');
        setIsCameraOpen(true);
        setCapturedImage(null);
        toast.success('Camera started');
      }
    } catch (error) {
      toast.error('Error starting camera');
      console.error('Error starting capture:', error);
    }
  };

  const stopCapture = async () => {
    try {
      await axios.post('/stop_capture');
      setStreamUrl(null);
      setIsCameraOpen(false);
      setCapturedImage(null);
      toast.success('Camera stopped');
    } catch (error) {
      toast.error('Error stopping camera');
      console.error('Error stopping capture:', error);
    }
  };

  const captureImage = async () => {
    if (!isCameraOpen) {
      toast.error('Camera is not open');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = streamUrl + '?' + new Date().getTime();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageSrc = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageSrc);
      toast.info('Image captured');
    };
    img.onerror = () => {
      toast.error('Failed to capture image');
    };
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('/attendance');
      if (Object.keys(response.data).length > 0) {
        setAttendanceInfo({
          studentId: response.data.student_id,
          fullName: response.data.full_name,
          attendanceTime: response.data.attendance_time,
          imageUrl: response.data.image_url,
        });
      } else {
        setAttendanceInfo({
          studentId: '',
          fullName: '',
          attendanceTime: '',
          imageUrl: 'https://via.placeholder.com/150',
        });
      }
    } catch (error) {
      toast.error('Error fetching attendance');
      console.error('Error fetching attendance:', error);
    }
  };

  const captureAndSend = async () => {
    if (!capturedImage || !studentId || !selectedSubject) {
      toast.error('Please provide Student ID, select a subject, and capture an image');
      return;
    }

    const base64Image = capturedImage;

    const data = {
      studentId,
      subject: lectureInfo.subject,
      lecture: lectureInfo.session || lectureInfo.lecture || 'N/A',
      image: base64Image,
      imageUrl: 'https://via.placeholder.com/150',
    };

    try {
      const response = await axios.post('/attendance', data);
      toast.success(response.data.message || 'Attendance checked successfully');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to check attendance');
      console.error('Error marking attendance:', error);
    }
  };

  return (
    <div className="p-4 h-full overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Attendance Check</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-4rem)]">
        <div className="lg:col-span-2 bg-gray-200 rounded-lg p-4 flex flex-col">
          <div className="relative w-full mb-4 flex gap-4">
            <div className="flex-1">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-2 border rounded text-left bg-white"
              >
                {selectedSubject || 'Choose subject'}
              </button>
              {isDropdownOpen && (
                <div className="absolute w-full mt-1 bg-white border rounded shadow-md z-20 max-h-48 overflow-auto">
                  {subjects.map((subject, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 hover:bg-gray-100"
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="flex-1 p-2 border rounded"
              required
            />
          </div>

          <div
            style={{ height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            className="rounded-lg border border-gray-400 bg-black"
          >
            <div style={{ flex: 1 }}>
              {isCameraOpen && streamUrl ? (
                <img
                  src={streamUrl}
                  alt="Video Stream"
                  style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'contain' }}
                />
              ) : (
                <div
                  className="text-gray-400 flex items-center justify-center"
                  style={{ height: '100%', fontSize: 18 }}
                >
                  Camera is off
                </div>
              )}
            </div>

            <div className="p-4 flex justify-center gap-4">
              <button
                onClick={isCameraOpen ? stopCapture : startCapture}
                className={`px-6 py-2 rounded text-white ${
                  isCameraOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isCameraOpen ? 'Close camera' : 'Open camera'}
              </button>
              <button
                onClick={captureImage}
                disabled={!isCameraOpen || !selectedSubject}
                className={`px-6 py-2 rounded text-white bg-yellow-600 hover:bg-yellow-700 ${
                  (!isCameraOpen || !selectedSubject) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                Capture Image
              </button>
              <button
                onClick={captureAndSend}
                disabled={!isCameraOpen || !selectedSubject || !capturedImage || !studentId}
                className={`px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 ${
                  (!isCameraOpen || !selectedSubject || !capturedImage || !studentId) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                Check attendance
              </button>
            </div>
          </div>
          {capturedImage && (
            <div className="mt-4">
              <h4 className="text-md font-semibold text-gray-700">Captured Image:</h4>
              <img src={capturedImage} alt="Captured" className="w-full rounded mt-2" />
            </div>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          <div className="bg-white p-4 rounded-lg shadow-md flex-1 overflow-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Attendance Information</h3>
            <button
              onClick={fetchAttendance}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mb-4"
            >
              Refresh Attendance
            </button>
            <div className="flex flex-col items-center">
              <img
                src={attendanceInfo.imageUrl}
                alt="Student"
                className="w-40 h-40 object-cover rounded-full mb-4 border-2 border-gray-300"
              />
              <p className="text-gray-600 my-1 w-full text-left">
                <strong>Student ID:</strong> {attendanceInfo.studentId || 'N/A'}
              </p>
              <p className="text-gray-600 my-1 w-full text-left">
                <strong>Full name:</strong> {attendanceInfo.fullName || 'N/A'}
              </p>
              <p className="text-gray-600 my-1 w-full text-left">
                <strong>Attendance time:</strong> {attendanceInfo.attendanceTime || 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md flex-none">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Lecture Information</h3>
            <p className="text-gray-600 my-1"><strong>Subject:</strong> {lectureInfo.subject || 'N/A'}</p>
            <p className="text-gray-600 my-1"><strong>Lecture:</strong> {lectureInfo.session || lectureInfo.lecture || 'N/A'}</p>
            <p className="text-gray-600 my-1"><strong>Time:</strong> {lectureInfo.time || 'N/A'}</p>
            <p className="text-gray-600 my-1"><strong>Teacher:</strong> {lectureInfo.teacher || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCheck;