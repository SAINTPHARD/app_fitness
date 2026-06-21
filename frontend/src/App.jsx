import React from 'react';
import { Login } from './pages/Login'; // Importa a tela de login que criamos na pasta pages

/**
 * Componente raiz da aplicação Frontend.
 */
function App() {
  return (
    <div>
      {/* Renderiza o formulário de autenticação do atleta */}
      <Login />
    </div>
  );
}

export default App;