
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [view, setView] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const { login, signup, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Nueva lógica: determinar si mostrar mensaje de confirmación tras registro exitoso
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setShowConfirmation(true);
      // Limpiar el query param después de mostrar el mensaje
      setSearchParams((params) => {
        params.delete("registered");
        return params;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    if (view === "login") {
      const { error } = await login(email, password);
      if (error) setError(error);
    } else {
      if (!username) {
        setError("El nombre de usuario es obligatorio");
        setPending(false);
        return;
      }
      const { error } = await signup(email, password, username);
      setPending(false);
      if (!error) {
        // Redirigir a la página de login con la bandera de éxito
        navigate("/auth?registered=1", { replace: true });
        return;
      }
      if (error) setError(error);
    }
    setPending(false);
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 items-center justify-center">
      <form
        className="bg-white px-8 py-10 rounded-xl shadow-lg w-full max-w-md space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          {view === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h2>

        {showConfirmation && (
          <div className="bg-green-100 text-green-800 py-2 px-4 rounded mb-4 text-sm text-center font-semibold">
            ¡Registro exitoso! Por favor, confirma tu email para poder iniciar sesión.
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 py-2 px-4 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={pending || loading}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            autoComplete={view === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={pending || loading}
          />
          {view === "signup" && (
            <Input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={pending || loading}
            />
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending || loading}>
          {view === "login" ? "Entrar" : "Registrarse"}
        </Button>
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setView(view === "login" ? "signup" : "login");
            }}
            className="underline text-blue-700 hover:text-blue-900 text-sm disabled:opacity-60"
            disabled={pending || loading}
          >
            {view === "login"
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </form>
    </div>
  );
}

