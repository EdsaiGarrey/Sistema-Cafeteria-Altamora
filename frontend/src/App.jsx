import {
  Navigate,
  Route,
  Routes,
} from 'react-router'
import RutaProtegida from './components/autenticacion/RutaProtegida.jsx'
import RutaPorRol from './components/autenticacion/RutaPorRol.jsx'
import DisenoPanel from './components/panel/DisenoPanel.jsx'
import InicioSesion from './paginas/autenticacion/InicioSesion.jsx'
import Registro from './paginas/autenticacion/Registro.jsx'
import RecuperarContrasena from './paginas/autenticacion/RecuperarContrasena.jsx'
import RestablecerContrasena from './paginas/autenticacion/RestablecerContrasena.jsx'
import PanelPrincipal from './paginas/PanelPrincipal.jsx'
import AccesoDenegado from './paginas/AccesoDenegado.jsx'
import Pedidos from './paginas/pedidos/Pedidos.jsx'
import Caja from './paginas/caja/Caja.jsx'
import Pagos from './paginas/pagos/Pagos.jsx'
import HistorialVentas from './paginas/ventas/HistorialVentas.jsx'
import Usuarios from './paginas/usuarios/Usuarios.jsx'
import Categorias from './paginas/categorias/Categorias.jsx'
import Productos from './paginas/productos/Productos.jsx'
import CorreoPendiente from './paginas/autenticacion/CorreoPendiente.jsx'
import CorreoVerificado from './paginas/autenticacion/CorreoVerificado.jsx'

/**
 * Rutas públicas y protegidas del sistema.
 */
export default function App() {
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
      <Route
        path="/correo-verificado"
        element={<CorreoVerificado />}
      />

      {/* Todas las rutas interiores requieren sesión. */}
      <Route element={<RutaProtegida />}>
              <Route
          path="/correo-pendiente"
          element={<CorreoPendiente />}
        />
        <Route element={<DisenoPanel />}>
          <Route
            path="/panel"
            element={<PanelPrincipal />}
          />

          <Route
            path="/acceso-denegado"
            element={<AccesoDenegado />}
          />

          {/* Disponible para todos los roles. */}
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
              path="/pedidos"
              element={<Pedidos />}
            />
            <Route
              path="/caja"
              element={<Caja />}
            />
            <Route
              path="/historial-ventas"
              element={<HistorialVentas />}
            />
          </Route>
          
          <Route
            path="/pagos"
            element={<Pagos />}
          />

          {/* Disponible para administrador y gerente. */}
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
              path="/categorias"
              element={<Categorias />}
            />

            <Route
              path="/productos"
              element={<Productos />}
            />
          </Route>

          {/* Disponible únicamente para administrador. */}
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
              path="/usuarios"
              element={<Usuarios />}
            />
          </Route>
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to="/inicio-sesion"
            replace
          />
        }
      />

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