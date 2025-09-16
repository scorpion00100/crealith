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
        { icon: Users, value: 'Projet solo', label: 'Par Dan Bethel IRYIVUZE' },
        { icon: Star, value: 'Qualité', label: 'UX/UI moderne' },
        { icon: Globe, value: 'Toulouse', label: 'France' },
        { icon: Award, value: 'Engagé', label: 'Satisfaction utilisateurs' }
    ];

    const values = [
        {
            icon: Heart,
            title: 'Passion',
            description: 'Je conçois une expérience fluide et élégante pour les créateurs et acheteurs.'
        },
        {
            icon: Users,
            title: 'Communauté',
            description: 'Construire un écosystème bienveillant qui valorise les talents.'
        },
        {
            icon: Award,
            title: 'Excellence',
            description: 'Code propre, typé et maintenable; design soigné et accessible.'
        },
        {
            icon: Globe,
            title: 'Transparence',
            description: 'Communication directe, délais clairs et priorités partagées.'
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
                            Crealith est un projet indépendant porté par <strong>Dan Bethel IRYIVUZE</strong>,
                            basé à <strong>Toulouse, France</strong>. Objectif: une marketplace moderne et stable
                            pour découvrir, acheter et vendre des produits digitaux de qualité.
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
                                Mon Histoire
                            </h2>
                            <div className="space-y-6 text-gray-300">
                                <p className="text-lg leading-relaxed">
                                    Crealith est né d’une envie: simplifier l’accès à des créations digitales
                                    fiables, bien présentées et prêtes à l’emploi.
                                </p>
                                <p className="text-lg leading-relaxed">
                                    En tant que développeur full‑stack, je construis le produit étape par étape,
                                    sans jamais casser l’existant, en priorisant un MVP complet et utilisable.
                                </p>
                                <p className="text-lg leading-relaxed">
                                    Vous pouvez me contacter directement: <a className="text-primary-400" href="mailto:danbetheliryivuze@gmail.com">danbetheliryivuze@gmail.com</a> · <a className="text-primary-400" href="tel:+33609409359">+33 6 09 40 93 59</a>.
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="w-full h-96 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-premium">
                                        <Zap className="w-16 h-16 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-100 mb-2">Projet indépendant</h3>
                                    <p className="text-gray-300">Développé avec soin à Toulouse</p>
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
                            Contact direct
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Un seul interlocuteur pour un produit clair et une roadmap maîtrisée.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center group animate-in-up">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-premium" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-100 mb-2">Dan Bethel IRYIVUZE</h3>
                            <p className="text-primary-400 font-semibold mb-3">Fondateur & Développeur</p>
                            <p className="text-gray-400 text-sm leading-relaxed">Toulouse, France</p>
                            <div className="mt-3 space-x-4">
                                <a className="text-primary-400" href="mailto:danbetheliryivuze@gmail.com">Email</a>
                                <a className="text-primary-400" href="tel:+33609409359">Téléphone</a>
                            </div>
                        </div>
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
