import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function Landing() {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Bootcamp LMS</h1>
      <p>Project scaffold is running. Refer to docs/FRONTEND_DESIGN.md for page contracts.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
