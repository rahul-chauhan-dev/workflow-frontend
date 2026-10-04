import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import { usePageTitle } from "../hooks/usePageTitle";

function validate({ name, email, password, confirm }) {
  const errors = {};
  if (!name.trim()) errors.name = "Name is required";
  if (!email.trim()) errors.email = "Email is required";
  else if (!email.includes("@")) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 8 || password.length > 72)
    errors.password = "Password must be 8 to 72 characters";
  if (confirm !== password) errors.confirm = "Passwords do not match";
  return errors;
}

function RegisterPage() {
  usePageTitle("Register");
  const { user, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const clientErrors = validate({ name, email, password, confirm });
    setErrors(clientErrors);
    setFormError(null);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
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
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form" noValidate>
        <TextField
          id="register-name"
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={submitting}
        />
        <TextField
          id="register-email"
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
          id="register-password"
          label="Password"
          autoComplete="new-password"
          placeholder="8 to 72 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={submitting}
        />
        <PasswordField
          id="register-confirm"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          disabled={submitting}
        />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;