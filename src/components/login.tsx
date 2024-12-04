import React, { useState } from 'react';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Please enter a username and password.');
            return;
        }

        setIsLoading(true);
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        setIsLoading(false);

        if (data.message === 'Login successful') {
            onLoginSuccess();
            if (rememberMe) {
                localStorage.setItem('username', username); // Remember username
            }
            setError('');
        } else {
            setError(data.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="login-container d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#F4F7F1' }}>
            <div className="login-box p-4 shadow rounded" style={{ backgroundColor: '#FFFFFF', width: '400px' }}>
                <h2 className="text-center mb-4" style={{ color: '#76D6E2' }}>Welcome to FieldBase</h2>
                <h3 className="text-center my-4" style={{ color: '#76D6E2' }}><i>Login</i></h3>

                <div className="form-group mb-3">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        className={`form-control ${!username && error ? 'is-invalid' : ''}`}
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        className={`form-control ${!password && error ? 'is-invalid' : ''}`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <div className="text-danger">{error}</div>}
                <div className="form-group form-check">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        className="form-check-input"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="rememberMe" className="form-check-label">Remember Me</label>
                </div>
                <button
                    className="btn w-100 mt-3"
                    style={{ backgroundColor: '#0094B6', color: 'white' }}
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </div>
        </div>
    );
};

export default Login;
