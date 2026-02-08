import React, { useState, useEffect } from 'react';
import {
    signInWithGoogle,
    signInWithTwitter,
    signInWithLinkedIn,
    signUpWithEmail,
    signInWithEmail,
    sendResetEmail // Added
} from '../../firebaseConfig';
import { ChevronLeft, Mail, Lock, User, Check, AlertCircle, X, ExternalLink } from 'lucide-react';
import { YoutubeIcon, DiscordIcon } from '../ui/Icons'; // Re-using existing icons if available, else we'll use Lucide or text

// Simple Social Icons (using text or placeholders if SVG not available)
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const XIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

import { useTranslation } from 'react-i18next'; // Added

// Helper function to detect in-app browsers
const isInAppBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    // Check for common in-app browser patterns
    const inAppPatterns = [
        'FBAN',           // Facebook App
        'FBAV',           // Facebook App
        'Instagram',      // Instagram
        'LinkedIn',       // LinkedIn
        'KAKAOTALK',      // KakaoTalk
        'Line/',          // LINE
        'Twitter',        // Twitter/X App
        'Snapchat',       // Snapchat
        'WeChat',         // WeChat
        'MicroMessenger', // WeChat
        'Slack',          // Slack
        'Discord',        // Discord
    ];

    return inAppPatterns.some(pattern => ua.includes(pattern));
};

// ... (icons remain same)

const AuthPage = ({ isOpen = true, onClose, onComplete, onAuthSuccess, onSignupClick, onSignupStart }) => {
    const { t, i18n } = useTranslation();
    // 'login' | 'signup' | 'reset'
    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showInAppWarning, setShowInAppWarning] = useState(false);

    // Check for in-app browser on mount
    useEffect(() => {
        if (isInAppBrowser()) {
            setShowInAppWarning(true);
        }
    }, []);


    // Determine if this is standalone page mode or modal mode
    const isStandalone = !onClose;

    // Reset state when modal closes or opens
    React.useEffect(() => {
        if (!isOpen) {
            // Reset when closed
            setAuthMode('login');
            setEmail('');
            setPassword('');
            setName('');
            setError(null);
            setSuccessMessage('');
        }
    }, [isOpen]);

    // If modal mode and not open, return null
    if (!isStandalone && !isOpen) return null;

    const handleAuthComplete = () => {
        if (onAuthSuccess) onAuthSuccess();
        if (onComplete) onComplete();
        if (onClose) onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');
        setLoading(true);

        try {
            if (authMode === 'reset') {
                if (!email) {
                    throw new Error(t('enter_email_reset'));
                }
                await sendResetEmail(email);
                setSuccessMessage(t('reset_email_sent'));
            } else if (authMode === 'signup') {
                if (onSignupStart) onSignupStart();
                await signUpWithEmail(email, password, name);
                handleAuthComplete();
            } else {
                // login
                await signInWithEmail(email, password);
                handleAuthComplete();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (providerName) => {
        setError(null);
        setLoading(true);
        try {
            let user = null;
            if (providerName === 'google') user = await signInWithGoogle();
            if (providerName === 'twitter') user = await signInWithTwitter();
            if (providerName === 'linkedin') user = await signInWithLinkedIn();
            // Now using signInWithPopup, we get the user back immediately
            if (user) {
                handleAuthComplete();
            }
        } catch (err) {
            setError(`Failed to sign in with ${providerName}. ${err.message}`);
            setLoading(false);
        }
        // Note: setLoading(false) is not called on success because the page will navigate away
    };

    const isResetMode = authMode === 'reset';
    const isSignUp = authMode === 'signup';

    return (
        <div className={isStandalone ? "min-h-[100dvh] bg-[#0f111a] flex items-center justify-center p-4" : "fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"}>
            {/* Full screen loading overlay during social login */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-[#0f111a] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-white/60 text-sm">{i18n.language === 'ko' ? '로그인 중...' : 'Logging in...'}</p>
                    </div>
                </div>
            )}
            <div className="w-full max-w-sm bg-[#1a1f2e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">

                {/* Close Button (only for modal mode) */}
                {!isStandalone && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="p-6 md:p-8">
                    {/* Welcome Text */}
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold mb-2 text-white">
                            {isResetMode ? t('forgot_password') : (isSignUp ? t('create_account') : t('sign_in'))}
                        </h2>
                        <p className={`text-white/60 text-sm ${isResetMode ? 'whitespace-nowrap' : ''}`}>
                            {isResetMode ? t('enter_email_reset') : t('auth_subtitle')}
                        </p>
                    </div>

                    {/* Error / Success Message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-200 text-xs flex items-start gap-2">
                            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* In-App Browser Warning */}
                    {showInAppWarning && (
                        <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-start gap-3">
                                <ExternalLink className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-amber-300 font-semibold text-sm mb-2">
                                        {i18n.language === 'ko' ? '외부 브라우저에서 열어주세요' : 'Open in External Browser'}
                                    </h3>
                                    <p className="text-amber-200/80 text-xs leading-relaxed">
                                        {i18n.language === 'ko'
                                            ? 'Google 로그인은 인앱 브라우저에서 지원되지 않습니다. 우측 상단의 메뉴(⋯ 또는 ⋮)를 탭하여 외부 브라우저에서 열어주세요.'
                                            : 'Google Sign-in is not supported in in-app browsers. Tap the menu (⋯ or ⋮) at the top right to open in your browser.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Social Buttons (Hidden in Reset Mode or In-App Browser) */}
                    {!isResetMode && !showInAppWarning && (
                        <>
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="w-full py-3 mb-4 rounded-xl bg-white text-black font-bold text-sm shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                                <GoogleIcon />
                                <span>{isSignUp ? t('continue_with_google') : t('signin_with_google')}</span>
                            </button>

                            <div className="relative flex py-2 items-center mb-4">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-3 text-white/30 text-[10px]">{isSignUp ? t('or_signup_email') : t('or_signin_email')}</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>
                        </>
                    )}

                    {/* Form (Hidden in In-App Browser) */}
                    {!showInAppWarning && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            {isSignUp && (
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                                        placeholder={t('name_placeholder')}
                                        required={isSignUp}
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                                    placeholder={t('email_placeholder')}
                                    required
                                />
                            </div>

                            {!isResetMode && (
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                                        placeholder={t('password_placeholder')}
                                        required
                                    />
                                </div>
                            )}

                            {!isResetMode && !isSignUp && (
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAuthMode('reset');
                                            setError(null);
                                            setSuccessMessage('');
                                        }}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        {t('forgot_password')}
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 mt-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('processing') : (isResetMode ? t('send_reset_link') : (isSignUp ? t('signup_with_email') : t('signin_with_email')))}
                            </button>
                        </form>
                    )}

                    {/* Switch Toggle or Back Button (Hidden in In-App Browser) */}
                    {!showInAppWarning && (
                        <div className="mt-4 text-center">
                            {isResetMode ? (
                                <button
                                    onClick={() => {
                                        setAuthMode('login');
                                        setError(null);
                                        setSuccessMessage('');
                                    }}
                                    className="text-white/40 hover:text-white text-xs transition-colors"
                                >
                                    {t('back_to_login')}
                                </button>
                            ) : (
                                <p className="text-white/40 text-xs">
                                    {isSignUp ? t('already_have_account') : t('dont_have_account')}
                                    <button
                                        onClick={() => {
                                            if (isStandalone && !isSignUp && onSignupClick) {
                                                onSignupClick();
                                            } else {
                                                setAuthMode(isSignUp ? 'login' : 'signup');
                                            }
                                        }}
                                        className="ml-2 text-blue-400 hover:text-blue-300 font-bold transition-colors"
                                    >
                                        {isSignUp ? t('sign_in') : t('signup')}
                                    </button>
                                </p>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AuthPage;
