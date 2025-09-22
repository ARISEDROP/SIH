import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Corrected import path to point to the main App component in the 'src' directory.
import App from './src/App';
// FIX: Imported the AppProvider to make the application context available to all components.
import { AppProvider } from './src/context/AppContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* FIX: Wrapped the App component with AppProvider to provide necessary context. */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
