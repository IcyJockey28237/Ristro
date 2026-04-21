import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authBg from "../assets/auth-bg.png";
import axios from "axios";
import { API_URL } from "../config";

// ─── Icon Components ───────────────────────────────────────────
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
);

// ─── Input Field Component ─────────────────────────────────────
function InputField({ icon, type = "text", placeholder, value, onChange, id }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ristro-text-muted">
        {icon}
      </span>
      <input
        id={id}
        type={isPassword && showPassword ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="ristro-input"
        autoComplete={isPassword ? "current-password" : "off"}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-ristro-text-muted hover:text-ristro-gold transition-colors cursor-pointer bg-transparent border-none"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
  );
}

// ─── Main Auth Page ────────────────────────────────────────────
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    clearMessages();
  };

  // ─── Handle Login ──────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      const { access_token, role } = res.data;
      login(access_token);

      // Role-based redirect
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/menu");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Handle Sign Up ───────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!signupName || !signupEmail || !signupPassword || !signupConfirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (signupPassword !== signupConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });

      setSuccess("Account created successfully! You can now log in.");
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirm("");

      // Auto-switch to login after short delay
      setTimeout(() => {
        setIsLogin(true);
        clearMessages();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Sign up failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Background Image + Overlay ── */}
      <div className="absolute inset-0 z-0">
        <img
          src={authBg}
          alt="Restaurant ambience"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,120,0.08)_0%,_transparent_70%)]" />
      </div>

      {/* ── Auth Card ── */}
      <div
        className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="glass-card p-8 sm:p-10 animate-pulse-glow">
          {/* ── Logo ── */}
          <div className="text-center mb-8">
            <h1
              className="text-5xl font-extrabold shimmer-text tracking-tight"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Ristro
            </h1>
            <p className="mt-2 text-ristro-text-muted text-sm tracking-widest uppercase">
              Restaurant & Café
            </p>
          </div>

          {/* ── Tab Toggle ── */}
          <div className="tab-toggle mb-8">
            <div className={`tab-slider ${!isLogin ? "signup" : ""}`} />
            <button
              id="tab-login"
              className={`tab-btn ${isLogin ? "active" : ""}`}
              onClick={() => switchTab(true)}
            >
              Log In
            </button>
            <button
              id="tab-signup"
              className={`tab-btn ${!isLogin ? "active" : ""}`}
              onClick={() => switchTab(false)}
            >
              Sign Up
            </button>
          </div>

          {/* ── Error / Success Messages ── */}
          {error && (
            <div className="toast-error mb-4 flex items-center gap-2">
              <span className="text-lg">⚠</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="toast-success mb-4 flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* ── Login Form ── */}
          {isLogin ? (
            <form
              onSubmit={handleLogin}
              className="space-y-4 animate-slide-left"
              key="login-form"
            >
              <InputField
                id="login-email"
                icon={<MailIcon />}
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <InputField
                id="login-password"
                icon={<LockIcon />}
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-ristro-text-muted text-xs hover:text-ristro-gold transition-colors bg-transparent border-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                id="btn-login"
                type="submit"
                className="btn-primary mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Signing in...
                  </span>
                ) : (
                  "Enter Ristro"
                )}
              </button>

              <p className="text-center text-ristro-text-muted text-sm mt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchTab(false)}
                  className="text-ristro-gold hover:text-ristro-gold-light transition-colors bg-transparent border-none cursor-pointer font-medium"
                >
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            /* ── Signup Form ── */
            <form
              onSubmit={handleSignup}
              className="space-y-4 animate-slide-right"
              key="signup-form"
            >
              <InputField
                id="signup-name"
                icon={<UserIcon />}
                type="text"
                placeholder="Full name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
              />
              <InputField
                id="signup-email"
                icon={<MailIcon />}
                type="email"
                placeholder="Email address"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
              <InputField
                id="signup-password"
                icon={<LockIcon />}
                type="password"
                placeholder="Password (min 6 chars)"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <InputField
                id="signup-confirm"
                icon={<LockIcon />}
                type="password"
                placeholder="Confirm password"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
              />

              <button
                id="btn-signup"
                type="submit"
                className="btn-primary mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="text-center text-ristro-text-muted text-sm mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchTab(true)}
                  className="text-ristro-gold hover:text-ristro-gold-light transition-colors bg-transparent border-none cursor-pointer font-medium"
                >
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-ristro-text-muted/50 text-xs mt-6 tracking-wide">
          © 2026 Ristro.
        </p>
      </div>
    </div>
  );
}
