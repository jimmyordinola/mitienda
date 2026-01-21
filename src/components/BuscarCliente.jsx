'use client';

import { useState } from 'react';

export default function BuscarCliente({ onClienteEncontrado, onMensaje }) {
  const [telefono, setTelefono] = useState('');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    if (!telefono.trim()) {
      onMensaje('Ingresa un teléfono', 'error');
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(`/api/clientes/buscar/${telefono}`);
      if (res.ok) {
        const cliente = await res.json();
        onClienteEncontrado(cliente);
        setMostrarFormNuevo(false);
      } else {
        setMostrarFormNuevo(true);
        onMensaje('Cliente no encontrado. ¿Registrar nuevo?', 'error');
      }
    } catch (e) {
      onMensaje('Error de conexión', 'error');
    }
    setCargando(false);
  };

  const registrar = async () => {
    if (!nombreNuevo.trim()) {
      onMensaje('Ingresa el nombre', 'error');
      return;
    }

    setCargando(true);
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreNuevo, telefono })
      });

      if (res.ok) {
        const cliente = await res.json();
        onClienteEncontrado(cliente);
        setMostrarFormNuevo(false);
        setNombreNuevo('');
        onMensaje('¡Cliente registrado!', 'success');
      } else {
        const error = await res.json();
        onMensaje(error.error || 'Error al registrar', 'error');
      }
    } catch (e) {
      onMensaje('Error de conexión', 'error');
    }
    setCargando(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-violet-600 mb-4 flex items-center gap-2">
        <span>👤</span> Buscar o Registrar Cliente
      </h2>

      <div className="flex gap-3 mb-4">
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && buscar()}
          placeholder="Número de teléfono"
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-lg"
          maxLength={15}
        />
        <button
          onClick={buscar}
          disabled={cargando}
          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50"
        >
          {cargando ? '...' : 'Buscar'}
        </button>
      </div>

      {mostrarFormNuevo && (
        <div className="border-t pt-4 mt-4">
          <label className="block text-gray-600 mb-2">Nombre del cliente:</label>
          <input
            type="text"
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && registrar()}
            placeholder="Nombre completo"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none mb-3"
          />
          <button
            onClick={registrar}
            disabled={cargando}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50"
          >
            Registrar Nuevo Cliente
          </button>
        </div>
      )}
    </div>
  );
}
