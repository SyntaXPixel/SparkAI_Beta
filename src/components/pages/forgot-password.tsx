import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, Moon, Sun, AlertCircle } from 'lucide-react';
import './login.css';
import starIcon from '../icon/star-2-svgrepo-com.svg';

// Theme Toggle Component
const ThemeToggle = () => {
    const [isDarkBlue, setIsDarkBlue] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('login-dark');
        document.documentElement.classList.remove('login-light');

        // Remove conflicting body classes
        document.body.classList.remove(
            "light-blue",
            "dark-blue",
            "light-purple",
            "dark-purple",
            "light-gradient",
            "dark-gradient"
        );

        setIsDarkBlue(true);
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;

        if (isDarkBlue) {
            root.classList.remove('login-dark');
            root.classList.add('login-light');
        } else {
            root.classList.remove('login-light');
            root.classList.add('login-dark');
        }

        setIsDarkBlue(!isDarkBlue);
    };

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
        >
            {isDarkBlue ? (
                <Sun className="theme-icon" size={20} />
            ) : (
                <Moon className="theme-icon" size={20} />
            )}
        </button>
    );
};

const LoginStyles = () => null;

interface ForgotPasswordPageProps {
    onBackToLogin: () => void;
}

// Password validation
const validatePassword = (password: string) => {
    if (password.length < 8) return false;
    if (/\s/.test(password)) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[@#%&*!?$+\-=^._]/.test(password)) return false;
    return true;
};

export default function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Steps: email -> otp -> newPassword -> success
    const [step, setStep] = useState<'email' | 'otp' | 'newPassword' | 'success'>('email');

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Password validation
    const isPasswordValid = validatePassword(newPassword);
    const doPasswordsMatch = newPassword === confirmPassword;
    const showPasswordError = !isPasswordValid && newPassword.length > 0;
    const showConfirmPasswordError = !doPasswordsMatch && confirmPassword.length > 0;

    // OTP Handlers
    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
        if (pastedData.every((char) => !isNaN(Number(char)))) {
            const newOtp = [...otp];
            pastedData.forEach((val, i) => {
                if (i < 6) newOtp[i] = val;
            });
            setOtp(newOtp);
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    // Step 1: Send OTP to email
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to send OTP. Please try again.');
            }

            setStep('otp');
            setOtp(new Array(6).fill(""));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/auth/verify-reset-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpString }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'OTP verification failed. Please try again.');
            }

            setSuccessMessage('OTP verified! Please set your new password.');
            setStep('newPassword');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during OTP verification';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid) {
            setError('Please ensure your password meets all requirements.');
            return;
        }

        if (!doPasswordsMatch) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp: otp.join(""),
                    new_password: newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to reset password. Please try again.');
            }

            setSuccessMessage('Password reset successfully!');
            setStep('success');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                onBackToLogin();
            }, 2000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while resetting password';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to resend OTP. Please try again.');
            }

            setSuccessMessage('A new OTP has been sent to your email.');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while resending OTP';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <LoginStyles />

            {/* Left Side: Branding & Info */}
            <div className="left-panel">
                <div className="animated-gradient-background" />
                <div className="left-panel-glass">
                    <div className="left-panel-content">
                        <div className="logo-container">
                            <div className="h-16 w-16 rounded-lg flex items-center justify-center">
                                <img src={starIcon} alt="Star Icon" className="h-16 w-16 text-white theme-star-icon" />
                            </div>
                            <p className="text-black font-bold" style={{ fontWeight: '500', fontSize: '45px', letterSpacing: '1px', color: 'var(--foreground)', fontFamily: 'Lato' }}>Spark<span className="text-black font-bold" style={{ fontWeight: '500', fontSize: '45px', color: '#ff1df0db', letterSpacing: '1px', marginLeft: '5px', fontFamily: 'Lato' }}>A</span><span className="text-black font-bold" style={{ fontWeight: '500', fontSize: '45px', color: '#007fd4ff', letterSpacing: '1px', fontFamily: 'Lato' }}>I</span></p>
                        </div>
                        <h2 className="subtitle">Discover. Learn. Achieve.</h2>
                        <p className="description">
                            Access intelligent learning tools to understand deeply, practice effectively, and master every topic.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Forgot Password Form */}
            <div className="right-panel">
                <div className="login-container">
                    {/* Theme Toggle */}
                    <div className="theme-toggle-container">
                        <ThemeToggle />
                    </div>



                    <h3 className="login-header">
                        {step === 'email' && 'Reset Password'}
                        {step === 'otp' && 'Verify OTP'}
                        {step === 'newPassword' && 'Set New Password'}
                        {step === 'success' && 'Success!'}
                    </h3>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="success-message">
                            {successMessage}
                        </div>
                    )}

                    {/* Step 1: Email Input */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOTP}>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email Address
                                </label>
                                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                                    Enter your email address and we'll send you a verification code to reset your password.
                                </p>
                                <div className="input-container">
                                    <span className="input-icon">
                                        <Mail className="icon" />
                                    </span>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        className="form-input"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isLoading}
                                style={{ marginTop: '1rem' }}
                            >
                                {isLoading ? 'Sending...' : 'Send Verification Code'}
                            </button>

                            <p className="signup-link">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onBackToLogin();
                                    }}
                                    style={{ color: 'var(--primary)' }}
                                >
                                    Back to Login
                                </a>
                            </p>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="form-group">
                                <label className="form-label" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    Enter Verification Code
                                </label>
                                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem', textAlign: 'center' }}>
                                    We've sent a 6-digit code to {email}
                                </p>

                                <div className="otp-container">
                                    {otp.map((data, index) => {
                                        return (
                                            <input
                                                className="form-input otp-input"
                                                type="text"
                                                name="otp"
                                                maxLength={1}
                                                key={index}
                                                value={data}
                                                autoFocus={index === 0}
                                                ref={el => { inputRefs.current[index] = el; }}
                                                onChange={e => handleOtpChange(e.target, index)}
                                                onKeyDown={e => handleOtpKeyDown(e, index)}
                                                onPaste={handleOtpPaste}
                                                disabled={isLoading}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <button type="submit" className="submit-button" disabled={isLoading} style={{ marginTop: '1rem' }}>
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <div className="signup-link" style={{ marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    style={{
                                        color: 'var(--primary)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        font: 'inherit',
                                        marginRight: '1rem'
                                    }}
                                    disabled={isLoading}
                                >
                                    Resend Code
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    style={{
                                        color: 'var(--primary)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        font: 'inherit'
                                    }}
                                    disabled={isLoading}
                                >
                                    Edit Email
                                </button>
                            </div>

                            <p className="signup-link">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onBackToLogin();
                                    }}
                                    style={{ color: 'var(--primary)' }}
                                >
                                    Back to Login
                                </a>
                            </p>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'newPassword' && (
                        <form onSubmit={handleResetPassword}>
                            {/* New Password Field */}
                            <div className="form-group-spaced">
                                <label htmlFor="new-password" className="form-label">
                                    New Password
                                </label>
                                <div className="input-container">
                                    <span className="input-icon"><Lock className="icon" /></span>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        id="new-password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className={`form-input with-toggle ${showPasswordError ? 'with-info-and-toggle' : ''}`}
                                        disabled={isLoading}
                                    />

                                    {showPasswordError && (
                                        <div className="input-info-icon has-toggle error-indicator">
                                            <AlertCircle className="icon" size={18} />
                                            <div className="tooltip-content">
                                                <ul style={{ paddingLeft: '15px', margin: 0 }}>
                                                    <li>• at least 8 characters</li>
                                                    <li>• no spaces</li>
                                                    <li>• must include:</li>
                                                    <ul style={{ paddingLeft: '15px', marginTop: '4px' }}>
                                                        <li>* one uppercase letter (A-Z)</li>
                                                        <li>* one lowercase letter (a-z)</li>
                                                        <li>* one number (0-9)</li>
                                                        <li>* one special symbol (@, #,!, etc.)</li>
                                                    </ul>
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="password-toggle"
                                    >
                                        {showNewPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="form-group-spaced">
                                <label htmlFor="confirm-password" className="form-label">
                                    Confirm New Password
                                </label>
                                <div className="input-container">
                                    <span className="input-icon"><Lock className="icon" /></span>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirm-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className={`form-input with-toggle ${showConfirmPasswordError ? 'with-info-and-toggle' : ''}`}
                                        disabled={isLoading}
                                    />

                                    {showConfirmPasswordError && (
                                        <div className="input-info-icon has-toggle error-indicator">
                                            <AlertCircle className="icon" size={18} />
                                            <div className="tooltip-content">
                                                <p style={{ margin: 0 }}>• not matching</p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="password-toggle"
                                    >
                                        {showConfirmPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                                style={{ marginTop: '1rem' }}
                            >
                                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                            </button>

                            <p className="signup-link">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onBackToLogin();
                                    }}
                                    style={{ color: 'var(--primary)' }}
                                >
                                    Back to Login
                                </a>
                            </p>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div style={{
                                fontSize: '3rem',
                                marginBottom: '1rem',
                                color: 'var(--primary)'
                            }}>
                                ✓
                            </div>
                            <p style={{ fontSize: '1.125rem', color: 'var(--foreground)' }}>
                                Your password has been reset successfully!
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                                Redirecting to login...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
