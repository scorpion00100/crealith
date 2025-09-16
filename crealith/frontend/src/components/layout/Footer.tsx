import React from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Heart,
  Sparkles
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-700/50">
      <div className="container-custom py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-premium group-hover:shadow-large transition-all duration-300 group-hover:rotate-3">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-success-400 to-success-500 rounded-full animate-pulse delay-500"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-gradient-primary">
                  Crealith
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">Marketplace Digital</span>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6">
              La plateforme de référence pour les créateurs digitaux. Découvrez, achetez et vendez des produits créatifs de qualité.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-400 hover:border-primary-500 transition-all duration-300 group">
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-400 hover:border-primary-500 transition-all duration-300 group">
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-secondary-400 hover:border-secondary-500 transition-all duration-300 group">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-accent-400 hover:border-accent-500 transition-all duration-300 group">
                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-100 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              Liens Rapides
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/catalog" className="text-gray-400 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-primary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  Catalogue
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-primary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-primary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-400 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-primary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  Aide
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-primary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-gray-100 mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-secondary-400" />
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-secondary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-secondary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-secondary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-secondary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-secondary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-secondary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-gray-400 hover:text-secondary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-secondary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  Politique de remboursement
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-400 hover:text-secondary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-secondary-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  Sécurité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-100 mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-accent-400" />
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4 text-accent-400" />
                <span>danbetheliryivuze@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-4 h-4 text-accent-400" />
                <span>+33 6 09 40 93 59</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4 text-accent-400" />
                <span>Toulouse, France</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-100 mb-3">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-300"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-r-xl hover:from-accent-700 hover:to-accent-800 transition-all duration-300">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} Crealith. Tous droits réservés. Fait avec ❤️ pour les créateurs.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
                Mentions légales
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
                Cookies
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
                Statut
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
