import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Calendar from './components/Calendar';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    {/* logowanie */}
                    <Route 
                        path="/login" 
                        element={
                            isAuthenticated ? (
                                <Navigate to="/calendar" replace />
                            ) : (
                                <Login onLoginSuccess={() => setIsAuthenticated(true)} />
                            )
                        } 
                    />
                    
                    {/* kalendarz */}
                    <Route 
                        path="/calendar" 
                        element={
                            isAuthenticated ? (
                                <Calendar />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        } 
                    />

                    {/* domyślnie logowanie */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
