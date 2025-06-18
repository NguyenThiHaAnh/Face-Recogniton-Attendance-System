import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-lg font-semibold">
      {time.toLocaleDateString('vi-VN')} {time.toLocaleTimeString('vi-VN')}
    </div>
  );
};

export default Clock;