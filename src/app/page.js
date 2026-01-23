'use client';

import { useState, useEffect } from 'react';
import SeleccionTienda from '@/components/SeleccionTienda';
import Header from '@/components/Header';
import Login from '@/components/Login';
import Catalogo from '@/components/Catalogo';
import Carrito from '@/components/Carrito';
import Checkout from '@/components/Checkout';
import Footer from '@/components/Footer';
import { supabaseBrowser, signOut } from '@/lib/supabase-browser';

export default function Home() {
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [mostrarCheckout, setMostrarCheckout] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthUser(session.user);
          await vincularClienteSocial(session.user);
          setMostrarLogin(false);
        } else {
          setAuthUser(null);
        }
      }
    );

    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        vincularClienteSocial(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const vincularClienteSocial = async (user) => {
    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_id: user.id,
          email: user.email,
          nombre: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
        })
      });

      if (res.ok) {
        const clienteData = await res.json();
        setCliente(clienteData);
      }
    } catch (error) {
      console.error('Error vinculando cliente social:', error);
    }
  };

  const handleLogout = async () => {
    if (authUser) {
      await signOut();
      setAuthUser(null);
    }
    setCliente(null);
  };

  // Si no hay tienda seleccionada, mostrar selección de tienda
  if (!tiendaSeleccionada) {
    return <SeleccionTienda onSeleccionar={setTiendaSeleccionada} />;
  }

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito(prev =>
      prev.map(item =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const handleCompraCompletada = (resultado) => {
    setVentaCompletada(resultado);
    setCarrito([]);
    setMostrarCheckout(false);

    if (cliente && resultado.puntos_ganados) {
      setCliente(prev => ({
        ...prev,
        puntos: prev.puntos + resultado.puntos_ganados - (resultado.puntos_usados || 0)
      }));
    }
  };

  const cambiarTienda = () => {
    setTiendaSeleccionada(null);
    setCarrito([]);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header
        cliente={cliente}
        carrito={carrito}
        tienda={tiendaSeleccionada}
        onLoginClick={() => setMostrarLogin(true)}
        onLogout={handleLogout}
        onCambiarTienda={cambiarTienda}
      />

      {/* Modal Login */}
      {mostrarLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <button
              onClick={() => setMostrarLogin(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-red-500 z-10"
            >
              ✕
            </button>
            <Login
              cliente={cliente}
              onLogin={(c) => { setCliente(c); setMostrarLogin(false); }}
              onRegistrar={() => {}}
              onCerrarSesion={() => setCliente(null)}
            />
          </div>
        </div>
      )}

      {/* Modal Venta Completada */}
      {ventaCompletada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">¡Pedido Exitoso!</h2>
            <p className="text-gray-600 mb-2">{ventaCompletada.mensaje}</p>
            <p className="text-sm text-[#c53030] font-semibold mb-2">
              Recoger en: {tiendaSeleccionada.nombre}
            </p>
            <p className="text-sm text-gray-500 mb-4">Orden #{ventaCompletada.venta_id}</p>
            <button
              onClick={() => setVentaCompletada(null)}
              className="bg-[#c53030] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#9b2c2c]"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Modal Checkout */}
      {mostrarCheckout && (
        <Checkout
          items={carrito}
          cliente={cliente}
          tienda={tiendaSeleccionada}
          onCompletado={handleCompraCompletada}
          onCancelar={() => setMostrarCheckout(false)}
        />
      )}

      {/* Banner de tienda seleccionada */}
      <div className="bg-[#3d2314] text-white py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">📍</span>
            <div>
              <p className="font-bold">{tiendaSeleccionada.nombre}</p>
              <p className="text-xs text-white/70">{tiendaSeleccionada.direccion}</p>
            </div>
          </div>
          <button
            onClick={cambiarTienda}
            className="text-sm bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition-colors"
          >
            Cambiar tienda
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Catálogo */}
          <div className="lg:col-span-2">
            <Catalogo onAgregarCarrito={agregarAlCarrito} tiendaId={tiendaSeleccionada.id} />
          </div>

          {/* Sidebar: Usuario + Carrito */}
          <div className="space-y-6">
            {cliente && (
              <div className="bg-[#3d2314] text-white rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-[#4a9b8c] rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{cliente.nombre}</p>
                    <p className="text-white/70 text-sm">{cliente.telefono}</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-4xl font-bold">{cliente.puntos}</p>
                  <p className="text-white/70 text-sm">puntos acumulados</p>
                </div>
              </div>
            )}

            <Carrito
              items={carrito}
              onActualizar={actualizarCantidad}
              onEliminar={eliminarDelCarrito}
              onCheckout={() => {
                if (!cliente) {
                  setMostrarLogin(true);
                } else {
                  setMostrarCheckout(true);
                }
              }}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
