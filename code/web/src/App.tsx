import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  console.log('App render - isLoggedIn:', isLoggedIn);

  const handleLogin = () => {
    console.log('Login successful, setting isLoggedIn to true');
    setIsLoggedIn(true);
  };

  // Temporary bypass for testing
  const bypassLogin = () => {
    console.log('Bypassing login for testing');
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div>
        <LoginForm onLogin={handleLogin} />
        <div className="fixed bottom-4 right-4">
          <button
            onClick={bypassLogin}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
          >
            Skip Login (Test)
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default App;

