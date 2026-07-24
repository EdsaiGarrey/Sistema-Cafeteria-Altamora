import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // Guarda la información recibida desde la API de Laravel.
  const [datosApi, setDatosApi] = useState(null);

  // Indica si React todavía está esperando la respuesta del backend.
  const [cargando, setCargando] = useState(true);

  // Guarda un mensaje cuando ocurre un error de conexión.
  const [error, setError] = useState("");

  useEffect(() => {
    // Consumimos el endpoint de prueba creado en Laravel.
    fetch("http://127.0.0.1:8000/api/estado")
      .then((respuesta) => {
        // Validamos que Laravel responda correctamente.
        if (!respuesta.ok) {
          throw new Error("La API respondió con un error.");
        }

        return respuesta.json();
      })
      .then((datos) => {
        // Guardamos la respuesta JSON enviada por Laravel.
        setDatosApi(datos);
      })
      .catch((errorConexion) => {
        // Mostramos un mensaje claro si React no puede comunicarse con Laravel.
        setError(errorConexion.message);
      })
      .finally(() => {
        // La petición terminó, haya sido exitosa o no.
        setCargando(false);
      });
  }, []);

  return (
    <main className="contenedor">
      <section className="tarjeta">
        <span className="etiqueta">Altamora Café</span>

        <h1>Conexión React + Laravel</h1>

        <p className="descripcion">
          Prueba inicial de comunicación entre el frontend y la API REST.
        </p>

        {cargando && (
          <div className="mensaje cargando">
            Conectando con la API de Laravel...
          </div>
        )}

        {error && (
          <div className="mensaje error">
            No fue posible conectar con Laravel: {error}
          </div>
        )}

        {datosApi && (
          <div className="mensaje correcto">
            <strong>{datosApi.mensaje}</strong>

            <span>Aplicación: {datosApi.aplicacion}</span>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;