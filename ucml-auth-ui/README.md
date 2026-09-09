# UCML auth UI (mockup)

Login and register screens for UCML, built with React + Vite. No backend
calls are wired up yet — this is the UI pass only, as requested. Both forms
currently validate locally and `console.log` their values on submit.

## Run it

```
npm install
npm run dev
```

Visit `http://localhost:5173` — it redirects to `/login`. `/register` is the
other screen.

## Structure

```
src/
  pages/Login.jsx        Login screen
  pages/Register.jsx     Register screen
  components/AuthLayout.jsx   Shared split-panel layout (brand side + form side)
  components/Field.jsx   Reusable labeled input
  api/auth.js            Placeholder client — this is where the Django
                          REST calls (POST /api/auth/login/,
                          POST /api/auth/register/) will go
  styles/auth.css        All styling
```

## Wiring up Django REST later

`vite.config.js` already proxies `/api/*` to `http://127.0.0.1:8000`, so once
the Django server is running locally, calls to `/api/auth/login/` etc. from
the React app will reach it without CORS trouble in dev.

When you're ready, fill in the two functions in `src/api/auth.js` and call
them from the `handleSubmit` functions in `Login.jsx` / `Register.jsx`
instead of the current `console.log` placeholders.
