import React, { useState } from 'react';

const User = () => {
  const userData = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : { username: 'User', email: '', fullName: '', dateOfBirth: '' };
  const [username, setUsername] = useState(userData.username);
  const [email, setEmail] = useState(userData.email);
  const [fullName, setFullName] = useState(userData.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(userData.dateOfBirth || '');

  const handleSave = () => {
    const updatedUser = { ...userData, username, email, fullName, dateOfBirth };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Information has been saved!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
          Welcome, {fullName}
        </h2>
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm">Avatar</span>
          </div>
        </div>
        <p className="text-lg font-semibold text-center mb-6">{fullName || 'Full Name'}</p>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white font-bold p-3 rounded hover:bg-blue-600 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default User;