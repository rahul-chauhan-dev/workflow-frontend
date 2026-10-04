import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import { usePageTitle } from "../hooks/usePageTitle";

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required";
  if (!password) errors.password = "Password is required";
  return errors;
}

function LoginPage() {
  usePageTitle("Login");
  const { user, login } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const clientErrors = validate({ email, password });
    setErrors(clientErrors);
    setFormError(null);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      const fieldErrors = err.fieldErrors ?? {};
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) {
        setFormError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to your projects."
      footer={
        <>
          New to TaskFlow? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form" noValidate>
        <TextField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={submitting}
        />
        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={submitting}
        />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
