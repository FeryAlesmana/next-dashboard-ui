import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Opsional, kalau kamu punya file CSS global

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
