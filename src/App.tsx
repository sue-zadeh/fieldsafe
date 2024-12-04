import React, { useState } from 'react';
import Sidebar from './components/sidebar';
import Login from './components/login';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    return (
        <div>
            {!isLoggedIn ? (
                <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
                <div className="d-flex">
                    <Sidebar />
                    <div className="p-4 flex-grow-1">
                        <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
                            <span className="navbar-brand">Welcome to FieldBase</span>
                        </nav>
                        <div className="container">
                            <h3>Main Content</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
