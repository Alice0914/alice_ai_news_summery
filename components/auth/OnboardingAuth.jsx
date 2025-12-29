import React, { useState } from 'react';
import { Mail, Lock, User, Check, ArrowRight, Linkedin } from 'lucide-react';
import {
    signInWithGoogle,
    signInWithLinkedIn,
    signUpWithEmail,
    signInWithEmail
} from '../../firebaseConfig';

const OnboardingAuth = ({ onLoginSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

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
            // Auth listener in App.jsx will handle the redirect to Step 5
        } catch (err) {
            console.error(err);
            let msg = "Authentication failed. Please try again.";
            if (err.code === 'auth/email-already-in-use') msg = "This email is already registered.";
            if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
            if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setError(null);
        setLoading(true);
        try {
            if (provider === 'google') await signInWithGoogle();
            if (provider === 'linkedin') await signInWithLinkedIn();
        } catch (err) {
            console.error(err);
            setError("Social login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">

                {/* Header Section */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        Showtime!
                    </h1>
                    <p className="text-white/60 text-sm">
                        {isSignUp
                            ? "당신만을 위한 뉴스 피드가 준비되었습니다."
                            : "계정에 로그인하여 맞춤 뉴스를 확인하세요."}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-[#141724] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-500">

                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-black/20 rounded-xl mb-6">
                        <button
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isSignUp
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isSignUp
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                            <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name (Sign Up Only) */}
                        {isSignUp && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="이름을 입력하세요"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-black/30 outline-none transition-all placeholder:text-white/20"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-black/30 outline-none transition-all placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-blue-500/50 focus:bg-black/30 outline-none transition-all placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? '무료 계정 만들기' : '이메일로 로그인'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <span className="relative px-3 bg-[#141724] text-xs font-medium text-white/30 uppercase tracking-widest">
                            Or continue with
                        </span>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                                    fillRule="evenodd"
                                    className="text-white"
                                />
                            </svg>
                            <span className="text-sm font-medium text-white/80 group-hover:text-white">Google</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('linkedin')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/30 transition-all group"
                        >
                            <Linkedin className="w-5 h-5 text-[#0077b5] group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-[#0077b5] group-hover:text-[#007aaa]">LinkedIn</span>
                        </button>
                    </div>

                </div>

                {/* Footer Text */}
                <p className="text-center text-xs text-white/20 mt-6">
                    정보는 안전하게 암호화되어 저장됩니다.
                </p>
            </div>
        </div>
    );
};

export default OnboardingAuth;
