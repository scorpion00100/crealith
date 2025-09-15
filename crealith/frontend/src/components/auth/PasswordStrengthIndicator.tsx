import React from 'react';

interface PasswordStrengthIndicatorProps {
    password: string;
    className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
    password,
    className = ''
}) => {
    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 'none', score: 0, feedback: '' };

        let score = 0;
        const feedback: string[] = [];

        // Longueur minimale
        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('Au moins 8 caractères');
        }

        // Contient une minuscule
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Une minuscule');
        }

        // Contient une majuscule
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Une majuscule');
        }

        // Contient un chiffre
        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('Un chiffre');
        }

        // Contient un caractère spécial
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Un caractère spécial');
        }

        let strength: 'weak' | 'medium' | 'strong' | 'none';
        if (score <= 2) {
            strength = 'weak';
        } else if (score <= 3) {
            strength = 'medium';
        } else {
            strength = 'strong';
        }

        return {
            strength,
            score,
            feedback: feedback.length > 0 ? `Manque: ${feedback.join(', ')}` : 'Mot de passe fort !'
        };
    };

    const { strength, score, feedback } = getPasswordStrength(password);

    if (!password) return null;

    return (
        <div className={`password-strength ${strength} ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                    Force du mot de passe: {strength === 'weak' ? 'Faible' : strength === 'medium' ? 'Moyen' : 'Fort'}
                </span>
                <span className="text-xs text-gray-500">
                    {score}/5
                </span>
            </div>

            <div className="password-strength-bar">
                <div
                    className={`password-strength-fill ${strength}`}
                    style={{ width: `${(score / 5) * 100}%` }}
                />
            </div>

            <div className="mt-2 text-xs">
                {feedback}
            </div>
        </div>
    );
};
