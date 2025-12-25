import { useState, useEffect } from 'react';
import api from '../services/api';
import './SupportButton.css';

const SupportButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    loadWhatsappNumber();
  }, []);

  const loadWhatsappNumber = async () => {
    try {
      const response = await api.get('/backend/settings.php?key=whatsapp_number');
      if (response.data.success && response.data.value) {
        setWhatsappNumber(response.data.value);
      }
    } catch (error) {
      // Usar número padrão se não conseguir carregar
      console.debug('Erro ao carregar número WhatsApp:', error);
    }
  };

  if (!whatsappNumber) return null;

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="support-button"
      aria-label="Suporte via WhatsApp"
    >
      <span className="support-icon">💬</span>
    </a>
  );
};

export default SupportButton;

