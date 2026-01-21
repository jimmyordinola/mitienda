'use client';

export default function Mensaje({ texto, tipo }) {
  if (!texto) return null;

  const estilos = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className={`p-4 rounded-xl border mb-4 ${estilos[tipo]}`}>
      {texto}
    </div>
  );
}
