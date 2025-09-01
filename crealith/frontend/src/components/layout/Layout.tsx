import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <Header />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
};
