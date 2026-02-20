import { useState, useEffect } from 'react';
import api from '../services/api';

export default function MeetingVerificationModal({ meeting, onClose, onVerified }) {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [step, setStep] = useState(1);
    const [capturedImage, setCapturedImage] = useState(null);
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

    const handleVerify = async () => {
        if (step === 1) {
            if (otp.length < 4) {
                setError('OTP must be at least 4 digits');
                return;
            }

            setVerifying(true);
            setError('');
            try {
                // Call API immediately to verify OTP and mark as completed on backend
                await api.markCompleted(meeting.id, otp);

                // If successful, proceed to Step 2 for image capture
                setStep(2);
            } catch (err) {
                console.error('OTP Verification failed:', err);
                setError(err.message || 'Invalid OTP. Please try again or resend.');
            } finally {
                setVerifying(false);
            }
            return;
        }

        // Step 2: Finalizing locally after image capture
        if (!capturedImage) {
            setError('Please capture a photo to finish');
            return;
        }

        if (onVerified) onVerified(meeting.id);
        onClose();
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setResendStatus('Sending...');
        setError('');
        try {
            await api.resendOTP(meeting.id);
            setResendStatus('Sent!');
            setResendCooldown(60);
        } catch (err) {
            console.error('Resend failed:', err);
            setError(err.message || 'Failed to resend OTP.');
            setResendStatus('');
        }
    };

    const handleImageCapture = () => {

        setCapturedImage('https://via.placeholder.com/400x300.png?text=Captured+Verification+Image');
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-950 w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Meeting Verification</h2>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{meeting?.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                    {/* Stepper */}
                    <div className="flex items-center justify-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-blue-600 scale-125' : 'bg-gray-200 dark:bg-gray-800'}`} />
                        <div className={`w-10 sm:w-12 h-0.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-600 scale-125' : 'bg-gray-200 dark:bg-gray-800'}`} />
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                            <div className="text-center">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Enter OTP</h3>
                                <p className="text-xs sm:text-sm text-gray-500 font-medium px-4">Please enter the 6-digit code provided by the client.</p>
                            </div>
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className={`w-full text-center text-3xl sm:text-4xl font-black tracking-widest py-5 sm:py-6 bg-gray-50 dark:bg-gray-900 border-2 ${error ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-blue-600'} rounded-2xl sm:rounded-3xl outline-none transition-all placeholder:text-gray-200`}
                            />

                            <div className="flex flex-col items-center gap-2">
                                {error && (
                                    <p className="text-[10px] text-red-500 font-extrabold uppercase text-center animate-bounce">{error}</p>
                                )}

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-all ${resendCooldown > 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700 underline underline-offset-4'}`}
                                >
                                    {resendCooldown > 0
                                        ? `Resend in ${resendCooldown}s`
                                        : resendStatus === 'Sent!'
                                            ? '✅ Code Sent'
                                            : resendStatus === 'Sending...'
                                                ? 'Sending...'
                                                : 'Didn\'t get a code? Resend'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                            <div className="text-center">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Capture Image</h3>
                                <p className="text-xs sm:text-sm text-gray-500 font-medium">Capture a photo of the attendee.</p>
                            </div>
                            <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-2xl sm:rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden group">
                                {capturedImage ? (
                                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <button
                                            onClick={handleImageCapture}
                                            className="px-5 py-2 bg-white dark:bg-gray-800 text-[10px] sm:text-sm font-black text-gray-900 dark:text-white rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 active:scale-95 transition-all"
                                        >
                                            Take Photo
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 py-4 text-xs font-black text-gray-500 uppercase tracking-widest"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleVerify}
                        disabled={verifying || (step === 1 && otp.length < 4) || (step === 2 && !capturedImage)}
                        className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                        {verifying ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{step === 1 ? 'Continue' : 'Complete Verification'}</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
