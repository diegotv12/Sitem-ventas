import React from 'react';
import RegistroVendedorForm from '../components/vendedores/RegistroVendedorForm';

const RegisterVendedorPage = () => {
  return (
    <div>
      <h2>Registrar Nuevo Vendedor (Admin)</h2>
      <p>Este formulario permite a un administrador registrar un nuevo vendedor en el sistema.</p>
      <RegistroVendedorForm />
    </div>
  );
};

export default RegisterVendedorPage;
