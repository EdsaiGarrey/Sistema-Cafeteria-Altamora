import {
  Col,
  Container,
  Image,
  Row,
} from 'react-bootstrap'
import imagenCafe from '../../assets/altamora/cafe-login.jpg'
import logoAltamora from '../../assets/altamora/logo-altamora.png'
import '../../estilos/autenticacion-altamora.css'

/**
 * Estructura visual compartida por las páginas
 * de inicio de sesión, registro y recuperación.
 */
export default function DisenoAutenticacion({
  children,
  titulo = 'Acceso al sistema',
  descripcion = 'Ingresa tus datos para continuar.',
}) {
  return (
    <main className="altamora-auth">
      <Container fluid className="p-0">
        <Row className="g-0 min-vh-100">
          <Col
            lg={7}
            className="altamora-auth-imagen-contenedor"
          >
            <Image
              src={imagenCafe}
              alt="Taza de café de Altamora"
              className="altamora-auth-imagen"
            />

            <div className="altamora-auth-sombra" />

            <div className="altamora-auth-nombre-sistema">
              Sistema de Gestión Altamora
            </div>
          </Col>

          <Col
            xs={12}
            lg={5}
            className="altamora-auth-panel"
          >
            <section className="altamora-auth-contenido">
              <header className="text-center mb-4">
                <Image
                  src={logoAltamora}
                  alt="Logo de Café Altamora"
                  className="altamora-auth-logo"
                />

                <h1 className="altamora-auth-titulo">
                  {titulo}
                </h1>

                <p className="altamora-auth-descripcion">
                  {descripcion}
                </p>
              </header>

              {children}

              <footer className="altamora-auth-pie">
                Acceso seguro y protegido
              </footer>
            </section>
          </Col>
        </Row>
      </Container>
    </main>
  )
}