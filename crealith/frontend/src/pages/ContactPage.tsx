import React, { useState } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Users,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simuler l'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 2000));

      dispatch(addNotification({
        type: 'success',
        message: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
        duration: 5000
      }));

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.',
        duration: 4000
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'danbetheliryivuze@gmail.com',
      description: 'Réponse sous 24h'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      value: '+33 6 09 40 93 59',
      description: 'Lun-Ven 9h-18h'
    },
    {
      icon: MapPin,
      title: 'Localisation',
      value: 'Toulouse, France',
      description: 'Projet indépendant'
    },
    {
      icon: Clock,
      title: 'Horaires',
      value: '9h00 - 18h00',
      description: 'Lundi au Vendredi'
    }
  ];

  const supportTypes = [
    {
      icon: MessageCircle,
      title: 'Support Général',
      description: 'Questions générales sur la plateforme'
    },
    {
      icon: Users,
      title: 'Support Vendeur',
      description: 'Aide pour les créateurs et vendeurs'
    },
    {
      icon: Headphones,
      title: 'Support Technique',
      description: 'Problèmes techniques et bugs'
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
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="responsive-text font-black mb-6 text-gradient-primary">
              Contactez-nous
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Nous sommes là pour vous aider ! Que vous ayez une question,
              un problème ou simplement envie de nous dire bonjour.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="text-center group animate-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-premium group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-100 mb-2">{info.title}</h3>
                  <p className="text-primary-400 font-semibold mb-2">{info.value}</p>
                  <p className="text-gray-400 text-sm">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-100 mb-4">
                  Envoyez-nous un message
                </h2>
                <p className="text-gray-300">
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-gray-300 mb-2">
                    Type de demande *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="general">Support Général</option>
                    <option value="seller">Support Vendeur</option>
                    <option value="technical">Support Technique</option>
                    <option value="billing">Facturation</option>
                    <option value="partnership">Partenariat</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Sujet de votre message"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-8 py-4 text-lg rounded-2xl shadow-premium hover:shadow-2xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Support Types & FAQ */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-100 mb-4">
                  Types de support
                </h2>
                <p className="text-gray-300">
                  Choisissez le type de support qui correspond le mieux à votre demande.
                </p>
              </div>

              <div className="space-y-6 mb-12">
                {supportTypes.map((support, index) => {
                  const Icon = support.icon;
                  return (
                    <div key={index} className="p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-primary-500/50 transition-all duration-300 group">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-premium group-hover:shadow-large transition-all duration-300">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-100 mb-2">{support.title}</h3>
                          <p className="text-gray-400">{support.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FAQ Section */}
              <div>
                <h3 className="text-2xl font-black text-gray-100 mb-6">
                  Questions fréquentes
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <h4 className="font-semibold text-gray-100 mb-2">
                      Comment devenir vendeur sur Crealith ?
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Cliquez sur "Devenir vendeur" dans le menu, remplissez le formulaire
                      et notre équipe validera votre compte sous 24h.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <h4 className="font-semibold text-gray-100 mb-2">
                      Quels sont les frais de la plateforme ?
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Nous prenons 5% sur chaque vente. Aucun frais d'inscription ou mensuel.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <h4 className="font-semibold text-gray-100 mb-2">
                      Comment fonctionne le système de paiement ?
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Nous utilisons Stripe pour des paiements sécurisés. Les vendeurs
                      reçoivent leurs paiements sous 2-3 jours ouvrés.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="responsive-heading font-black text-white mb-6">
            Besoin d'aide immédiate ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Notre équipe de support est disponible pour vous aider du lundi au vendredi, 9h à 18h.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="mailto:danbetheliryivuze@gmail.com"
              className="bg-white text-primary-600 px-8 py-4 rounded-3xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              danbetheliryivuze@gmail.com
            </a>
            <a
              href="tel:+33609409359"
              className="border-2 border-white text-white px-8 py-4 rounded-3xl text-lg font-bold hover:bg-white hover:text-primary-600 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              +33 6 09 40 93 59
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
