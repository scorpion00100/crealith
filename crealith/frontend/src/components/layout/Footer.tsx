import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="logo">
                            <div className="logo-icon">C</div>
                            <div className="logo-text">Crealith</div>
                        </div>
                        <p>La marketplace créative pour vendre et acheter des designs, templates et assets numériques de qualité.</p>
                    </div>

                    <div className="footer-section">
                        <h4>Produits</h4>
                        <ul>
                            <li><Link to="/catalog?category=templates">Templates Web</Link></li>
                            <li><Link to="/catalog?category=ui-kits">UI Kits</Link></li>
                            <li><Link to="/catalog?category=dashboards">Dashboards</Link></li>
                            <li><Link to="/catalog?category=illustrations">Illustrations</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/help">Centre d'aide</Link></li>
                            <li><Link to="/contact">Nous contacter</Link></li>
                            <li><Link to="/terms">CGU</Link></li>
                            <li><Link to="/privacy">Confidentialité</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Compte</h4>
                        <ul>
                            <li><Link to="/login">Se connecter</Link></li>
                            <li><Link to="/register">Créer un compte</Link></li>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 Crealith. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};
