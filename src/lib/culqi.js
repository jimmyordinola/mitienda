// Configuración de Culqi
export const CULQI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_xxxxxxxx';

// Inicializar Culqi Checkout
export const initCulqi = (settings) => {
  if (typeof window === 'undefined' || !window.Culqi) return;

  window.Culqi.publicKey = CULQI_PUBLIC_KEY;

  window.Culqi.settings({
    title: 'El Chalán Heladería',
    currency: 'PEN',
    amount: settings.amount * 100, // En centavos
    order: settings.orderId || `order-${Date.now()}`,
    ...settings
  });

  window.Culqi.options({
    lang: 'es',
    installments: false,
    paymentMethods: {
      tarjeta: true,
      yape: true,
      bancaMovil: false,
      agente: false,
      billetera: false,
      cuotealo: false
    },
    style: {
      logo: '/images/logo.png',
      bannerColor: '#3d2314',
      buttonBackground: '#c53030',
      buttonText: 'Pagar',
      buttonTextColor: '#ffffff',
      priceColor: '#3d2314'
    }
  });
};

// Abrir el checkout de Culqi
export const openCulqiCheckout = () => {
  if (typeof window !== 'undefined' && window.Culqi) {
    window.Culqi.open();
  }
};

// Cerrar el checkout de Culqi
export const closeCulqiCheckout = () => {
  if (typeof window !== 'undefined' && window.Culqi) {
    window.Culqi.close();
  }
};

// Procesar el pago con el token
export const processPayment = async (token, amount, email, metadata = {}) => {
  try {
    const response = await fetch('/api/pagos/culqi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        amount,
        email,
        description: `Pedido El Chalán - ${new Date().toLocaleDateString()}`,
        metadata
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al procesar el pago');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
