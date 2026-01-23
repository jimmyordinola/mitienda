'use client';

import { useState } from 'react';
import { signInWithGoogle, signInWithFacebook } from '@/lib/supabase-browser';

export default function Login({ onLogin, onRegistrar, onCerrarSesion, cliente }) {
  const [socialLoading, setSocialLoading] = useState(null);
  const [modo, setModo] = useState('login');
  const [telefono, setTelefono] = useState('');
  const [pin, setPin] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!telefono || !pin) {
      setError('Completa todos los campos');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono, pin })
      });

      if (res.ok) {
        const clienteData = await res.json();
        onLogin(clienteData);
        setTelefono('');
        setPin('');
      } else {
        const data = await res.json();
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (e) {
      setError('Error de conexión');
    }
    setCargando(false);
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    if (!telefono || !nombre) {
      setError('Completa todos los campos');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono, nombre })
      });

      if (res.ok) {
        const clienteData = await res.json();
        onRegistrar(clienteData);
        setModo('login');
        setNombre('');
        setError('');
        alert('¡Registro exitoso! Tu PIN es: 1234');
      } else {
        const data = await res.json();
        setError(data.error || 'Error al registrar');
      }
    } catch (e) {
      setError('Error de conexión');
    }
    setCargando(false);
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError('Error al iniciar sesión con Google');
      setSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setSocialLoading('facebook');
    setError('');
    const { error } = await signInWithFacebook();
    if (error) {
      setError('Error al iniciar sesión con Facebook');
      setSocialLoading(null);
    }
  };

  if (cliente) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md">
      {/* Logo */}
      <div className="text-center mb-6">
        <img src="/images/logo.png" alt="El Chalán" className="h-20 mx-auto mb-2" />
        <p className="text-[#3d2314] font-medium">Sistema de Puntos</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setModo('login'); setError(''); }}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            modo === 'login'
              ? 'bg-[#c53030] text-white'
              : 'bg-gray-100 text-[#3d2314]'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => { setModo('registro'); setError(''); }}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            modo === 'registro'
              ? 'bg-[#c53030] text-white'
              : 'bg-gray-100 text-[#3d2314]'
          }`}
        >
          Registrarse
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {modo === 'login' ? (
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="block text-sm text-[#3d2314] font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Tu número de teléfono"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4a9b8c] focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-[#3d2314] font-medium mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Tu PIN de 4 dígitos"
              maxLength={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4a9b8c] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-[#c53030] text-white rounded-xl font-bold hover:bg-[#9b2c2c] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o continuar con</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={socialLoading !== null}
              className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {socialLoading === 'google' ? 'Conectando...' : 'Google'}
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={socialLoading !== null}
              className="w-full py-3 px-4 bg-[#1877F2] text-white rounded-xl font-semibold hover:bg-[#166FE5] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {socialLoading === 'facebook' ? 'Conectando...' : 'Facebook'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegistro}>
          <div className="mb-3">
            <label className="block text-sm text-[#3d2314] font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4a9b8c] focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-[#3d2314] font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Tu número de teléfono"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4a9b8c] focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Tu PIN inicial será: <strong className="text-[#c53030]">1234</strong>
          </p>
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-[#4a9b8c] text-white rounded-xl font-bold hover:bg-[#3d8577] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {cargando ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-gray-400 mt-4">
        Acumula puntos con cada compra
      </p>
    </div>
  );
}
