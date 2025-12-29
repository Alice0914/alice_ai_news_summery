import React, { useState } from 'react';
import {
    signInWithGoogle,
    signInWithTwitter,
    signInWithLinkedIn,
    signUpWithEmail,
    signInWithEmail
} from '../../firebaseConfig';
import { ChevronLeft, Mail, Lock, User, Check, AlertCircle, X } from 'lucide-react';
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

const AuthPage = ({ isOpen = true, onClose, onComplete, onAuthSuccess, onSignupClick }) => {
    const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Determine if this is standalone page mode or modal mode
    const isStandalone = !onClose;

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
        setLoading(true);

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password, name);
            } else {
                await signInWithEmail(email, password);
            }
            handleAuthComplete();
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
            if (providerName === 'google') await signInWithGoogle();
            if (providerName === 'twitter') await signInWithTwitter();
            if (providerName === 'linkedin') await signInWithLinkedIn();
            handleAuthComplete();
        } catch (err) {
            setError(`Failed to sign in with ${providerName}. ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={isStandalone ? "min-h-[100dvh] bg-[#0f111a] flex items-center justify-center p-4" : "fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"}>
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
                            {isSignUp ? '계정 생성' : '로그인'}
                        </h2>
                        <p className="text-white/60 text-sm">
                            당신만의 AI 뉴스를 확인하려면 로그인하세요.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Social Buttons (Google First) */}
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="w-full py-3 mb-4 rounded-xl bg-white text-black font-bold text-sm shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                        <GoogleIcon />
                        <span>Google로 {isSignUp ? '계속하기' : '로그인'}</span>
                    </button>



                    {/* Divider */}
                    <div className="relative flex py-2 items-center mb-4">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-3 text-white/30 text-[10px]">또는 이메일로 {isSignUp ? '가입' : '로그인'}</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {isSignUp && (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                                    placeholder="이름"
                                    required
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
                                placeholder="이메일"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
                                placeholder="비밀번호"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '처리중...' : (isSignUp ? '이메일로 가입하기' : '이메일로 로그인')}
                        </button>
                    </form>

                    {/* Switch Toggle */}
                    <div className="mt-4 text-center">
                        <p className="text-white/40 text-xs">
                            {isSignUp ? '계정이 있으신가요?' : '계정이 없으신가요?'}
                            <button
                                onClick={() => {
                                    // If in standalone mode and clicking signup, go to onboarding
                                    if (isStandalone && !isSignUp && onSignupClick) {
                                        onSignupClick();
                                    } else {
                                        setIsSignUp(!isSignUp);
                                    }
                                }}
                                className="ml-2 text-blue-400 hover:text-blue-300 font-bold transition-colors"
                            >
                                {isSignUp ? '로그인' : '회원가입'}
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AuthPage;
