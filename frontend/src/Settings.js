import React, { useState } from 'react';

const Setting = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'vi');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'medium');
  const [emailNotifications, setEmailNotifications] = useState(
    localStorage.getItem('emailNotifications') === 'true' || true
  );
  const [browserNotifications, setBrowserNotifications] = useState(
    localStorage.getItem('browserNotifications') === 'true' || false
  );
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showDisplayFields, setShowDisplayFields] = useState(false);
  const [showNotificationFields, setShowNotificationFields] = useState(false);

  const handleSave = () => {
    // Lưu cài đặt vào localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('emailNotifications', emailNotifications);
    localStorage.setItem('browserNotifications', browserNotifications);

    // Kiểm tra đổi mật khẩu
    if (showPasswordFields && (oldPassword || newPassword || confirmPassword)) {
      if (newPassword !== confirmPassword) {
        alert('Mật khẩu mới và xác nhận không khớp!');
        return;
      }
      // Ở đây có thể gọi API để đổi mật khẩu
      alert('Mật khẩu đã được đổi! (Chưa tích hợp API)');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false); // Ẩn trường sau khi lưu
    }

    alert('Settings has been saved!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 text-center">Settings</h2>
        {/* Theme */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-3 border rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Language */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 border rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Change password */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold text-gray-700 cursor-pointer hover:text-blue-600 mb-2"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
          >
            Change password {showPasswordFields ? '▲' : '▼'}
          </h3>
          {showPasswordFields && (
            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Current password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-3 border rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your current password"
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your new password"
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          )}
        </div>

        {/* Display */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold text-gray-700 cursor-pointer hover:text-blue-600 mb-2"
            onClick={() => setShowDisplayFields(!showDisplayFields)}
          >
            Display {showDisplayFields ? '▲' : '▼'}
          </h3>
          {showDisplayFields && (
            <div className="mt-4">
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Font size
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full p-3 border rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          )}
        </div>

        {/* Notification */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold text-gray-700 cursor-pointer hover:text-blue-600 mb-2"
            onClick={() => setShowNotificationFields(!showNotificationFields)}
          >
            Notification {showNotificationFields ? '▲' : '▼'}
          </h3>
          {showNotificationFields && (
            <div className="mt-4">
              <label className="block text-base font-semibold text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="mr-2"
                />
                Get notification via email
              </label>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={browserNotifications}
                  onChange={(e) => setBrowserNotifications(e.target.checked)}
                  className="mr-2"
                />
                Get notification on browser
              </label>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white font-bold p-3 rounded hover:bg-blue-600 transition-colors text-base"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Setting;