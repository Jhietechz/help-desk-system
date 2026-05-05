import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import ResetPassword from './components/ResetPassword';

export default function Root() {
  return (
    <Router>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}
