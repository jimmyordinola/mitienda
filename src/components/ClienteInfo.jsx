'use client';

import { useState, useEffect } from 'react';

const PREMIOS = [
  { nombre: 'Topping gratis', puntos: 10 },
  { nombre: 'Helado simple', puntos: 25 },
  { nombre: 'Helado doble', puntos: 50 },
  { nombre: 'Sundae especial', puntos: 100 },
];

export default function ClienteInfo({ cliente, onActualizar, onMensaje }) {
  const [montoCompra, setMontoCompra] = useState('');
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (cliente) {
      cargarHistorial();
    }
  }, [cliente]);

  const cargarHistorial = async () => {
    try {
      const res = await fetch(`/api/transacciones/${cliente.id}`);
      const data = await res.json();
      setHistorial(data);
    } catch (e) {
      console.error('Error cargando historial');
    }
  };

  const agregarPuntos = async () => {
    const monto = parseFloat(montoCompra);
    if (!monto || monto <= 0) {
      onMensaje('Ingresa un monto válido', 'error');
      return;
    }

    const puntos = Math.floor(monto / 10);
    if (puntos < 1) {
      onMensaje('Compra mínima de $10 para ganar puntos', 'error');
      return;
    }

    setCargando(true);
    try {
      const res = await fetch('/api/puntos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          puntos,
          descripcion: `Compra de $${monto}`,
          tipo: 'agregar'
        })
      });

      if (res.ok) {
        const clienteActualizado = await res.json();
        onActualizar(clienteActualizado);
        setMontoCompra('');
        cargarHistorial();
        onMensaje(`¡+${puntos} puntos agregados!`, 'success');
      }
    } catch (e) {
      onMensaje('Error de conexión', 'error');
    }
    setCargando(false);
  };

  const canjearPremio = async (premio) => {
    if (cliente.puntos < premio.puntos) {
      onMensaje(`Necesitas ${premio.puntos} puntos. Tienes ${cliente.puntos}`, 'error');
      return;
    }

    if (!confirm(`¿Canjear ${premio.puntos} puntos por "${premio.nombre}"?`)) {
      return;
    }

    setCargando(true);
    try {
      const res = await fetch('/api/puntos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          puntos: premio.puntos,
          descripcion: premio.nombre,
          tipo: 'canjear'
        })
      });

      if (res.ok) {
        const clienteActualizado = await res.json();
        onActualizar(clienteActualizado);
        cargarHistorial();
        onMensaje(`¡Premio canjeado: ${premio.nombre}!`, 'success');
      } else {
        const error = await res.json();
        onMensaje(error.error, 'error');
      }
    } catch (e) {
      onMensaje('Error de conexión', 'error');
    }
    setCargando(false);
  };

  if (!cliente) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-violet-600 mb-4">
        📊 Cliente: {cliente.nombre}
      </h2>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-violet-600">{cliente.puntos}</div>
        <div className="text-gray-500">PUNTOS ACUMULADOS</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Agregar puntos */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-3">➕ Agregar Puntos (Compra)</h3>
          <label className="block text-sm text-gray-600 mb-2">Monto de compra ($):</label>
          <input
            type="number"
            value={montoCompra}
            onChange={(e) => setMontoCompra(e.target.value)}
            placeholder="Ej: 50"
            min="1"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none mb-2"
          />
          <p className="text-sm text-gray-500 mb-3">1 punto por cada $10 de compra</p>
          <button
            onClick={agregarPuntos}
            disabled={cargando}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50"
          >
            Agregar Puntos
          </button>
        </div>

        {/* Canjear premios */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-3">🎁 Canjear Premio</h3>
          <div className="grid grid-cols-2 gap-2">
            {PREMIOS.map((premio) => (
              <button
                key={premio.nombre}
                onClick={() => canjearPremio(premio)}
                disabled={cargando || cliente.puntos < premio.puntos}
                className={`p-3 rounded-xl text-white text-sm font-medium transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 ${
                  cliente.puntos >= premio.puntos
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600'
                    : 'bg-gray-400'
                }`}
              >
                {premio.nombre}
                <br />
                <span className="text-xs">({premio.puntos} pts)</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3">📜 Últimas transacciones</h3>
        <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-xl">
          {historial.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">Sin transacciones</p>
          ) : (
            historial.map((t) => (
              <div key={t.id} className="flex justify-between p-3 border-b border-gray-200 last:border-0">
                <span className="text-gray-700">{t.descripcion}</span>
                <span className={t.tipo === 'GANADO' ? 'text-green-600 font-semibold' : 'text-rose-600 font-semibold'}>
                  {t.tipo === 'GANADO' ? '+' : '-'}{t.puntos} pts
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
