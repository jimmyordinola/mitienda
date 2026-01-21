'use client';

import { useState, useEffect } from 'react';

export default function Estadisticas({ refresh }) {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalPuntos: 0,
    topClientes: []
  });

  useEffect(() => {
    cargarStats();
  }, [refresh]);

  const cargarStats = async () => {
    try {
      const res = await fetch('/api/estadisticas');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Error cargando estadísticas');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-violet-600 mb-4">📈 Estadísticas</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center bg-gray-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-violet-600">{stats.totalClientes}</div>
          <div className="text-gray-500 text-sm">Clientes</div>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-violet-600">{stats.totalPuntos}</div>
          <div className="text-gray-500 text-sm">Puntos Totales</div>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-violet-600">
            {stats.topClientes[0]?.nombre?.split(' ')[0] || '-'}
          </div>
          <div className="text-gray-500 text-sm">Top Cliente</div>
        </div>
      </div>
    </div>
  );
}
