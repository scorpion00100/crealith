import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from '@/store';

// Composant de test minimal
const TestHomePage = () => (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Crealith</h1>
            <p className="text-xl text-gray-300">Application de test fonctionnelle</p>
            <div className="mt-8">
                <button className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg">
                    Test Button
                </button>
            </div>
        </div>
    </div>
);

const MinimalApp: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/" element={<TestHomePage />} />
                    <Route path="*" element={<TestHomePage />} />
                </Routes>
            </Router>
        </Provider>
    );
};

export default MinimalApp;
