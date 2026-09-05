import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlaygroundPage from '../features/playground/PlaygroundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/playground" element={<PlaygroundPage />} />
        {/* Default route points to playground for FE-01 preview */}
        <Route path="/" element={<Navigate to="/playground" replace />} />
        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/playground" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
