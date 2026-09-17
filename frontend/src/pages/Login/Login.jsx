import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import { register as registerUser } from '../../services/authService';

export default function Login() {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('login');
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const savedEmail = localStorage.getItem('vectra_email') || '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: savedEmail, password: '', remember: Boolean(savedEmail) },
  });
  const {
    register: registerAccount, handleSubmit: handleRegisterSubmit, reset: resetRegistration, watch,
    formState: { errors: registrationErrors, isSubmitting: isRegistering },
  } = useForm({
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'OPERATOR' },
  });
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  const submit = async (values) => {
    try {
      setServerError('');
      await signIn({ email: values.email, password: values.password }, values.remember);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) { setServerError(errorMessage(error)); }
  };
  const submitRegistration = async ({ confirmPassword, ...values }) => {
    try {
      setServerError('');
      await registerUser(values);
      resetRegistration();
      setSuccess('Account created successfully. You can now sign in.');
      setMode('login');
    } catch (error) { setServerError(errorMessage(error)); }
  };
  const switchMode = (nextMode) => {
    setMode(nextMode);
    setServerError('');
    setSuccess('');
  };
  return <div className="login-page">
    <section className="login-visual">
      <div className="visual-grid" />
      <div className="radar-wrap" aria-hidden="true">
        <div className="radar-ring" /><div className="radar-ring" /><div className="radar-ring" /><div className="radar-ring" />
        <div className="radar-sweep" />
        <div className="radar-center" />
        <div className="drone-blip" /><div className="drone-blip" /><div className="drone-blip" /><div className="drone-blip" />
      </div>
      <div className="login-brand"><span className="brand-mark"><i className="bi bi-airplane-engines-fill" /></span><strong>VECTRA</strong></div>
      <div className="visual-copy"><span className="live-pill"><i /> LIVE FLEET TRACKING</span>
        <h1>Every airlift.<br />Every drone.<br /><em>One command center.</em></h1>
        <p>Next-generation aerial fleet intelligence — real-time mission control, autonomous routing, and full operational accountability.</p>
        <div className="visual-metrics">
          <div><strong>24/7</strong><span>Fleet telemetry</span></div>
          <div><strong>100%</strong><span>Mission traceability</span></div>
          <div><strong>AI</strong><span>Smart assignment</span></div>
        </div>
      </div>
      <small className="visual-footer">Secure enterprise access · AES-256 encrypted · RBAC</small>
    </section>
    <section className="login-form-side"><div className="login-card">
      <div className="mobile-brand"><span className="brand-mark"><i className="bi bi-airplane-engines-fill" /></span><strong>VECTRA</strong></div>
      <div className="auth-tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Sign in</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Create account</button>
      </div>
      <span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN VECTRA'}</span>
      <h2>{mode === 'login' ? 'Sign in to command' : 'Create your account'}</h2>
      <p>{mode === 'login' ? 'Enter your credentials to access the operations console.' : 'Register your identity and operational role.'}</p>
      {location.search.includes('expired') && <div className="login-alert"><i className="bi bi-clock-history" /> Your session expired. Please sign in again.</div>}
      {serverError && <div className="login-alert"><i className="bi bi-exclamation-circle" /> {serverError}</div>}
      {success && <div className="login-success"><i className="bi bi-check-circle" /> {success}</div>}
      {mode === 'login' ? <form onSubmit={handleSubmit(submit)}>
        <label>Email address</label><div className={`input-wrap ${errors.email ? 'invalid' : ''}`}><i className="bi bi-envelope" />
          <input type="email" placeholder="name@company.com" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} /></div>
        {errors.email && <small className="field-error">{errors.email.message}</small>}
        <label>Password</label><div className={`input-wrap ${errors.password ? 'invalid' : ''}`}><i className="bi bi-lock" />
          <input type={show ? 'text' : 'password'} placeholder="Enter your password" {...register('password', { required: 'Password is required' })} />
          <button type="button" onClick={() => setShow(!show)}><i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} /></button></div>
        {errors.password && <small className="field-error">{errors.password.message}</small>}
        <div className="remember-row"><label><input type="checkbox" {...register('remember')} /> Remember me</label><span>Secure access</span></div>
        <button className="login-submit" disabled={isSubmitting}>{isSubmitting ? <><span className="spinner-border spinner-border-sm" /> Signing in</> : <>Sign in <i className="bi bi-arrow-right" /></>}</button>
      </form> : <form onSubmit={handleRegisterSubmit(submitRegistration)}>
        <div className="register-grid">
          <div><label>Full name</label><div className={`input-wrap ${registrationErrors.fullName ? 'invalid' : ''}`}><i className="bi bi-person" /><input placeholder="Your full name" {...registerAccount('fullName', { required: 'Full name is required' })} /></div>{registrationErrors.fullName && <small className="field-error">{registrationErrors.fullName.message}</small>}</div>
          <div><label>Phone number</label><div className={`input-wrap ${registrationErrors.phone ? 'invalid' : ''}`}><i className="bi bi-telephone" /><input placeholder="+919876543210" {...registerAccount('phone', { required: 'Phone is required', pattern: { value: /^\+?[0-9]{7,15}$/, message: 'Enter 7–15 digits' } })} /></div>{registrationErrors.phone && <small className="field-error">{registrationErrors.phone.message}</small>}</div>
        </div>
        <label>Email address</label><div className={`input-wrap ${registrationErrors.email ? 'invalid' : ''}`}><i className="bi bi-envelope" /><input type="email" placeholder="name@company.com" {...registerAccount('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} /></div>
        {registrationErrors.email && <small className="field-error">{registrationErrors.email.message}</small>}
        <label>Operational role</label><div className="input-wrap"><i className="bi bi-shield-check" /><select {...registerAccount('role', { required: true })}><option value="OPERATOR">Operator</option><option value="WAREHOUSE_MANAGER">Warehouse Manager</option><option value="MAINTENANCE_ENGINEER">Maintenance Engineer</option><option value="ADMIN">Administrator</option></select></div>
        <div className="register-grid">
          <div><label>Password</label><div className={`input-wrap ${registrationErrors.password ? 'invalid' : ''}`}><i className="bi bi-lock" /><input type={show ? 'text' : 'password'} placeholder="Minimum 8 characters" {...registerAccount('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} /></div>{registrationErrors.password && <small className="field-error">{registrationErrors.password.message}</small>}</div>
          <div><label>Confirm password</label><div className={`input-wrap ${registrationErrors.confirmPassword ? 'invalid' : ''}`}><i className="bi bi-lock-fill" /><input type={show ? 'text' : 'password'} placeholder="Repeat password" {...registerAccount('confirmPassword', { required: 'Confirm your password', validate: (value) => value === watch('password') || 'Passwords do not match' })} /></div>{registrationErrors.confirmPassword && <small className="field-error">{registrationErrors.confirmPassword.message}</small>}</div>
        </div>
        <label className="show-password"><input type="checkbox" checked={show} onChange={() => setShow(!show)} /> Show passwords</label>
        <button className="login-submit" disabled={isRegistering}>{isRegistering ? <><span className="spinner-border spinner-border-sm" /> Creating account</> : <>Create account <i className="bi bi-arrow-right" /></>}</button>
      </form>}
      <div className="login-help"><i className="bi bi-shield-check" /><span>Protected by role-based access control</span></div>
    </div></section>
  </div>;
}
