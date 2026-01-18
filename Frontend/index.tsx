import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import ParticipantLookup from './pages/ParticipantLookup.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Simple Routing
const path = window.location.pathname;
let Component = App;

if (path === '/lookup') {
  Component = ParticipantLookup;
}

import ErrorBoundary from './components/ErrorBoundary.tsx';

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  </React.StrictMode>
);