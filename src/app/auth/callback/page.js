'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function AuthCallback() {
  const router = useRouter();
  const [mensaje, setMensaje] = useState('Completando inicio de sesión...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener los parámetros de la URL (hash fragment para implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          // Establecer la sesión manualmente con los tokens del hash
          const { error } = await supabaseBrowser.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('Error setting session:', error);
            setMensaje('Error al iniciar sesión');
            setTimeout(() => router.push('/?error=' + encodeURIComponent(error.message)), 2000);
            return;
          }

          setMensaje('¡Bienvenido!');
          setTimeout(() => router.push('/'), 1000);
        } else {
          // Si no hay tokens, verificar si ya hay sesión
          const { data: { session } } = await supabaseBrowser.auth.getSession();
          if (session) {
            router.push('/');
          } else {
            // No hay sesión, redirigir al inicio
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/?error=callback_error');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-6xl animate-bounce mb-4">🍦</div>
        <p className="text-[#3d2314] font-medium text-lg">{mensaje}</p>
      </div>
    </div>
  );
}
