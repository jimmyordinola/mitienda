'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [admin, setAdmin] = useState(null);
  const [seccion, setSeccion] = useState('productos');
  const [datos, setDatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [tiendasCategorias, setTiendasCategorias] = useState([]);
  const [productosTiendas, setProductosTiendas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState({ abierto: false, tipo: null, item: null });
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [saboresTiendas, setSaboresTiendas] = useState({});
  const [toppingsTiendas, setToppingsTiendas] = useState({});
  const [productosTiendasMap, setProductosTiendasMap] = useState({});

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  useEffect(() => {
    if (admin) {
      cargarDatos();
      cargarCategorias();
      cargarTiendas();
    }
  }, [admin, seccion]);

  useEffect(() => {
    if (admin && seccion === 'tiendas-categorias' && tiendaSeleccionada) {
      cargarTiendasCategorias(tiendaSeleccionada);
    }
  }, [tiendaSeleccionada]);

  useEffect(() => {
    if (admin && seccion === 'productos-tiendas') {
      cargarProductos();
      if (productoSeleccionado) {
        cargarProductosTiendas(productoSeleccionado);
      }
    }
  }, [seccion, productoSeleccionado]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setAdmin(data);
      } else {
        setErrorLogin('Credenciales inválidas');
      }
    } catch (e) {
      setErrorLogin('Error de conexión');
    }
  };

  const cargarDatos = async () => {
    setCargando(true);
    setFiltro('');
    try {
      const res = await fetch(`/api/admin/${seccion}`);
      const data = await res.json();
      setDatos(data);

      // Cargar tiendas asignadas para sabores y toppings (en paralelo)
      if (seccion === 'sabores' && Array.isArray(data)) {
        const tiendasMap = {};
        const promises = data.map(async (sabor) => {
          const res2 = await fetch(`/api/admin/sabores-tiendas?sabor_id=${sabor.id}`);
          const tiendas = await res2.json();
          tiendasMap[sabor.id] = Array.isArray(tiendas) ? tiendas.map(t => t.tienda_id) : [];
        });
        await Promise.all(promises);
        setSaboresTiendas(tiendasMap);
      }
      if (seccion === 'toppings' && Array.isArray(data)) {
        const tiendasMap = {};
        const promises = data.map(async (topping) => {
          const res2 = await fetch(`/api/admin/toppings-tiendas?topping_id=${topping.id}`);
          const tiendas = await res2.json();
          tiendasMap[topping.id] = Array.isArray(tiendas) ? tiendas.map(t => t.tienda_id) : [];
        });
        await Promise.all(promises);
        setToppingsTiendas(tiendasMap);
      }
      // Cargar tiendas asignadas para productos (en paralelo)
      if (seccion === 'productos' && Array.isArray(data)) {
        const tiendasMap = {};
        const promises = data.map(async (producto) => {
          const res2 = await fetch(`/api/admin/productos-tiendas?producto_id=${producto.id}`);
          const tiendas = await res2.json();
          tiendasMap[producto.id] = Array.isArray(tiendas) ? tiendas.map(t => t.tienda_id) : [];
        });
        await Promise.all(promises);
        setProductosTiendasMap(tiendasMap);
      }
    } catch (e) {
      console.error('Error cargando datos');
    }
    setCargando(false);
  };

  const cargarCategorias = async () => {
    try {
      const res = await fetch('/api/admin/categorias');
      const data = await res.json();
      setCategorias(data);
    } catch (e) {}
  };

  const cargarTiendas = async () => {
    try {
      const res = await fetch('/api/admin/tiendas');
      const data = await res.json();
      setTiendas(data);
    } catch (e) {}
  };

  const cargarProductos = async () => {
    try {
      const res = await fetch('/api/admin/productos');
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (e) {
      setProductos([]);
    }
  };

  const cargarTiendasCategorias = async (tiendaId) => {
    try {
      const res = await fetch(`/api/admin/tiendas-categorias?tienda_id=${tiendaId}`);
      const data = await res.json();
      setTiendasCategorias(Array.isArray(data) ? data : []);
    } catch (e) {
      setTiendasCategorias([]);
    }
  };

  const toggleCategoriaEnTienda = async (categoriaId, estaAsignada, asignacionId) => {
    try {
      if (estaAsignada) {
        // Eliminar asignación
        await fetch(`/api/admin/tiendas-categorias?id=${asignacionId}`, {
          method: 'DELETE'
        });
      } else {
        // Crear asignación
        await fetch('/api/admin/tiendas-categorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tienda_id: tiendaSeleccionada,
            categoria_id: categoriaId,
            activo: true,
            orden: 0
          })
        });
      }
      cargarTiendasCategorias(tiendaSeleccionada);
    } catch (e) {
      alert('Error al actualizar');
    }
  };

  const cargarProductosTiendas = async (productoId) => {
    try {
      const res = await fetch(`/api/admin/productos-tiendas?producto_id=${productoId}`);
      const data = await res.json();
      setProductosTiendas(Array.isArray(data) ? data : []);
    } catch (e) {
      setProductosTiendas([]);
    }
  };

  const toggleProductoEnTienda = async (tiendaId, estaAsignada, asignacionId) => {
    try {
      if (estaAsignada) {
        await fetch(`/api/admin/productos-tiendas?id=${asignacionId}`, {
          method: 'DELETE'
        });
      } else {
        await fetch('/api/admin/productos-tiendas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            producto_id: productoSeleccionado,
            tienda_id: tiendaId,
            disponible: true,
            destacado: false
          })
        });
      }
      cargarProductosTiendas(productoSeleccionado);
    } catch (e) {
      alert('Error al actualizar');
    }
  };

  const toggleDestacadoEnTienda = async (asignacionId, destacadoActual) => {
    try {
      await fetch('/api/admin/productos-tiendas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: asignacionId,
          destacado: !destacadoActual
        })
      });
      cargarProductosTiendas(productoSeleccionado);
    } catch (e) {
      alert('Error al actualizar destacado');
    }
  };

  const guardarItem = async (item) => {
    const metodo = item.id ? 'PUT' : 'POST';
    try {
      const res = await fetch(`/api/admin/${seccion}`, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (res.ok) {
        setModal({ abierto: false, tipo: null, item: null });
        cargarDatos();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al guardar');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  const eliminarItem = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;

    try {
      const res = await fetch(`/api/admin/${seccion}?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        cargarDatos();
      }
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  // Pantalla de login
  if (!admin) {
    return (
      <div className="min-h-screen bg-[#3d2314] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/images/logo.png" alt="El Chalán" className="h-20 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#3d2314]">Panel de Administración</h1>
          </div>

          {errorLogin && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">{errorLogin}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-[#4a9b8c] focus:outline-none"
                placeholder="admin@elchalan.com"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-[#4a9b8c] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#c53030] text-white rounded-xl font-bold hover:bg-[#9b2c2c]"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#3d2314] text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/logo.png" alt="El Chalán" className="h-12" />
            <h1 className="text-xl font-bold">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">v2.0</span>
            <span className="text-sm">{admin.nombre}</span>
            <button
              onClick={() => setAdmin(null)}
              className="text-sm bg-white/20 px-4 py-2 rounded hover:bg-white/30"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 bg-white rounded-xl shadow-lg p-4">
            <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              {[
                { id: 'productos', nombre: 'Productos', emoji: '📦' },
                { id: 'categorias', nombre: 'Categorías', emoji: '📂' },
                { id: 'tiendas-categorias', nombre: 'Categorías x Tienda', emoji: '🔗' },
                { id: 'productos-tiendas', nombre: 'Productos x Tienda', emoji: '📦🏪' },
                { id: 'sabores', nombre: 'Sabores', emoji: '🍨' },
                { id: 'toppings', nombre: 'Toppings', emoji: '🍫' },
                { id: 'promociones', nombre: 'Promociones', emoji: '🎉' },
                { id: 'cupones', nombre: 'Cupones', emoji: '🎟️' },
                { id: 'banners', nombre: 'Banners', emoji: '🖼️' },
                { id: 'ventas', nombre: 'Pedidos', emoji: '🧾' },
                { id: 'tiendas', nombre: 'Tiendas', emoji: '🏪' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSeccion(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    seccion === item.id
                      ? 'bg-[#4a9b8c] text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {item.emoji} {item.nombre}
                </button>
              ))}
            </nav>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1">
            {seccion === 'tiendas-categorias' ? (
              /* Vista especial para asignar categorías a tiendas */
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#3d2314] mb-6">Asignar Categorías por Tienda</h2>

                {/* Selector de tienda */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona una tienda para configurar sus categorías:
                  </label>
                  <select
                    value={tiendaSeleccionada || ''}
                    onChange={(e) => setTiendaSeleccionada(e.target.value ? Number(e.target.value) : null)}
                    className="w-full max-w-md px-4 py-3 border-2 rounded-lg focus:border-[#4a9b8c] focus:outline-none"
                  >
                    <option value="">-- Seleccionar tienda --</option>
                    {tiendas.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                {tiendaSeleccionada && (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Marca las categorías que estarán disponibles en esta tienda:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorias.map((cat) => {
                        const asignacion = tiendasCategorias.find(tc => tc.categoria_id === cat.id);
                        const estaAsignada = !!asignacion;
                        return (
                          <div
                            key={cat.id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              estaAsignada
                                ? 'border-[#4a9b8c] bg-[#4a9b8c]/10'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleCategoriaEnTienda(cat.id, estaAsignada, asignacion?.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                estaAsignada ? 'border-[#4a9b8c] bg-[#4a9b8c]' : 'border-gray-300'
                              }`}>
                                {estaAsignada && (
                                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-2xl">{cat.emoji}</span>
                              <div>
                                <span className="font-medium">{cat.nombre}</span>
                                {cat.descripcion && (
                                  <p className="text-xs text-gray-500">{cat.descripcion}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {categorias.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No hay categorías creadas</p>
                    )}
                  </div>
                )}

                {!tiendaSeleccionada && (
                  <div className="text-center py-12 text-gray-500">
                    Selecciona una tienda para ver y configurar sus categorías
                  </div>
                )}
              </div>
            ) : seccion === 'productos-tiendas' ? (
              /* Vista especial para asignar productos a tiendas */
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#3d2314] mb-6">Asignar Productos a Tiendas</h2>

                {/* Selector de producto */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona un producto para configurar en qué tiendas está disponible:
                  </label>
                  <select
                    value={productoSeleccionado || ''}
                    onChange={(e) => setProductoSeleccionado(e.target.value ? Number(e.target.value) : null)}
                    className="w-full max-w-md px-4 py-3 border-2 rounded-lg focus:border-[#4a9b8c] focus:outline-none"
                  >
                    <option value="">-- Seleccionar producto --</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>{p.imagen || ''} {p.nombre} - S/{p.precio}</option>
                    ))}
                  </select>
                </div>

                {productoSeleccionado && (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Marca las tiendas donde este producto estará disponible. Usa la estrella para "Lo más pedido":
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tiendas.map((tienda) => {
                        const asignacion = productosTiendas.find(pt => pt.tienda_id === tienda.id);
                        const estaAsignada = !!asignacion;
                        const esDestacado = asignacion?.destacado || false;
                        return (
                          <div
                            key={tienda.id}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              estaAsignada
                                ? 'border-[#4a9b8c] bg-[#4a9b8c]/10'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer ${
                                  estaAsignada ? 'border-[#4a9b8c] bg-[#4a9b8c]' : 'border-gray-300'
                                }`}
                                onClick={() => toggleProductoEnTienda(tienda.id, estaAsignada, asignacion?.id)}
                              >
                                {estaAsignada && (
                                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">{tienda.nombre}</span>
                                {tienda.direccion && (
                                  <p className="text-xs text-gray-500">{tienda.direccion}</p>
                                )}
                              </div>
                              {estaAsignada && (
                                <button
                                  onClick={() => toggleDestacadoEnTienda(asignacion.id, esDestacado)}
                                  className={`text-2xl transition-all hover:scale-110 ${esDestacado ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                                  title={esDestacado ? 'Quitar de Lo más pedido' : 'Agregar a Lo más pedido'}
                                >
                                  ★
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {tiendas.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No hay tiendas creadas</p>
                    )}
                  </div>
                )}

                {!productoSeleccionado && (
                  <div className="text-center py-12 text-gray-500">
                    Selecciona un producto para ver y configurar sus tiendas
                  </div>
                )}
              </div>
            ) : seccion === 'ventas' ? (
              /* Vista especial para ver pedidos/ventas */
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#3d2314] mb-6">🧾 Pedidos Realizados</h2>

                {cargando ? (
                  <div className="text-center py-12">Cargando pedidos...</div>
                ) : !Array.isArray(datos) || datos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No hay pedidos registrados</div>
                ) : (
                  <div className="space-y-4">
                    {datos.map((venta) => (
                      <div key={venta.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <span className="font-bold text-[#3d2314]">Pedido #{venta.id}</span>
                            <span className="ml-3 text-sm text-gray-500">
                              {new Date(venta.created_at).toLocaleString('es-PE')}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-[#4a9b8c]">
                            S/{venta.total?.toFixed(2) || '0.00'}
                          </div>
                        </div>

                        {venta.clientes && (
                          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">👤 Cliente: </span>
                            <span className="font-medium">{venta.clientes.nombre}</span>
                            <span className="text-sm text-gray-500 ml-2">({venta.clientes.telefono})</span>
                          </div>
                        )}

                        {venta.detalles && venta.detalles.length > 0 && (
                          <div className="border-t pt-3">
                            <p className="text-sm font-medium text-gray-600 mb-2">Productos:</p>
                            <div className="space-y-2">
                              {venta.detalles.map((detalle, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    {detalle.productos?.imagen && (
                                      <img src={detalle.productos.imagen} alt="" className="w-8 h-8 rounded object-cover" />
                                    )}
                                    <span>{detalle.cantidad}x {detalle.productos?.nombre || 'Producto'}</span>
                                  </div>
                                  <span className="font-medium">S/{(detalle.precio_unitario * detalle.cantidad).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {venta.puntos_ganados > 0 && (
                          <div className="mt-3 text-sm text-[#4a9b8c]">
                            ⭐ +{venta.puntos_ganados} puntos ganados
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-[#3d2314] capitalize">{seccion}</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="flex-1 sm:w-48 px-3 py-2 border-2 rounded-lg focus:border-[#4a9b8c] focus:outline-none text-sm"
                  />
                  <button
                    onClick={() => setModal({ abierto: true, tipo: 'crear', item: {} })}
                    className="px-4 py-2 bg-[#4a9b8c] text-white rounded-lg font-medium hover:bg-[#3d8577] whitespace-nowrap"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {cargando ? (
                <div className="text-center py-12">Cargando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Nombre</th>
                        {seccion === 'productos' && <th className="text-left py-3 px-4">Precio</th>}
                        {seccion === 'productos' && <th className="text-left py-3 px-4">Categoria</th>}
                        {seccion === 'productos' && <th className="text-left py-3 px-4">Personal.</th>}
                        {seccion === 'toppings' && <th className="text-left py-3 px-4">Precio</th>}
                        {(seccion === 'sabores' || seccion === 'toppings' || seccion === 'productos') && <th className="text-left py-3 px-4">Tiendas</th>}
                        {(seccion === 'promociones' || seccion === 'cupones') && <th className="text-left py-3 px-4">Tienda</th>}
                        {seccion === 'cupones' && <th className="text-left py-3 px-4">Codigo</th>}
                        {seccion === 'cupones' && <th className="text-left py-3 px-4">Valor</th>}
                        {seccion === 'promociones' && <th className="text-left py-3 px-4">Tipo</th>}
                        {seccion === 'banners' && <th className="text-left py-3 px-4">Imagen</th>}
                        {seccion === 'banners' && <th className="text-left py-3 px-4">Orden</th>}
                        <th className="text-left py-3 px-4">Estado</th>
                        <th className="text-left py-3 px-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos
                        .filter(item => {
                          if (!filtro) return true;
                          const nombre = (item.nombre || item.titulo || '').toLowerCase();
                          return nombre.includes(filtro.toLowerCase());
                        })
                        .map((item) => {
                        const tiendaNombre = tiendas.find(t => t.id === item.tienda_id)?.nombre || 'Todas';
                        const categoriaNombre = categorias.find(c => c.id === item.categoria_id)?.nombre || item.categoria || '-';
                        // Tiendas asignadas para sabores, toppings y productos
                        const tiendasIds = seccion === 'sabores' ? saboresTiendas[item.id] :
                          (seccion === 'toppings' ? toppingsTiendas[item.id] :
                          (seccion === 'productos' ? productosTiendasMap[item.id] : []));
                        const tiendasNombres = (tiendasIds || []).map(tid => tiendas.find(t => t.id === tid)?.nombre).filter(Boolean);
                        return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{item.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {item.imagen && (item.imagen.startsWith('http') || item.imagen.startsWith('/')) ? (
                                <img src={item.imagen} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : item.imagen ? (
                                <span className="text-xl">{item.imagen}</span>
                              ) : null}
                              <span className="font-medium">{item.nombre || item.titulo || item.codigo}</span>
                            </div>
                          </td>
                          {seccion === 'productos' && (
                            <td className="py-3 px-4">S/{item.precio}</td>
                          )}
                          {seccion === 'productos' && (
                            <td className="py-3 px-4">{categoriaNombre}</td>
                          )}
                          {seccion === 'productos' && (
                            <td className="py-3 px-4">
                              {item.personalizable ? (
                                <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                                  {item.max_sabores || 4} sabores
                                </span>
                              ) : '-'}
                            </td>
                          )}
                          {seccion === 'toppings' && (
                            <td className="py-3 px-4">+S/{item.precio || 0}</td>
                          )}
                          {(seccion === 'sabores' || seccion === 'toppings' || seccion === 'productos') && (
                            <td className="py-3 px-4">
                              {tiendasNombres.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {tiendasNombres.map((nombre, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                      {nombre}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">Sin asignar</span>
                              )}
                            </td>
                          )}
                          {(seccion === 'promociones' || seccion === 'cupones') && (
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${item.tienda_id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {tiendaNombre}
                              </span>
                            </td>
                          )}
                          {seccion === 'cupones' && (
                            <td className="py-3 px-4 font-mono">{item.codigo}</td>
                          )}
                          {seccion === 'cupones' && (
                            <td className="py-3 px-4">
                              {item.tipo === 'porcentaje' ? `${item.valor}%` : `S/${item.valor}`}
                            </td>
                          )}
                          {seccion === 'promociones' && (
                            <td className="py-3 px-4">{item.tipo}</td>
                          )}
                          {seccion === 'banners' && (
                            <td className="py-3 px-4">
                              {item.imagen && (
                                <img src={item.imagen} alt="" className="w-16 h-10 object-cover rounded" />
                              )}
                            </td>
                          )}
                          {seccion === 'banners' && (
                            <td className="py-3 px-4">{item.orden}</td>
                          )}
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.activo || item.disponible
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {item.activo || item.disponible ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => setModal({ abierto: true, tipo: 'editar', item })}
                                className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg font-medium active:bg-blue-700"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarItem(item.id)}
                                className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg font-medium active:bg-red-700"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>

                  {datos.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No hay {seccion} registrados
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </main>
        </div>
      </div>

      {/* Vista de edición (reemplaza contenido en móvil) */}
      {modal.abierto && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto lg:bg-black/50 lg:flex lg:items-center lg:justify-center lg:p-4">
          <div className="bg-white w-full lg:max-w-lg lg:rounded-xl lg:max-h-[90vh] lg:overflow-auto">
            <FormularioEdicion
              seccion={seccion}
              item={modal.item}
              categorias={categorias}
              tiendas={tiendas}
              onGuardar={guardarItem}
              onCerrar={() => setModal({ abierto: false, tipo: null, item: null })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Edición (pantalla completa en móvil, modal en desktop)
function FormularioEdicion({ seccion, item, categorias, tiendas, onGuardar, onCerrar }) {
  // Valores por defecto para nuevos items
  const defaultValues = {
    activo: true,
    disponible: true,
    orden: 0
  };
  const [formData, setFormData] = useState(item?.id ? item : { ...defaultValues, ...item });
  const [subiendo, setSubiendo] = useState(false);
  const [tiendasSeleccionadas, setTiendasSeleccionadas] = useState([]);
  const [tiendasDestacadas, setTiendasDestacadas] = useState([]);
  const [cargandoTiendas, setCargandoTiendas] = useState(false);

  // Cargar tiendas asignadas si estamos editando
  useEffect(() => {
    if (!item?.id) return;

    const cargarTiendas = async () => {
      setCargandoTiendas(true);
      try {
        if (seccion === 'productos') {
          const res = await fetch(`/api/admin/productos-tiendas?producto_id=${item.id}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setTiendasSeleccionadas(data.map(pt => pt.tienda_id));
            setTiendasDestacadas(data.filter(pt => pt.destacado).map(pt => pt.tienda_id));
          }
        } else if (seccion === 'sabores') {
          const res = await fetch(`/api/admin/sabores-tiendas?sabor_id=${item.id}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setTiendasSeleccionadas(data.map(st => st.tienda_id));
          }
        } else if (seccion === 'toppings') {
          const res = await fetch(`/api/admin/toppings-tiendas?topping_id=${item.id}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setTiendasSeleccionadas(data.map(tt => tt.tienda_id));
          }
        }
      } catch (e) {
        console.error('Error cargando tiendas:', e);
        setTiendasSeleccionadas([]);
        setTiendasDestacadas([]);
      }
      setCargandoTiendas(false);
    };

    cargarTiendas();
  }, [seccion, item?.id]);

  const toggleTienda = (tiendaId) => {
    setTiendasSeleccionadas(prev => {
      if (prev.includes(tiendaId)) {
        // Si se quita la tienda, también quitar de destacados
        setTiendasDestacadas(d => d.filter(id => id !== tiendaId));
        return prev.filter(id => id !== tiendaId);
      }
      return [...prev, tiendaId];
    });
  };

  const toggleDestacado = (tiendaId) => {
    setTiendasDestacadas(prev =>
      prev.includes(tiendaId)
        ? prev.filter(id => id !== tiendaId)
        : [...prev, tiendaId]
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', seccion);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          [fieldName]: data.url
        }));
      } else {
        alert('Error al subir imagen');
      }
    } catch (error) {
      alert('Error al subir imagen');
    }
    setSubiendo(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Para productos, agregar el nombre de categoría y las tiendas seleccionadas
    if (seccion === 'productos') {
      if (tiendasSeleccionadas.length === 0) {
        alert('Debe seleccionar al menos una tienda');
        return;
      }
      const cat = categorias.find(c => c.id === Number(formData.categoria_id));
      onGuardar({
        ...formData,
        categoria: cat?.nombre || '',
        tiendas_ids: tiendasSeleccionadas,
        tiendas_destacadas: tiendasDestacadas
      });
      return;
    }
    // Para sabores y toppings, agregar tiendas_ids (puede estar vacío = global)
    if (seccion === 'sabores' || seccion === 'toppings') {
      onGuardar({
        ...formData,
        tiendas_ids: tiendasSeleccionadas
      });
      return;
    }
    onGuardar(formData);
  };

  const campos = {
    productos: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { name: 'precio', label: 'Precio', type: 'number', required: true },
      { name: 'tiendas_ids', label: 'Tiendas', type: 'tiendas_multi_select', required: true },
      { name: 'categoria_id', label: 'Categoria', type: 'categoria_select', required: true },
      { name: 'imagen', label: 'Emoji (alternativo)', type: 'text' },
      { name: 'imagen_url', label: 'Imagen', type: 'image_upload' },
      { name: 'orden', label: 'Orden', type: 'number' },
      { name: 'disponible', label: 'Disponible', type: 'checkbox' },
      { name: 'personalizable', label: 'Personalizable (permite elegir sabores)', type: 'checkbox' },
      { name: 'max_sabores', label: 'Max. Sabores (si es personalizable)', type: 'number' },
      { name: 'permite_toppings', label: 'Permite Toppings', type: 'checkbox' },
      { name: 'max_toppings', label: 'Max. Toppings', type: 'number' },
    ],
    sabores: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'imagen', label: 'Imagen', type: 'image_upload' },
      { name: 'color', label: 'Color (hex)', type: 'text' },
      { name: 'tiendas_ids', label: 'Tiendas (vacio = todas)', type: 'tiendas_multi_select_simple' },
      { name: 'categoria_id', label: 'Categoria (vacio = todas)', type: 'categoria_select' },
      { name: 'orden', label: 'Orden', type: 'number' },
      { name: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    toppings: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'imagen', label: 'Imagen', type: 'image_upload' },
      { name: 'precio', label: 'Precio adicional', type: 'number', required: true },
      { name: 'tiendas_ids', label: 'Tiendas (vacio = todas)', type: 'tiendas_multi_select_simple' },
      { name: 'categoria_id', label: 'Categoria (vacio = todas)', type: 'categoria_select' },
      { name: 'orden', label: 'Orden', type: 'number' },
      { name: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    categorias: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { name: 'emoji', label: 'Emoji', type: 'text' },
      { name: 'imagen', label: 'Imagen', type: 'image_upload' },
      { name: 'orden', label: 'Orden', type: 'number' },
      { name: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    promociones: [
      { name: 'titulo', label: 'Titulo', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { name: 'tipo', label: 'Tipo', type: 'select', options: ['2x1', 'descuento', 'combo', 'puntos_extra'] },
      { name: 'valor', label: 'Valor (% o monto)', type: 'number' },
      { name: 'tienda_id', label: 'Tienda (vacio = todas)', type: 'tienda_select' },
      { name: 'categoria_id', label: 'Categoria relacionada', type: 'categoria_select' },
      { name: 'imagen', label: 'Imagen', type: 'image_upload' },
      { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' },
      { name: 'fecha_fin', label: 'Fecha Fin', type: 'date' },
      { name: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    cupones: [
      { name: 'codigo', label: 'Codigo', type: 'text', required: true },
      { name: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { name: 'tipo', label: 'Tipo', type: 'select', options: ['porcentaje', 'monto_fijo', 'envio_gratis', 'puntos_extra'] },
      { name: 'valor', label: 'Valor', type: 'number', required: true },
      { name: 'minimo_compra', label: 'Minimo de Compra', type: 'number' },
      { name: 'max_usos', label: 'Max. Usos', type: 'number' },
      { name: 'tienda_id', label: 'Tienda (vacio = todas)', type: 'tienda_select' },
      { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' },
      { name: 'fecha_fin', label: 'Fecha Fin', type: 'date' },
      { name: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    banners: [
      { name: 'titulo', label: 'Título', type: 'text' },
      { name: 'subtitulo', label: 'Subtítulo', type: 'text' },
      { name: 'imagen', label: 'Imagen', type: 'image_upload', required: true },
      { name: 'url_destino', label: 'URL de destino (opcional)', type: 'text' },
      { name: 'orden', label: 'Orden', type: 'number' },
      { name: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    tiendas: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'direccion', label: 'Direccion', type: 'text', required: true },
      { name: 'imagen', label: 'Imagen', type: 'image_upload' },
      { name: 'telefono', label: 'Telefono', type: 'text' },
      { name: 'horario', label: 'Horario', type: 'text' },
      { name: 'disponible', label: 'Disponible', type: 'checkbox' },
    ],
  };

  return (
    <>
      {/* Header fijo */}
      <div className="sticky top-0 bg-[#3d2314] text-white p-4 flex items-center justify-between z-10">
        <button
          type="button"
          onClick={onCerrar}
          className="px-4 py-2 bg-white/20 rounded-lg font-medium"
        >
          ← Volver
        </button>
        <h3 className="text-lg font-bold">
          {item.id ? 'Editar' : 'Nuevo'} {seccion.slice(0, -1)}
        </h3>
        <div className="w-20"></div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {cargandoTiendas && (
          <div className="text-center py-4 text-gray-500">
            Cargando datos...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {campos[seccion]?.map((campo) => (
            <div key={campo.name} className="mb-4">
              {campo.type === 'checkbox' ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={campo.name}
                    checked={formData[campo.name] || false}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#4a9b8c]"
                  />
                  <span className="font-medium">{campo.label}</span>
                </label>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {campo.label} {campo.required && <span className="text-red-500">*</span>}
                  </label>
                  {campo.type === 'textarea' ? (
                    <textarea
                      name={campo.name}
                      value={formData[campo.name] || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-[#4a9b8c] focus:outline-none"
                      rows={3}
                    />
                  ) : campo.type === 'select' ? (
                    <select
                      name={campo.name}
                      value={formData[campo.name] || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-[#4a9b8c] focus:outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      {campo.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : campo.type === 'tiendas_multi_select' ? (
                    <div className="border-2 rounded-lg p-3 max-h-56 overflow-y-auto">
                      <p className="text-xs text-gray-500 mb-2">Marca las tiendas. Usa ★ para "Lo más pedido"</p>
                      {tiendas.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay tiendas disponibles</p>
                      ) : (
                        <div className="space-y-1">
                          {tiendas.map((t) => {
                            const seleccionada = tiendasSeleccionadas.includes(t.id);
                            const destacada = tiendasDestacadas.includes(t.id);
                            return (
                              <div key={t.id} className={`flex items-center gap-2 p-2 rounded ${seleccionada ? 'bg-[#4a9b8c]/10' : 'hover:bg-gray-50'}`}>
                                <input
                                  type="checkbox"
                                  checked={seleccionada}
                                  onChange={() => toggleTienda(t.id)}
                                  className="w-4 h-4 accent-[#4a9b8c]"
                                />
                                <span className="text-sm flex-1">{t.nombre}</span>
                                {seleccionada && (
                                  <button
                                    type="button"
                                    onClick={() => toggleDestacado(t.id)}
                                    className={`text-xl transition-all hover:scale-110 ${destacada ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                                    title={destacada ? 'Quitar de Lo más pedido' : 'Agregar a Lo más pedido'}
                                  >
                                    ★
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {tiendasSeleccionadas.length > 0 && (
                        <p className="text-xs text-[#4a9b8c] mt-2 pt-2 border-t">
                          {tiendasSeleccionadas.length} tienda(s) · {tiendasDestacadas.length} destacada(s)
                        </p>
                      )}
                    </div>
                  ) : campo.type === 'tiendas_multi_select_simple' ? (
                    <div className="border-2 rounded-lg p-3 max-h-56 overflow-y-auto">
                      <p className="text-xs text-gray-500 mb-2">Marca las tiendas (vacío = todas)</p>
                      {tiendas.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay tiendas disponibles</p>
                      ) : (
                        <div className="space-y-1">
                          {tiendas.map((t) => {
                            const seleccionada = tiendasSeleccionadas.includes(t.id);
                            return (
                              <div key={t.id} className={`flex items-center gap-2 p-2 rounded ${seleccionada ? 'bg-[#4a9b8c]/10' : 'hover:bg-gray-50'}`}>
                                <input
                                  type="checkbox"
                                  checked={seleccionada}
                                  onChange={() => toggleTienda(t.id)}
                                  className="w-4 h-4 accent-[#4a9b8c]"
                                />
                                <span className="text-sm flex-1">{t.nombre}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {tiendasSeleccionadas.length > 0 && (
                        <p className="text-xs text-[#4a9b8c] mt-2 pt-2 border-t">
                          {tiendasSeleccionadas.length} tienda(s) seleccionada(s)
                        </p>
                      )}
                    </div>
                  ) : campo.type === 'tienda_select' ? (
                    <select
                      name={campo.name}
                      value={formData[campo.name] || ''}
                      onChange={handleChange}
                      required={campo.required}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-[#4a9b8c] focus:outline-none"
                    >
                      <option value="">-- Todas las tiendas --</option>
                      {tiendas.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  ) : campo.type === 'categoria_select' ? (
                    <select
                      name={campo.name}
                      value={formData[campo.name] || ''}
                      onChange={handleChange}
                      required={campo.required}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-[#4a9b8c] focus:outline-none"
                    >
                      <option value="">-- Seleccionar categoria --</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>
                      ))}
                    </select>
                  ) : campo.type === 'image_upload' ? (
                    <div className="space-y-2">
                      {formData[campo.name] && (
                        <div className="relative inline-block">
                          <img
                            src={formData[campo.name]}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, [campo.name]: '' }))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                          >
                            X
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name={campo.name}
                          value={formData[campo.name] || ''}
                          onChange={handleChange}
                          placeholder="URL de imagen o subir archivo"
                          className="flex-1 px-4 py-2 border-2 rounded-lg focus:border-[#4a9b8c] focus:outline-none text-sm"
                        />
                        <label className={`px-4 py-2 bg-[#4a9b8c] text-white rounded-lg cursor-pointer hover:bg-[#3d8577] text-sm ${subiendo ? 'opacity-50' : ''}`}>
                          {subiendo ? '...' : 'Subir'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, campo.name)}
                            className="hidden"
                            disabled={subiendo}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <input
                      type={campo.type}
                      name={campo.name}
                      value={formData[campo.name] || ''}
                      onChange={handleChange}
                      required={campo.required}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:border-[#4a9b8c] focus:outline-none"
                    />
                  )}
                </>
              )}
            </div>
          ))}

          <div className="flex gap-3 mt-6 sticky bottom-0 bg-white py-4 border-t">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-medium text-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-[#4a9b8c] text-white rounded-xl font-medium text-lg"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
