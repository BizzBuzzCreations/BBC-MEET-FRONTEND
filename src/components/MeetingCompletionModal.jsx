import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * A modal to finalize/complete a meeting using an OTP provided by the client.
 */
export default function MeetingCompletionModal({ meeting, onClose, onCompleted }) {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [completing, setCompleting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState('');

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        } else {
            setResendStatus('');
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!meeting) return null;

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setResendStatus('Sending...');
        setError('');
        try {
            await api.resendOTP(meeting.id);
            setResendStatus('Sent!');
            setResendCooldown(30);
        } catch (err) {
            console.error('Resend failed:', err);
            setError(err.message || 'Failed to resend OTP.');
            setResendStatus('');
        }
    };

    const handleComplete = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length < 4) {
            setError('Please enter a valid OTP');
            return;
        }

        setCompleting(true);
        try {
            await api.markCompleted(meeting.id, otp);
            onCompleted(meeting.id);
            onClose();
        } catch (err) {
            console.error('Completion failed:', err);
            setError(err.message || 'Incorrect OTP. Please try again.');
        } finally {
            setCompleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-950 w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Complete Meeting</h2>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{meeting.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleComplete} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                    <div className="text-center">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Finalize Session</h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium italic px-4">Enter the completion OTP provided by the client to mark this session as finished.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <input
                                type="text"
                                maxLength={10}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="ENTER OTP"
                                className={`w-full text-center text-2xl sm:text-3xl font-black tracking-widest py-5 sm:py-6 bg-gray-50 dark:bg-gray-900 border-2 ${error ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-blue-600'} rounded-2xl sm:rounded-3xl outline-none transition-all placeholder:text-gray-200 uppercase`}
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            {error && (
                                <p className="text-[10px] text-red-500 font-extrabold uppercase text-center animate-bounce">{error}</p>
                            )}

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendCooldown > 0}
                                className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                                {resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : resendStatus === 'Sent!'
                                        ? '✅ Code Resent Successfully'
                                        : resendStatus === 'Sending...'
                                            ? 'Sending...'
                                            : 'Didn\'t get a code? Resend OTP'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={completing || otp.length < 3}
                        className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                    >
                        {completing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                <span>Confirm Completion</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="px-8 pb-8 text-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                    >
                        Cancel and Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
