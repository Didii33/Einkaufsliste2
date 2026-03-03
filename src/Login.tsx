import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import "./Login.css";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    try {
      setIsLoading(true);
      setError("");
      await createUserWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registrierung fehlgeschlagen.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login fehlgeschlagen.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const submit = () => {
    if (!email.trim() || !password.trim() || isLoading) return;
    if (isRegisterMode) {
      register();
      return;
    }
    login();
  };

  return (
    <div className="auth-shell">
      <div className="auth-bg-shape auth-bg-shape--left" />
      <div className="auth-bg-shape auth-bg-shape--right" />

      <div className="auth-card">
        <p className="auth-kicker">Einkaufsliste</p>
        <h2 className="auth-title">
          {isRegisterMode ? "Account erstellen" : "Willkommen zurueck"}
        </h2>
        <p className="auth-subtitle">
          {isRegisterMode
            ? "Erstelle dein Konto und starte direkt."
            : "Melde dich an, um deine Listen weiterzufuehren."}
        </p>

        <div className="auth-switch" role="tablist" aria-label="Auth Modus">
          <button
            type="button"
            className={`auth-switch-btn ${!isRegisterMode ? "is-active" : ""}`}
            onClick={() => {
              setIsRegisterMode(false);
              setError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-switch-btn ${isRegisterMode ? "is-active" : ""}`}
            onClick={() => {
              setIsRegisterMode(true);
              setError("");
            }}
          >
            Registrierung
          </button>
        </div>

        <div className="auth-form">
          <label className="auth-label" htmlFor="email">
            E-Mail
          </label>
          <input
            id="email"
            className="auth-input"
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="auth-label" htmlFor="password">
            Passwort
          </label>
          <input
            id="password"
            className="auth-input"
            type="password"
            placeholder="Mindestens 6 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="button" className="auth-submit" onClick={submit} disabled={isLoading}>
            {isLoading ? "Bitte warten..." : isRegisterMode ? "Registrieren" : "Einloggen"}
          </button>
        </div>
      </div>
    </div>
  );
}
