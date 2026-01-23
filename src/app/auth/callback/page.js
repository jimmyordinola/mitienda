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
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Si hay error en el hash, mostrarlo
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setMensaje('Error: ' + (errorDescription || errorParam));
          setTimeout(() => router.push('/?error=' + encodeURIComponent(errorDescription || errorParam)), 2000);
          return;
        }

        if (accessToken) {
          console.log('Token recibido, estableciendo sesión...');

          // Establecer la sesión manualmente con los tokens del hash
          const { data, error } = await supabaseBrowser.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('Error setting session:', error);
            setMensaje('Error al iniciar sesión');
            setTimeout(() => router.push('/?error=' + encodeURIComponent(error.message)), 2000);
            return;
          }

          console.log('Sesión establecida:', data.session?.user?.email);

          // Esperar un momento para que la sesión se persista
          setMensaje('¡Bienvenido!');

          // Usar window.location para asegurar una recarga completa
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          // Si no hay tokens en el hash, verificar si ya hay sesión
          const { data: { session } } = await supabaseBrowser.auth.getSession();
          console.log('Verificando sesión existente:', session?.user?.email);

          if (session) {
            window.location.href = '/';
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
