import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import "./Login.css";
import { LANGUAGES, useI18n } from "./i18n";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const { t, lang, setLang } = useI18n();
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
      const message = err instanceof Error ? err.message : t("registerFailed");
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
      const message = err instanceof Error ? err.message : t("loginFailed");
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
        <div className="auth-lang">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`auth-lang-btn ${lang === l.code ? "is-active" : ""}`}
              onClick={() => setLang(l.code)}
            >
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="auth-kicker">{t("loginKicker")}</p>
        <h2 className="auth-title">
          {isRegisterMode ? t("loginCreateTitle") : t("loginWelcomeTitle")}
        </h2>
        <p className="auth-subtitle">
          {isRegisterMode
            ? t("loginCreateSubtitle")
            : t("loginWelcomeSubtitle")}
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
            {t("loginTab")}
          </button>
          <button
            type="button"
            className={`auth-switch-btn ${isRegisterMode ? "is-active" : ""}`}
            onClick={() => {
              setIsRegisterMode(true);
              setError("");
            }}
          >
            {t("registerTab")}
          </button>
        </div>

        <div className="auth-form">
          <label className="auth-label" htmlFor="email">
            {t("email")}
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
            {t("password")}
          </label>
          <input
            id="password"
            className="auth-input"
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="button" className="auth-submit" onClick={submit} disabled={isLoading}>
            {isLoading ? t("pleaseWait") : isRegisterMode ? t("register") : t("signIn")}
          </button>
        </div>
      </div>
    </div>
  );
}
