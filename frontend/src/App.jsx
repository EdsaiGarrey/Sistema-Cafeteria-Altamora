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
import AreaAutorizada from './paginas/AreaAutorizada.jsx'
import Pedidos from './paginas/pedidos/Pedidos.jsx'
import Usuarios from './paginas/usuarios/Usuarios.jsx'
import Categorias from './paginas/categorias/Categorias.jsx'
import Productos from './paginas/productos/Productos.jsx'
import './App.css'

/**
 * Rutas principales del sistema.
 */
export default function App() {
  return (
    <Routes>
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

      <Route element={<RutaProtegida />}>
        <Route element={<DisenoPanel />}>
          <Route
            path="/panel"
            element={<PanelPrincipal />}
          />

          <Route
            path="/acceso-denegado"
            element={<AccesoDenegado />}
          />

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
              path="/area-operativa"
              element={
                <AreaAutorizada
                  etiqueta="Área operativa"
                  titulo="Operación de la cafetería"
                  descripcion="Sección disponible para los tres roles."
                />
              }
            />
          </Route>

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

            <Route
              path="/area-gestion"
              element={
                <AreaAutorizada
                  etiqueta="Área de gestión"
                  titulo="Gestión de Altamora"
                  descripcion="Sección para administradores y gerentes."
                />
              }
            />
          </Route>

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

            <Route
              path="/area-administracion"
              element={
                <AreaAutorizada
                  etiqueta="Área administrativa"
                  titulo="Administración del sistema"
                  descripcion="Sección exclusiva del administrador."
                />
              }
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