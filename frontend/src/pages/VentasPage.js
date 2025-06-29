import React from 'react';
import PanelVentas from '../components/ventas/PanelVentas';

const VentasPage = () => {
  return (
    <div>
      <h2>Panel de Ventas</h2>
      <p>Registre nuevas ventas y gestione productos.</p>
      <PanelVentas />
    </div>
  );
};

export default VentasPage;
