import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, Lock, Eye, EyeOff, Moon, Sun, User, AlertCircle,
  Phone, BookOpen, GitBranch, Library, Check
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import './login.css';
import starIcon from '../icon/star-2-svgrepo-com.svg';

// --- VALIDATION LOGIC ---
const validateUsername = (username: string) => {
  if (username.length < 3 || username.length > 20) return false;
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) return false;
  if (/^[_.]/.test(username) || /[_.]/.test(username.slice(-1))) return false;
  if (/[_.]{2}/.test(username)) return false;
  return true;
};

const validatePassword = (password: string) => {
  if (password.length < 8) return false;
  if (/\s/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[@#%&*!?$+\-=^._]/.test(password)) return false;
  return true;
};

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const COUNTRY_CODES = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "AU" },
  { code: "+81", country: "JP" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+86", country: "CN" },
  { code: "+7", country: "RU" },
  { code: "+971", country: "AE" },
];

// --- COMPONENTS ---

const ThemeToggle = () => {
  const [isDarkBlue, setIsDarkBlue] = useState(false);

  useEffect(() => {
    const hasLoginDark = document.documentElement.classList.contains('login-dark');
    setIsDarkBlue(hasLoginDark);
  }, []);

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
    <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
      {isDarkBlue ? <Sun className="theme-icon" size={20} /> : <Moon className="theme-icon" size={20} />}
    </button>
  );
};

const LoginStyles = () => null;

interface SignUpPageProps {
  onSignUpSuccess: () => void;
  onNavigateToLogin?: () => void;
}

export default function SignUpPage({ onSignUpSuccess, onNavigateToLogin }: SignUpPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Steps: form -> otp -> avatarSelection -> userDetails -> theme -> success
  const [step, setStep] = useState<'form' | 'otp' | 'avatarSelection' | 'userDetails' | 'theme'>('form');

  // Additional user details state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [course, setCourse] = useState('');
  const [branch, setBranch] = useState('');
  const [subject, setSubject] = useState('');

  // Theme Selection State
  const [themeColor, setThemeColor] = useState<string | null>('gradient');
  const [themeMode, setThemeMode] = useState<string | null>('light');

  // Avatar Selection State
  const [profileImage, setProfileImage] = useState<string>('');
  const [genderTab, setGenderTab] = useState<"male" | "female">("male");

  // --- OTP STATE & REFS ---
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- REAL-TIME VALIDATION STATE ---
  const isUsernameValid = validateUsername(username);
  const isPasswordValid = validatePassword(password);
  const isEmailValid = validateEmail(email);
  const doPasswordsMatch = password === confirmPassword;

  // --- VISIBILITY LOGIC ---
  const showUsernameError = !isUsernameValid && username.length > 0;
  const showPasswordError = !isPasswordValid && password.length > 0;
  const showEmailError = !isEmailValid && email.length > 0;
  const showConfirmPasswordError = !doPasswordsMatch && confirmPassword.length > 0;

  // --- OVERALL FORM VALIDITY ---
  const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && doPasswordsMatch;

  // --- OTP HANDLERS ---
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

  // --- THEME HANDLERS ---
  const toggleColor = (color: string) => {
    if (themeColor === color) {
      setThemeColor(null);
    } else {
      setThemeColor(color);
    }
  };

  const toggleMode = (mode: string) => {
    if (themeMode === mode) {
      setThemeMode(null);
    } else {
      setThemeMode(mode);
    }
  };

  // --- SUBMISSION HANDLERS ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Please fix the errors in the form before submitting.');
      return;
    }

    setIsLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Sign-up failed. Please try again.');
      }
      setInfoMessage('');
      setStep('otp');
      setOtp(new Array(6).fill(""));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign-up';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'OTP verification failed. Please try again.');
      }

      setStep('avatarSelection');
      setInfoMessage('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during OTP verification';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !course || !branch || !subject) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setStep('theme');
  };

  const handleAvatarNext = () => {
    if (!profileImage) {
      setError('Please select a profile picture');
      return;
    }
    setError('');
    setStep('userDetails');
  };

  const handleFinalizeRegistration = async () => {
    setIsLoading(true);
    setError('');

    try {
      // We send the request again. Backend now handles already-verified users.
      const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otp.join(""), // Passed but ignored by backend if user is verified
          name,
          phone_number: `${countryCode} ${phone.replace(/^\+/, '').trim()}`,
          course,
          branch,
          subject,
          theme_color: themeColor,
          theme_mode: themeMode,
          profile_image: profileImage
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to save user details. Please try again.');
      }

      // Auto-login to get token
      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        console.error("Auto-login failed:", loginData);
        // Fallback to manual login if auto-login fails
        setTimeout(() => onSignUpSuccess(), 2000);
        return;
      }

      // Store the JWT token
      localStorage.setItem('token', loginData.access_token);

      // Get user info
      const userResponse = await fetch('http://localhost:8000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
      }

      onSignUpSuccess();

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving your details';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend OTP. Please try again.');
      }
      setInfoMessage(data.message || 'A new OTP has been sent to your email.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while resending OTP';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDetails = () => {
    if (isLoading) return;
    setStep('form');
    setOtp(new Array(6).fill(""));
    setInfoMessage('');
  };



  return (
    <div className="page-container">
      <LoginStyles />

      <div className="right-panel">
        <div className="login-container">
          <div className="theme-toggle-container">
            <ThemeToggle />
          </div>

          {step === 'form' && (
            <div className="mobile-header">
              <h2 className="mobile-subtitle">Create Account</h2>
            </div>
          )}

          <h3 className="login-header">
            {step === 'otp' ? 'Email Verification' :
              step === 'avatarSelection' ? 'Choose Your Avatar' :
                step === 'userDetails' ? 'Set Up Your Profile' :
                  step === 'theme' ? 'You’re Almost There' :
                    'Sign Up'}
          </h3>

          {error && <div className="error-message">{error}</div>}

          {infoMessage && (
            <div className="success-message">
              {infoMessage}
            </div>
          )}

          {/* --- THEME SELECTION STEP --- */}
          {step === 'theme' && (
            <div className="theme-step-container">
              <h4 className="section-title">Customize Your Experience</h4>

              {/* Color Selection */}
              <div className="theme-section">
                <label className="form-label">Accent Color</label>
                <div className="theme-grid-3">
                  {/* Gradient */}
                  <div
                    className={`theme-box ${themeColor === 'gradient' ? 'selected' : ''}`}
                    style={{ background: 'linear-gradient(135deg, #a85cff, #2591d9)' }}
                    onClick={() => toggleColor('gradient')}
                  >
                    {themeColor === 'gradient' && <Check className="check-icon" />}
                  </div>

                  {/* Purple */}
                  <div
                    className={`theme-box ${themeColor === 'purple' ? 'selected' : ''}`}
                    style={{ background: '#a85cff' }}
                    onClick={() => toggleColor('purple')}
                  >
                    {themeColor === 'purple' && <Check className="check-icon" />}
                  </div>

                  {/* Blue */}
                  <div
                    className={`theme-box ${themeColor === 'blue' ? 'selected' : ''}`}
                    style={{ background: '#2591d9' }}
                    onClick={() => toggleColor('blue')}
                  >
                    {themeColor === 'blue' && <Check className="check-icon" />}
                  </div>


                </div>
              </div>

              {/* Mode Selection */}
              <div className="theme-section">
                <label className="form-label">System Mode</label>
                <div className="theme-grid-2">
                  {/* Light */}
                  <div
                    className={`mode-box light ${themeMode === 'light' ? 'selected' : ''}`}
                    onClick={() => toggleMode('light')}
                  >
                    <Sun size={24} className="mode-icon" />
                    <span>Light</span>
                    {themeMode === 'light' && <div className="mode-check"><Check size={14} /></div>}
                  </div>

                  {/* Dark */}
                  <div
                    className={`mode-box dark ${themeMode === 'dark' ? 'selected' : ''}`}
                    onClick={() => toggleMode('dark')}
                  >
                    <Moon size={24} className="mode-icon" />
                    <span>Dark</span>
                    {themeMode === 'dark' && <div className="mode-check"><Check size={14} /></div>}
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  onClick={handleFinalizeRegistration}
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Finalizing...' : 'Finish'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('userDetails')}
                  className="text-button"
                  disabled={isLoading}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* --- AVATAR SELECTION STEP --- */}
          {step === 'avatarSelection' && (
            <div className="avatar-step-container">
              <Tabs value={genderTab} className="w-full mb-6" onValueChange={(value: string) => setGenderTab(value as "male" | "female")}>
                <TabsList className="w-full flex h-14 auth-tabs-list p-1 rounded-full">
                  <TabsTrigger
                    value="male"
                    className="flex-1 auth-tab-trigger transition-all rounded-full"
                  >
                    Male
                  </TabsTrigger>
                  <TabsTrigger
                    value="female"
                    className="flex-1 auth-tab-trigger transition-all rounded-full"
                  >
                    Female
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="male">
                  <div
                    className="grid gap-4 mb-6 p-4 max-h-[300px] overflow-y-auto"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}
                  >
                    {[
                      "/Profiles/boy/Gemini_Generated_Image_fnz7fufnz7fufnz7_1.jpeg",
                      "/Profiles/boy/Gemini_Generated_Image_fnz7fufnz7fufnz7_2.jpeg",
                      "/Profiles/boy/Gemini_Generated_Image_fnz7fufnz7fufnz7_3.jpeg",
                      "/Profiles/boy/Gemini_Generated_Image_g0edojg0edojg0ed_1.jpg",
                      "/Profiles/boy/Gemini_Generated_Image_h0c81nh0c81nh0c8.png",
                      "/Profiles/boy/Gemini_Generated_Image_muo2upmuo2upmuo2_1.png",
                      "/Profiles/boy/Gemini_Generated_Image_muo2upmuo2upmuo2_2.png",
                      "/Profiles/boy/Gemini_Generated_Image_muo2upmuo2upmuo2_3.png",
                    ].map((avatarUrl, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center min-w-0"
                      >
                        <div
                          onClick={() => setProfileImage(avatarUrl)}
                          className={`w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 hover:shadow-lg relative ${profileImage === avatarUrl
                            ? "border-primary ring-4 ring-primary/30 scale-105 shadow-md"
                            : "border-transparent hover:border-primary/50"
                            }`}
                        >
                          <img src={avatarUrl} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                          {profileImage === avatarUrl && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
                              <Check className="h-6 w-6 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="female">
                  <div
                    className="grid gap-4 mb-6 p-4 max-h-[300px] overflow-y-auto"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}
                  >
                    {[
                      "/Profiles/girl/Gemini_Generated_Image_49091j49091j4909_1.png",
                      "/Profiles/girl/Gemini_Generated_Image_580h03580h03580h_1.png",
                      "/Profiles/girl/Gemini_Generated_Image_5kvvgq5kvvgq5kvv_2.png",
                      "/Profiles/girl/Gemini_Generated_Image_9ht7o49ht7o49ht7_1.png",
                      "/Profiles/girl/Gemini_Generated_Image_9ht7o49ht7o49ht7_2.png",
                      "/Profiles/girl/Gemini_Generated_Image_9ht7o49ht7o49ht7_3.png",
                      "/Profiles/girl/Gemini_Generated_Image_9ht7o49ht7o49ht7_4.jpeg",
                      "/Profiles/girl/Gemini_Generated_Image_kpr0k8kpr0k8kpr0_1.png",
                    ].map((avatarUrl, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center min-w-0"
                      >
                        <div
                          onClick={() => setProfileImage(avatarUrl)}
                          className={`w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 hover:shadow-lg relative ${profileImage === avatarUrl
                            ? "border-primary ring-4 ring-primary/30 scale-105 shadow-md"
                            : "border-transparent hover:border-primary/50"
                            }`}
                        >
                          <img src={avatarUrl} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                          {profileImage === avatarUrl && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
                              <Check className="h-6 w-6 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="button-group">
                <button
                  type="button"
                  onClick={handleAvatarNext}
                  className="submit-button"
                  disabled={isLoading}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* --- USER DETAILS STEP --- */}
          {step === 'userDetails' && (
            <form onSubmit={handleUserDetailsNext}>
              <div className="form-group-spaced">
                <label htmlFor="name" className="form-label">Full Name</label>
                <div className="input-container">
                  <span className="input-icon"><User className="icon" /></span>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=""
                    required
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group-spaced">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <div className="input-container">
                  <span className="input-icon"><Phone className="icon" /></span>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="absolute bg-transparent border-none text-muted-foreground font-medium focus:outline-none cursor-pointer"
                    style={{
                      left: '2.8rem',
                      width: '5.5rem',
                      height: '100%',
                      zIndex: 10,
                      outline: 'none',
                      boxShadow: 'none'
                    }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setPhone(val);
                    }}
                    placeholder="98765 43210"
                    required
                    className="form-input"
                    style={{ paddingLeft: '8.5rem' }}
                    disabled={isLoading}
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="form-group-spaced">
                <label htmlFor="course" className="form-label">Course</label>
                <div className="input-container">
                  <span className="input-icon"><BookOpen className="icon" /></span>
                  <input
                    type="text"
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder=""
                    required
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group-spaced">
                <label htmlFor="branch" className="form-label">Branch/Department</label>
                <div className="input-container">
                  <span className="input-icon"><GitBranch className="icon" /></span>
                  <input
                    type="text"
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder=""
                    required
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group-spaced">
                <label htmlFor="subject" className="form-label">Subject/Interest</label>
                <div className="input-container">
                  <span className="input-icon"><Library className="icon" /></span>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder=""
                    required
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="button-group">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  Next
                </button>


              </div>
            </form>
          )}

          {/* --- SIGN UP FORM STEP --- */}
          {step === 'form' && (
            <form onSubmit={handleSignUp}>
              {/* USERNAME FIELD */}
              <div className="form-group-spaced">
                <label htmlFor="username" className="form-label">Username</label>
                <div className="input-container">
                  <span className="input-icon"><User className="icon" /></span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    required
                    autoComplete="username"
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoFocus
                    className={`form-input ${showUsernameError ? 'with-info' : ''}`}
                    disabled={isLoading}
                  />
                  {showUsernameError && (
                    <div className="input-info-icon error-indicator">
                      <AlertCircle className="icon" size={18} />
                      <div className="tooltip-content">
                        <ul style={{ paddingLeft: '15px', margin: 0 }}>
                          <li>• 3–20 characters</li>
                          <li>• use only letters and numbers</li>
                          <li>• no spaces</li>
                          <li>• can add one dot (.) or underscore (_)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* EMAIL FIELD */}
              <div className="form-group-spaced">
                <label htmlFor="email" className="form-label">Email</label>
                <div className="input-container">
                  <span className="input-icon"><Mail className="icon" /></span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@mail.com"
                    required
                    className={`form-input ${showEmailError ? 'with-info' : ''}`}
                    disabled={isLoading}
                  />

                  {showEmailError && (
                    <div className="input-info-icon error-indicator">
                      <AlertCircle className="icon" size={18} />
                      <div className="tooltip-content">
                        <p style={{ margin: 0 }}>• valid email format</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div className="form-group-spaced">
                <div className="label-container">
                  <label htmlFor="password" className="form-label">Password</label>
                </div>
                <div className="input-container">
                  <span className="input-icon"><Lock className="icon" /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD FIELD */}
              <div className="form-group-spaced">
                <div className="label-container">
                  <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                </div>
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
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          )}

          {/* --- OTP STEP --- */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  Enter Verification Code
                </label>

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

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <div className="signup-link" style={{ marginTop: '12px' }}>
              <button type="button" onClick={handleResendOtp} style={{ color: 'var(--primary)', marginRight: '12px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }} disabled={isLoading}>
                Resend OTP
              </button>
              <button type="button" onClick={handleEditDetails} style={{ color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }} disabled={isLoading}>
                Edit details
              </button>
            </div>
          )}

          <p className="signup-link">
            Already have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); if (onNavigateToLogin) onNavigateToLogin(); }} style={{ color: 'var(--primary)' }}>
              Log in
            </a>
          </p>
        </div>
      </div>

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
            <p className="description">Access intelligent learning tools to understand deeply, practice effectively, and master every topic.</p>
          </div>
        </div>
      </div>
    </div>
  );
}