'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MisPuntosPage() {
  const [cliente, setCliente] = useState(null);
  const [fidelidad, setFidelidad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState('recompensas');
  const [canjeando, setCanjeando] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [uniendose, setUniendose] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState('');

  useEffect(() => {
    // Recuperar cliente del localStorage
    const clienteGuardado = localStorage.getItem('cliente');
    if (clienteGuardado) {
      try {
        const c = JSON.parse(clienteGuardado);
        setCliente(c);
        cargarFidelidad(c.id);
      } catch (e) {
        setCargando(false);
      }
    } else {
      setCargando(false);
    }
  }, []);

  const cargarFidelidad = async (clienteId) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/fidelidad?cliente_id=${clienteId}`);
      const data = await res.json();
      setFidelidad(data);
    } catch (e) {
      console.error('Error cargando fidelidad:', e);
    }
    setCargando(false);
  };

  const unirsePrograma = async () => {
    if (!cliente) return;
    setUniendose(true);
    setMensaje(null);

    try {
      const res = await fetch('/api/fidelidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          fecha_nacimiento: fechaNacimiento || undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        setMensaje({ tipo: 'exito', texto: data.mensaje });
        // Actualizar cliente en localStorage
        const clienteActualizado = { ...cliente, puntos: data.puntos_totales };
        localStorage.setItem('cliente', JSON.stringify(clienteActualizado));
        setCliente(clienteActualizado);
        // Recargar fidelidad
        await cargarFidelidad(cliente.id);
      } else {
        setMensaje({ tipo: 'error', texto: data.error });
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error al unirse al programa' });
    }
    setUniendose(false);
  };

  const canjearRecompensa = async (recompensa) => {
    if (!cliente || canjeando) return;
    setCanjeando(recompensa.id);
    setMensaje(null);

    try {
      const res = await fetch('/api/fidelidad/canjear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          recompensa_id: recompensa.id
        })
      });

      const data = await res.json();

      if (data.success) {
        setMensaje({
          tipo: 'exito',
          texto: `${data.mensaje} Tu codigo: ${data.canje.codigo}`
        });
        // Actualizar puntos en localStorage
        const clienteActualizado = { ...cliente, puntos: data.puntos_restantes };
        localStorage.setItem('cliente', JSON.stringify(clienteActualizado));
        setCliente(clienteActualizado);
        // Recargar fidelidad
        await cargarFidelidad(cliente.id);
      } else {
        setMensaje({ tipo: 'error', texto: data.error });
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error al canjear recompensa' });
    }
    setCanjeando(null);
  };

  const reclamarCumpleanos = async () => {
    if (!cliente) return;
    setMensaje(null);

    try {
      const res = await fetch('/api/fidelidad/cumpleanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: cliente.id })
      });

      const data = await res.json();

      if (data.success) {
        setMensaje({ tipo: 'exito', texto: data.mensaje });
        const clienteActualizado = { ...cliente, puntos: data.puntos_totales };
        localStorage.setItem('cliente', JSON.stringify(clienteActualizado));
        setCliente(clienteActualizado);
        await cargarFidelidad(cliente.id);
      } else {
        setMensaje({ tipo: 'error', texto: data.error });
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error al reclamar bonus' });
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Si no hay cliente logueado
  if (!cargando && !cliente) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-[#3d2314] mb-2">Inicia sesion</h1>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesion para ver tus puntos y recompensas
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#4a9b8c] text-white rounded-xl font-bold hover:bg-[#3d8577] transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-[#3d2314] text-white py-4 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="El Chalan" className="h-10" />
          </Link>
          <div className="text-right">
            <p className="text-sm opacity-80">Hola, {cliente?.nombre}</p>
            <p className="text-lg font-bold">{cliente?.puntos || 0} puntos</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* Mensaje */}
        {mensaje && (
          <div className={`mb-4 p-4 rounded-xl ${
            mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {mensaje.texto}
            <button
              onClick={() => setMensaje(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#4a9b8c] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : !fidelidad?.miembro_fidelidad ? (
          /* Card para unirse al programa */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#4a9b8c] to-[#3d8577] p-6 text-white text-center">
              <div className="text-5xl mb-3">⭐</div>
              <h1 className="text-2xl font-bold mb-2">Programa de Fidelidad</h1>
              <p className="opacity-90">Unete y gana 50 puntos de bienvenida</p>
            </div>

            <div className="p-6">
              <h2 className="font-bold text-[#3d2314] mb-4">Beneficios:</h2>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🎁</span>
                  <span>50 puntos de bienvenida al unirte</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <span>1 punto por cada S/1 de compra</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🎂</span>
                  <span>Bonus especial en tu cumpleanos</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🎫</span>
                  <span>Canjea puntos por recompensas</span>
                </li>
              </ul>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de nacimiento (opcional, para bonus)
                </label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-xl focus:border-[#4a9b8c] focus:outline-none"
                />
              </div>

              <button
                onClick={unirsePrograma}
                disabled={uniendose}
                className="w-full py-4 bg-[#c53030] text-white rounded-xl font-bold text-lg hover:bg-[#9b2c2c] transition-colors disabled:opacity-50"
              >
                {uniendose ? 'Uniendose...' : 'Unirme al programa'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Card de puntos */}
            <div className="bg-gradient-to-r from-[#3d2314] to-[#5d3324] rounded-2xl p-6 text-white mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-80">Tus puntos</p>
                  <p className="text-4xl font-bold">{fidelidad?.puntos_globales || 0}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⭐</span>
                </div>
              </div>

              {/* Progreso hacia cupón automático */}
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progreso cupon automatico</span>
                  <span>{fidelidad?.puntos_tienda_actual || 0}/75</span>
                </div>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#4a9b8c] h-full rounded-full transition-all"
                    style={{ width: `${fidelidad?.progreso_porcentaje || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs opacity-70 mt-1">
                  Al llegar a 75 puntos recibes S/15 de descuento
                </p>
              </div>

              {/* Bonus cumpleaños */}
              {fidelidad?.tiene_cumpleanos && (
                <button
                  onClick={reclamarCumpleanos}
                  className="mt-4 w-full py-2 bg-yellow-500 text-[#3d2314] rounded-xl font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🎂</span> Reclamar bonus de cumpleanos
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-xl p-1 mb-4 shadow">
              {['recompensas', 'cupones', 'historial'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setTabActiva(tab)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors capitalize ${
                    tabActiva === tab
                      ? 'bg-[#4a9b8c] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Contenido de tabs */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Recompensas */}
              {tabActiva === 'recompensas' && (
                <div className="p-4">
                  <h2 className="font-bold text-[#3d2314] mb-4">Canjea tus puntos</h2>
                  {fidelidad?.recompensas?.length > 0 ? (
                    <div className="space-y-3">
                      {fidelidad.recompensas.map(r => {
                        const puedeCanjar = (fidelidad?.puntos_globales || 0) >= r.puntos_requeridos;
                        return (
                          <div
                            key={r.id}
                            className={`border-2 rounded-xl p-4 transition-all ${
                              puedeCanjar ? 'border-[#4a9b8c] bg-[#4a9b8c]/5' : 'border-gray-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-3xl">{r.imagen || '🎁'}</div>
                              <div className="flex-1">
                                <h3 className="font-bold text-[#3d2314]">{r.nombre}</h3>
                                {r.descripcion && (
                                  <p className="text-sm text-gray-500">{r.descripcion}</p>
                                )}
                                <p className="text-sm font-bold text-[#4a9b8c]">
                                  {r.puntos_requeridos} puntos
                                </p>
                              </div>
                              <button
                                onClick={() => canjearRecompensa(r)}
                                disabled={!puedeCanjar || canjeando === r.id}
                                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                                  puedeCanjar
                                    ? 'bg-[#c53030] text-white hover:bg-[#9b2c2c]'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {canjeando === r.id ? '...' : 'Canjear'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      No hay recompensas disponibles
                    </p>
                  )}

                  {/* Canjes pendientes */}
                  {fidelidad?.canjes_pendientes?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-bold text-[#3d2314] mb-3">Tus canjes pendientes</h3>
                      <div className="space-y-2">
                        {fidelidad.canjes_pendientes.map(c => (
                          <div key={c.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold">{c.recompensas?.nombre}</p>
                                <p className="text-sm text-gray-600">
                                  Codigo: <span className="font-mono font-bold">{c.codigo_canje}</span>
                                </p>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <p>Vence:</p>
                                <p>{formatearFecha(c.fecha_expiracion)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cupones */}
              {tabActiva === 'cupones' && (
                <div className="p-4">
                  <h2 className="font-bold text-[#3d2314] mb-4">Tus cupones</h2>

                  {fidelidad?.cupones?.vigentes?.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      <h3 className="text-sm font-medium text-gray-500">Vigentes</h3>
                      {fidelidad.cupones.vigentes.map(c => (
                        <div
                          key={c.id}
                          className="bg-gradient-to-r from-[#4a9b8c] to-[#3d8577] rounded-xl p-4 text-white"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-2xl font-bold">S/ {c.valor}</p>
                              <p className="text-sm opacity-80">Descuento</p>
                            </div>
                            <div className="bg-white/20 px-3 py-1 rounded text-sm font-mono">
                              {c.codigo}
                            </div>
                          </div>
                          <p className="text-xs mt-2 opacity-70">
                            Vence: {formatearFecha(c.fecha_fin)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🎫</div>
                      <p>No tienes cupones vigentes</p>
                      <p className="text-sm">Acumula 75 puntos para obtener uno</p>
                    </div>
                  )}

                  {fidelidad?.cupones?.canjeados?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Usados recientemente</h3>
                      <div className="space-y-2">
                        {fidelidad.cupones.canjeados.slice(0, 5).map(c => (
                          <div key={c.id} className="bg-gray-100 rounded-lg p-3 flex justify-between items-center">
                            <span className="text-gray-600">S/ {c.valor}</span>
                            <span className="text-xs text-gray-500">
                              Usado: {formatearFecha(c.fecha_canje)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Historial */}
              {tabActiva === 'historial' && (
                <div className="p-4">
                  <h2 className="font-bold text-[#3d2314] mb-4">Historial de puntos</h2>

                  {fidelidad?.historial?.length > 0 ? (
                    <div className="space-y-2">
                      {fidelidad.historial.map(t => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between py-3 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              t.puntos > 0 ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <span className="text-lg">
                                {t.tipo === 'GANADO' ? '💰' :
                                 t.tipo === 'BONUS_BIENVENIDA' ? '🎁' :
                                 t.tipo === 'BONUS_CUMPLEANOS' ? '🎂' :
                                 t.tipo === 'RECOMPENSA' ? '🎫' : '📝'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-[#3d2314] text-sm">
                                {t.descripcion || t.tipo}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatearFecha(t.fecha)}
                              </p>
                            </div>
                          </div>
                          <span className={`font-bold ${
                            t.puntos > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {t.puntos > 0 ? '+' : ''}{t.puntos}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📜</div>
                      <p>No hay transacciones aun</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Link para volver */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[#4a9b8c] font-medium hover:underline"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </main>
    </div>
  );
}
