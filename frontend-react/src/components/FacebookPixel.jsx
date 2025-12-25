import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Componente para integração com Facebook Pixel
 * Carrega configuração do backend e dispara eventos automaticamente
 */
const FacebookPixel = () => {
  const [pixelId, setPixelId] = useState(null);
  const [events, setEvents] = useState({});

  useEffect(() => {
    loadPixelConfig();
  }, []);

  const loadPixelConfig = async () => {
    try {
      const response = await api.get('/backend/admin/facebook-pixel.php');
      if (response.data.success && response.data.pixel_id) {
        setPixelId(response.data.pixel_id);
        setEvents(response.data.events || {});
        initializePixel(response.data.pixel_id);
      }
    } catch (error) {
      // Silenciar erro se endpoint não existir (404) ou não for admin (401)
      if (error.response?.status !== 404 && error.response?.status !== 401) {
        console.debug('Erro ao carregar configuração do Facebook Pixel:', error);
      }
    }
  };

  const initializePixel = (id) => {
    if (typeof window === 'undefined' || !id) return;

    // Verificar se já foi inicializado
    if (window.fbq) return;

    // Criar script do Facebook Pixel
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    // Inicializar Pixel
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  };

  // Função para disparar eventos (exportada globalmente)
  useEffect(() => {
    if (pixelId && typeof window !== 'undefined') {
      window.trackFacebookEvent = (eventName, params = {}) => {
        if (window.fbq && events[eventName]) {
          window.fbq('track', eventName, params);
        }
      };
    }
  }, [pixelId, events]);

  return null;
};

export default FacebookPixel;

