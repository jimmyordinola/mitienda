'use client';

import { useState } from 'react';

export default function Login({ onLogin, onRegistrar, onCerrarSesion, cliente }) {
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

  if (cliente) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl max-w-sm w-full">
      {/* Logo */}
      <div className="text-center mb-4">
        <img src="/images/logo.png" alt="El Chalán" className="h-14 mx-auto mb-1" />
        <p className="text-[#3d2314] font-medium text-sm">Sistema de Puntos</p>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => { setModo('login'); setError(''); }}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-sm transition-all ${
            modo === 'login'
              ? 'bg-[#c53030] text-white'
              : 'bg-gray-100 text-[#3d2314]'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => { setModo('registro'); setError(''); }}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-sm transition-all ${
            modo === 'registro'
              ? 'bg-[#c53030] text-white'
              : 'bg-gray-100 text-[#3d2314]'
          }`}
        >
          Registrarse
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded-lg text-xs mb-3">
          {error}
        </div>
      )}

      {modo === 'login' ? (
        <form onSubmit={handleLogin}>
          <div className="mb-2">
            <label className="block text-xs text-[#3d2314] font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Tu número de teléfono"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#4a9b8c] focus:outline-none"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-[#3d2314] font-medium mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Tu PIN de 4 dígitos"
              maxLength={4}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#4a9b8c] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 bg-[#c53030] text-white rounded-lg font-bold text-sm hover:bg-[#9b2c2c] transition-all disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegistro}>
          <div className="mb-2">
            <label className="block text-xs text-[#3d2314] font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#4a9b8c] focus:outline-none"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs text-[#3d2314] font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Tu número de teléfono"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#4a9b8c] focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Tu PIN inicial será: <strong className="text-[#c53030]">1234</strong>
          </p>
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 bg-[#4a9b8c] text-white rounded-lg font-bold text-sm hover:bg-[#3d8577] transition-all disabled:opacity-50"
          >
            {cargando ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-gray-400 mt-3">
        Acumula puntos con cada compra
      </p>
    </div>
  );
}
