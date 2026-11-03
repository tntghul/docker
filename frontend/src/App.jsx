import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
