import React from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Target,
    Award,
    Heart,
    Globe,
    Sparkles,
    ArrowRight,
    CheckCircle,
    Star,
    Zap
} from 'lucide-react';

export const AboutPage: React.FC = () => {
    const stats = [
        { icon: Users, value: '5,000+', label: 'Créateurs actifs' },
        { icon: Star, value: '50,000+', label: 'Téléchargements' },
        { icon: Globe, value: '120+', label: 'Pays représentés' },
        { icon: Award, value: '4.9/5', label: 'Note moyenne' }
    ];

    const values = [
        {
            icon: Heart,
            title: 'Passion',
            description: 'Nous croyons en la puissance de la créativité et de l\'innovation pour transformer le monde digital.'
        },
        {
            icon: Users,
            title: 'Communauté',
            description: 'Nous construisons un écosystème où créateurs et acheteurs peuvent collaborer et s\'épanouir.'
        },
        {
            icon: Award,
            title: 'Excellence',
            description: 'Nous nous engageons à offrir des produits de qualité supérieure et une expérience utilisateur exceptionnelle.'
        },
        {
            icon: Globe,
            title: 'Accessibilité',
            description: 'Nous rendons la créativité accessible à tous, partout dans le monde, à des prix équitables.'
        }
    ];

    const team = [
        {
            name: 'Alexandre Dubois',
            role: 'Fondateur & CEO',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
            description: 'Passionné de design et entrepreneur depuis 10 ans.'
        },
        {
            name: 'Marie Leroy',
            role: 'CTO',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
            description: 'Experte en technologies web et architecture scalable.'
        },
        {
            name: 'Thomas Martin',
            role: 'Head of Design',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
            description: 'Designer créatif avec une vision unique de l\'UX/UI.'
        }
    ];

    return (
        <div className="min-h-screen text-gray-100">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10"></div>

                <div className="relative container-custom section-padding">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="flex items-center justify-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-premium animate-float">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        <h1 className="responsive-text font-black mb-6 text-gradient-primary">
                            À propos de Crealith
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                            Nous sommes la plateforme qui connecte les créateurs talentueux du monde entier
                            avec des acheteurs passionnés, créant un écosystème florissant pour l'innovation digitale.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                to="/catalog"
                                className="group inline-flex items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-8 py-4 text-lg rounded-2xl shadow-premium hover:shadow-2xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105"
                            >
                                <span>Découvrir nos créations</span>
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                            <Link
                                to="/contact"
                                className="btn-outline px-8 py-4 text-lg shadow-medium hover:shadow-large"
                            >
                                Nous contacter
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-800">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="text-center group animate-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-premium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                                        <Icon className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="text-4xl font-black mb-2 text-gradient-primary">{stat.value}</div>
                                    <div className="text-gray-300 font-semibold">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-gray-900">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="responsive-heading font-black text-gradient-secondary mb-6">
                            Notre Mission
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Révolutionner la façon dont les créateurs partagent leurs œuvres et dont les acheteurs
                            découvrent des produits digitaux de qualité exceptionnelle.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div key={index} className="text-center group animate-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-secondary group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                                        <Icon className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-100 mb-4">{value.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="responsive-heading font-black text-gradient-primary mb-6">
                                Notre Histoire
                            </h2>
                            <div className="space-y-6 text-gray-300">
                                <p className="text-lg leading-relaxed">
                                    Fondée en 2023, Crealith est née d'une vision simple : créer un pont entre
                                    les créateurs talentueux et les acheteurs passionnés dans l'univers digital.
                                </p>
                                <p className="text-lg leading-relaxed">
                                    Nous avons constaté que de nombreux créateurs avaient du mal à monétiser
                                    leurs œuvres, tandis que les acheteurs cherchaient des produits de qualité
                                    sans savoir où les trouver.
                                </p>
                                <p className="text-lg leading-relaxed">
                                    Aujourd'hui, nous sommes fiers d'être devenus la référence pour l'achat
                                    et la vente de produits digitaux créatifs, avec une communauté grandissante
                                    de plus de 5,000 créateurs actifs.
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="w-full h-96 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-premium">
                                        <Zap className="w-16 h-16 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-100 mb-2">2023</h3>
                                    <p className="text-gray-300">Année de création</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gray-900">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="responsive-heading font-black text-gradient-secondary mb-6">
                            Notre Équipe
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Des passionnés qui travaillent chaque jour pour faire de Crealith
                            la meilleure plateforme pour les créateurs et acheteurs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="text-center group animate-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="relative mb-6">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-32 h-32 rounded-full mx-auto object-cover shadow-premium group-hover:shadow-large transition-all duration-300"
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-100 mb-2">{member.name}</h3>
                                <p className="text-primary-400 font-semibold mb-3">{member.role}</p>
                                <p className="text-gray-400 text-sm leading-relaxed">{member.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="responsive-heading font-black text-white mb-6">
                        Rejoignez notre communauté
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        Que vous soyez créateur ou acheteur, Crealith vous offre l'opportunité
                        de faire partie d'un écosystème créatif florissant.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/register?type=seller"
                            className="bg-white text-primary-600 px-8 py-4 rounded-3xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                        >
                            Devenir créateur
                        </Link>
                        <Link
                            to="/register?type=buyer"
                            className="border-2 border-white text-white px-8 py-4 rounded-3xl text-lg font-bold hover:bg-white hover:text-primary-600 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                        >
                            Commencer à acheter
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
