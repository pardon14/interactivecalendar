import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { username, password });
            localStorage.setItem('token', response.data.token);  // zapisuje token w localStorage
            onLoginSuccess(response.data);  // przekazuje dane logowania do komponentu nadrzędnego
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/register', { username, password });
            alert(response.data.message);
            setIsRegistering(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="login-container">
            <h1>{isRegistering ? 'Register' : 'Login'}</h1>
            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                <label>
                    Username:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
            </form>
            <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="toggle-mode"
            >
                {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
        </div>
    );
};

export default Login;
