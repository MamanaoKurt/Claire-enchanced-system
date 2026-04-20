import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { getCurrentUserApi, loginApi, registerApi } from "../lib/api";
import { resolveUserRole, ROLES } from "../lib/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getModeFromPath = () =>
    location.pathname === "/signup" ? "register" : "login";

  const [mode, setMode] = useState(getModeFromPath());
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(getModeFromPath());
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const switchMode = (nextMode) => {
    setError("");
    setMode(nextMode);
    navigate(nextMode === "login" ? "/login" : "/signup");
  };

  const getRedirectPathForUser = (userData) => {
    const role = resolveUserRole(userData);

    if (role === ROLES.ADMIN) {
      return "/admin";
    }

    if (role === ROLES.STAFF) {
      return "/staff-portal";
    }

    return "/profile";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please complete your email and password.");
      return;
    }

    if (mode === "register") {
      if (!form.name.trim()) {
        setError("Please add your name for registration.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      localStorage.removeItem("claire_user");

      if (mode === "login") {
        await loginApi({
          email: form.email,
          password: form.password,
        });
      } else {
        await registerApi({
          name: form.name.trim(),
          email: form.email,
          password: form.password,
          password_confirmation: form.confirmPassword,
        });
      }

      const userData = await getCurrentUserApi();

      if (!userData?.email) {
        throw new Error("Authentication failed. Please try again.");
      }

      localStorage.setItem("claire_user", JSON.stringify(userData));
      window.dispatchEvent(new Event("claire-user-updated"));

      navigate(getRedirectPathForUser(userData));
    } catch (err) {
      localStorage.removeItem("claire_user");
      window.dispatchEvent(new Event("claire-user-updated"));
      setError(err.message || "Unable to continue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="auth-eyebrow">Claire Beauty Salon</p>
        <h1>{mode === "login" ? "Welcome Back" : "Create an Account"}</h1>
        <p className="auth-subtext">
          {mode === "login"
            ? "Sign in to manage your appointments and profile."
            : "Join us to book services and receive exclusive promos."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => switchMode("register")}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Full Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </label>
          )}

          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </label>

          {mode === "register" && (
            <label>
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
            </label>
          )}

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
              ? "Log In"
              : "Create Account"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;