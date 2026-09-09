import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Field from "../components/Field.jsx";
import { register } from "../api/auth.js";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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
    if (!form.name) next.name = "Enter your name.";
    if (!form.email) next.email = "Enter your email.";
    if (!form.password) next.password = "Choose a password.";
    else if (form.password.length < 8)
      next.password = "Use at least 8 characters.";
    if (form.confirmPassword !== form.password)
      next.confirmPassword = "Passwords don't match.";
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
    await register(form);
    // Registration succeeded -- send them to log in with the account
    // they just created (we deliberately don't auto-login here).
    navigate("/login?registered=1");
  } catch (err) {
    setServerError(err.message);
  } finally {
    setSubmitting(false);
  }
}

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Start your first run."
      subtitle="Set up access in under a minute."
    >
      <div className="auth-card-head">
        <h2 className="auth-card-title">Create your UCML account</h2>
        <p className="auth-card-subtitle">
          Already have one?{" "}
          <Link className="auth-link" to="/login">
            Sign in
          </Link>
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {serverError ? <p className="auth-server-error">{serverError}</p> : null}
        <Field
          label="Full name"
          name="name"
          value={form.name}
          onChange={update}
          placeholder="Ada Lovelace"
          autoComplete="name"
          error={errors.name}
        />
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password}
        />
        <Field
          label="Confirm password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={update}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />

        <label className="checkbox checkbox-terms">
          <input type="checkbox" name="terms" required />
          <span>
            I agree to the terms of service and privacy policy.
          </span>
        </label>

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
