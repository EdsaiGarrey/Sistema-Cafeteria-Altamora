import {
  Navigate,
  Route,
  Routes,
} from 'react-router'
import RutaProtegida from './components/autenticacion/RutaProtegida.jsx'
import RutaPorRol from './components/autenticacion/RutaPorRol.jsx'
import InicioSesion from './paginas/autenticacion/InicioSesion.jsx'
import Registro from './paginas/autenticacion/Registro.jsx'
import RecuperarContrasena from './paginas/autenticacion/RecuperarContrasena.jsx'
import RestablecerContrasena from './paginas/autenticacion/RestablecerContrasena.jsx'
import PanelPrincipal from './paginas/PanelPrincipal.jsx'
import AccesoDenegado from './paginas/AccesoDenegado.jsx'
import AreaAutorizada from './paginas/AreaAutorizada.jsx'
import './App.css'

/**
 * Registra las páginas públicas, protegidas
 * y restringidas por rol del sistema.
 */
function App() {
  return (
    <Routes>
      {/* Rutas públicas de autenticación. */}
      <Route
        path="/inicio-sesion"
        element={<InicioSesion />}
      />

      <Route
        path="/registro"
        element={<Registro />}
      />

      <Route
        path="/recuperar-contrasena"
        element={<RecuperarContrasena />}
      />

      <Route
        path="/restablecer-contrasena"
        element={<RestablecerContrasena />}
      />

      {/*
       * Todas las rutas colocadas dentro de este grupo
       * requieren primero una sesión válida.
       */}
      <Route element={<RutaProtegida />}>
        <Route
          path="/panel"
          element={<PanelPrincipal />}
        />

        <Route
          path="/acceso-denegado"
          element={<AccesoDenegado />}
        />

        {/* Acceso para administrador, gerente y empleado. */}
        <Route
          element={
            <RutaPorRol
              rolesPermitidos={[
                'administrador',
                'gerente',
                'empleado',
              ]}
            />
          }
        >
          <Route
            path="/area-operativa"
            element={
              <AreaAutorizada
                etiqueta="Área operativa"
                titulo="Operación de la cafetería"
                descripcion="Esta sección está disponible para administradores, gerentes y empleados."
              />
            }
          />
        </Route>

        {/* Acceso exclusivo para administrador y gerente. */}
        <Route
          element={
            <RutaPorRol
              rolesPermitidos={[
                'administrador',
                'gerente',
              ]}
            />
          }
        >
          <Route
            path="/area-gestion"
            element={
              <AreaAutorizada
                etiqueta="Área de gestión"
                titulo="Gestión de Altamora"
                descripcion="Esta sección solamente está disponible para administradores y gerentes."
              />
            }
          />
        </Route>

        {/* Acceso exclusivo para administrador. */}
        <Route
          element={
            <RutaPorRol
              rolesPermitidos={[
                'administrador',
              ]}
            />
          }
        >
          <Route
            path="/area-administracion"
            element={
              <AreaAutorizada
                etiqueta="Área administrativa"
                titulo="Administración del sistema"
                descripcion="Esta sección está reservada exclusivamente para usuarios administradores."
              />
            }
          />
        </Route>
      </Route>

      {/* Redirección de la dirección principal. */}
      <Route
        path="/"
        element={
          <Navigate
            to="/inicio-sesion"
            replace
          />
        }
      />

      {/* Cualquier dirección desconocida regresa al acceso. */}
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