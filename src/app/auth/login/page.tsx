"use client";

import { createClient } from "@/lib/supabase/client";
import { Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized:
    "Tu correo no tiene acceso a esta plataforma. Contacta al administrador.",
  exchange_failed: "Error al iniciar sesion. Intenta de nuevo.",
  no_code: "Error en el proceso de autenticacion. Intenta de nuevo.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : null;

  async function handleGoogleLogin() {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: "digitalpixel.studio",
        },
      },
    });

    if (error) {
      setLoading(false);
    }
  }

  return (
    <>
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm text-center">{errorMessage}</p>
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {loading ? "Conectando..." : "Iniciar sesion con Google"}
      </button>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              PIXEL OPS
            </span>
          </div>
          <p className="text-zinc-500 text-sm">Plataforma de operaciones</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
          <h1 className="text-lg font-semibold text-white mb-1 text-center">
            Bienvenido
          </h1>
          <p className="text-zinc-400 text-sm mb-6 text-center">
            Inicia sesion con tu cuenta corporativa
          </p>

          <Suspense fallback={
            <button disabled className="w-full flex items-center justify-center gap-3 bg-white/50 text-zinc-400 font-medium py-2.5 px-4 rounded-lg">
              Cargando...
            </button>
          }>
            <LoginForm />
          </Suspense>

          <p className="text-zinc-600 text-xs text-center mt-4">
            Solo cuentas @digitalpixel.studio y @pixelplay.mx
          </p>
        </div>

        <p className="text-zinc-700 text-xs text-center mt-6">
          &copy; {new Date().getFullYear()} Digital Pixel Studio
        </p>
      </div>
    </div>
  );
}
