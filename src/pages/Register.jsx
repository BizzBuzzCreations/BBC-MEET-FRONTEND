import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import Footer from '../components/Footer';


const InputField = ({ label, name, type, icon, placeholder, value, onChange, showToggle, onToggle, showState }) => (
    <div className="space-y-1.5 w-full">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">
            {label}
        </label>
        <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                {icon}
            </span>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-11 pr-11 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm font-bold"
            />
            {showToggle && (
                <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                    {showState ? <span className="text-lg">👁️</span> : <span className="text-lg">👁️‍🗨️</span>}
                </button>
            )}
        </div>
    </div>
);

export default function Register() {
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirm: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!form.name || !form.username || !form.email || !form.password || !form.confirm) {
            setError('Please fill in all fields.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Account
            const regResult = await register({
                name: form.name,
                username: form.username,
                email: form.email,
                password: form.password
            });

            if (!regResult.success) {
                setError(regResult.error || 'Registration failed.');
                setLoading(false);
                return;
            }

            // 2. Clear Form & Show Success
            setSuccess('Account created! Logging you in automatically...');

            // 3. Auto-Login (One-Click Flow)
            const logResult = await login(form.username, form.password);

            if (logResult.success) {
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                // If auto-login fails for some reason, just redirect to login page
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-meetflow dark:bg-meetflow-dark flex flex-col items-center justify-center pt-4 pb-0">
            <div className="w-full max-w-lg mx-auto relative z-10 py-10 px-4">
                {/* Logo Section */}
                <div className="flex justify-center mb-10 transform hover:scale-105 transition-transform duration-300">
                    <Logo />
                </div>

                {/* Main Registration Card */}
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-8 border border-white dark:border-gray-800/50 overflow-hidden">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Create Account</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Join our BizzBuzz Team</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField
                            label="Full Name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Alex Johnson"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                        />

                        <InputField
                            label="Username"
                            name="username"
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="alex_j"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />

                        <InputField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="alex@meetflow.com"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        />

                        <InputField
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            showToggle={true}
                            onToggle={() => setShowPassword(!showPassword)}
                            showState={showPassword}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                        />

                        <InputField
                            label="Confirm Password"
                            name="confirm"
                            type={showConfirm ? 'text' : 'password'}
                            value={form.confirm}
                            onChange={handleChange}
                            placeholder="••••••••"
                            showToggle={true}
                            onToggle={() => setShowConfirm(!showConfirm)}
                            showState={showConfirm}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h.01M12 12h.01M15 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        />

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-2xl flex items-center gap-3 animate-bounce">
                                <svg className="w-6 h-6 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                <p className="text-sm text-red-700 dark:text-red-400 font-black">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-2xl flex items-center gap-3">
                                <svg className="w-6 h-6 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-extrabold">{success}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-white font-black rounded-[2rem] transition-all duration-300 shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-4 text-xl tracking-wide uppercase"
                        >
                            {loading ? (
                                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            ) : (
                                <>
                                    <span>Sign Up Now</span>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                            Already part of BizzBuzz?{' '}
                            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-black transition-all ml-2 underline decoration-4 underline-offset-8">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-auto w-full relative z-10">
                <Footer />
            </div>
        </div>
    );
}
