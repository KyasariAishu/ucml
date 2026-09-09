import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Field from "../components/Field.jsx";
import { login } from "../api/auth.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.email) next.email = "Enter your email.";
    if (!form.password) next.password = "Enter your password.";
    return next;
  }

  async function handleSubmit(e) {
  e.preventDefault();
  const next = validate();
  setErrors(next);
  setServerError("");
  if (Object.keys(next).length) return;

  setSubmitting(true);
  try {
    await login(form); // stores the access/refresh tokens on success
    navigate("/dashboard");
  } catch (err) {
    setServerError(err.message);
  } finally {
    setSubmitting(false);
  }
}
  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back."
      subtitle="Pick up where your last run left off."
    >
      <div className="auth-card-head">
        <h2 className="auth-card-title">Sign in to UCML</h2>
        <p className="auth-card-subtitle">
          New here?{" "}
          <Link className="auth-link" to="/register">
            Create an account
          </Link>
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError ? <p className="auth-server-error">{serverError}</p> : null}
        <Field
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={update}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={update}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
        />

        <div className="auth-form-row">
          <label className="checkbox">
            <input type="checkbox" name="remember" />
            <span>Remember me</span>
          </label>
          <a className="auth-link auth-link-muted" href="#forgot-password">
            Forgot password?
          </a>
        </div>

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
