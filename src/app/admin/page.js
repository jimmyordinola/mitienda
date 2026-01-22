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
    try {
      const res = await fetch(`/api/admin/${seccion}`);
      const data = await res.json();
      setDatos(data);
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
            disponible: true
          })
        });
      }
      cargarProductosTiendas(productoSeleccionado);
    } catch (e) {
      alert('Error al actualizar');
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
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-xl shadow-lg p-4">
            <nav className="space-y-2">
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
                      Marca las tiendas donde este producto estará disponible:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tiendas.map((tienda) => {
                        const asignacion = productosTiendas.find(pt => pt.tienda_id === tienda.id);
                        const estaAsignada = !!asignacion;
                        return (
                          <div
                            key={tienda.id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              estaAsignada
                                ? 'border-[#4a9b8c] bg-[#4a9b8c]/10'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleProductoEnTienda(tienda.id, estaAsignada, asignacion?.id)}
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
                              <div>
                                <span className="font-medium">{tienda.nombre}</span>
                                {tienda.direccion && (
                                  <p className="text-xs text-gray-500">{tienda.direccion}</p>
                                )}
                              </div>
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
            ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#3d2314] capitalize">{seccion}</h2>
                <button
                  onClick={() => setModal({ abierto: true, tipo: 'crear', item: {} })}
                  className="px-4 py-2 bg-[#4a9b8c] text-white rounded-lg font-medium hover:bg-[#3d8577]"
                >
                  + Agregar
                </button>
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
                        {(seccion === 'productos' || seccion === 'promociones' || seccion === 'cupones' || seccion === 'sabores' || seccion === 'toppings') && <th className="text-left py-3 px-4">Tienda</th>}
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
                      {datos.map((item) => {
                        const tiendaNombre = tiendas.find(t => t.id === item.tienda_id)?.nombre || 'Todas';
                        const categoriaNombre = categorias.find(c => c.id === item.categoria_id)?.nombre || item.categoria || '-';
                        return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{item.id}</td>
                          <td className="py-3 px-4">
                            {item.imagen || item.emoji} {item.nombre || item.titulo}
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
                          {(seccion === 'productos' || seccion === 'promociones' || seccion === 'cupones' || seccion === 'sabores' || seccion === 'toppings') && (
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
                            <button
                              onClick={() => setModal({ abierto: true, tipo: 'editar', item })}
                              className="text-blue-600 hover:underline mr-3"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarItem(item.id)}
                              className="text-red-600 hover:underline"
                            >
                              Eliminar
                            </button>
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

      {/* Modal de edición */}
      {modal.abierto && (
        <ModalEdicion
          seccion={seccion}
          item={modal.item}
          categorias={categorias}
          tiendas={tiendas}
          onGuardar={guardarItem}
          onCerrar={() => setModal({ abierto: false, tipo: null, item: null })}
        />
      )}
    </div>
  );
}

// Componente Modal
function ModalEdicion({ seccion, item, categorias, tiendas, onGuardar, onCerrar }) {
  // Valores por defecto para nuevos items
  const defaultValues = {
    activo: true,
    disponible: true,
    orden: 0
  };
  const [formData, setFormData] = useState(item?.id ? item : { ...defaultValues, ...item });
  const [subiendo, setSubiendo] = useState(false);
  const [tiendasSeleccionadas, setTiendasSeleccionadas] = useState([]);

  // Cargar tiendas asignadas al producto si estamos editando
  useEffect(() => {
    if (seccion === 'productos' && item?.id) {
      fetch(`/api/admin/productos-tiendas?producto_id=${item.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTiendasSeleccionadas(data.map(pt => pt.tienda_id));
          }
        })
        .catch(() => setTiendasSeleccionadas([]));
    }
  }, [seccion, item?.id]);

  const toggleTienda = (tiendaId) => {
    setTiendasSeleccionadas(prev =>
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
      { name: 'destacado', label: 'Destacado (Lo mas pedido)', type: 'checkbox' },
      { name: 'personalizable', label: 'Personalizable (permite elegir sabores)', type: 'checkbox' },
      { name: 'max_sabores', label: 'Max. Sabores (si es personalizable)', type: 'number' },
      { name: 'permite_toppings', label: 'Permite Toppings', type: 'checkbox' },
      { name: 'max_toppings', label: 'Max. Toppings', type: 'number' },
    ],
    sabores: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'imagen', label: 'Imagen', type: 'image_upload' },
      { name: 'color', label: 'Color (hex)', type: 'text' },
      { name: 'tienda_id', label: 'Tienda (vacio = todas)', type: 'tienda_select' },
      { name: 'categoria_id', label: 'Categoria (vacio = todas)', type: 'categoria_select' },
      { name: 'orden', label: 'Orden', type: 'number' },
      { name: 'activo', label: 'Activo', type: 'checkbox' },
    ],
    toppings: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'imagen', label: 'Imagen', type: 'image_upload' },
      { name: 'precio', label: 'Precio adicional', type: 'number', required: true },
      { name: 'tienda_id', label: 'Tienda (vacio = todas)', type: 'tienda_select' },
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-[#3d2314] mb-4">
          {item.id ? 'Editar' : 'Nuevo'} {seccion.slice(0, -1)}
        </h3>

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
                    <div className="border-2 rounded-lg p-3 max-h-48 overflow-y-auto">
                      {tiendas.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay tiendas disponibles</p>
                      ) : (
                        <div className="space-y-2">
                          {tiendas.map((t) => (
                            <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={tiendasSeleccionadas.includes(t.id)}
                                onChange={() => toggleTienda(t.id)}
                                className="w-4 h-4 accent-[#4a9b8c]"
                              />
                              <span className="text-sm">{t.nombre}</span>
                              {t.direccion && <span className="text-xs text-gray-400">- {t.direccion}</span>}
                            </label>
                          ))}
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

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#4a9b8c] text-white rounded-xl font-medium hover:bg-[#3d8577]"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
