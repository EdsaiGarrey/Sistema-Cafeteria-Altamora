import {
  Navigate,
  Route,
  Routes,
} from 'react-router'
import RutaProtegida from './components/autenticacion/RutaProtegida.jsx'
import InicioSesion from './paginas/autenticacion/InicioSesion.jsx'

import Registro from './paginas/autenticacion/Registro.jsx'
import RecuperarContrasena from './paginas/autenticacion/RecuperarContrasena.jsx'
import RestablecerContrasena from './paginas/autenticacion/RestablecerContrasena.jsx'
import PanelPrincipal from './paginas/PanelPrincipal.jsx'
import Pedidos from './paginas/pedidos/Pedidos.jsx'
import './App.css'

/**
 * Registra las páginas públicas y protegidas del sistema.
 */
function App() {
  return (
    <Routes>
      {/* Página pública para iniciar sesión. */}
      <Route
        path="/inicio-sesion"
        element={<InicioSesion />}
      />
{/* Página pública para registrar una cuenta. */}
<Route
  path="/registro"
  element={<Registro />}
/>
{/* Página pública para recuperar la contraseña. */}
<Route
  path="/recuperar-contrasena"
  element={<RecuperarContrasena />}
/>
{/* Página pública para establecer una contraseña nueva. */}
<Route
  path="/restablecer-contrasena"
  element={<RestablecerContrasena />}
/>
      {/*
       * Las rutas colocadas dentro de RutaProtegida
       * requieren una sesión válida.
       */}
      <Route element={<RutaProtegida />}>
        <Route
          path="/panel"
          element={<PanelPrincipal />}
          />

      <Route
        path="/pedidos"
         element={<Pedidos />}
        />
      </Route>

      {/* La dirección principal lleva al inicio de sesión. */}
      <Route
        path="/"
        element={
          <Navigate
            to="/inicio-sesion"
            replace
          />
        }
      />

      {/* Las direcciones desconocidas regresan al acceso. */}
      <Route
        path="*"
        element={
          <Navigate
            to="/inicio-sesion"
            replace
          />
        }
      />
    </Routes>
  )
}

export default App