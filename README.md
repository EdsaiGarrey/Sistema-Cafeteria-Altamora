# Altamora Café – Sistema Integral de Gestión
## CAFE ALTAMORA

## Descripción del proyecto

Altamora Café es un sistema web diseñado para apoyar la gestión operativa y administrativa de una cafetería. La aplicación permitirá administrar usuarios, productos, inventario, pedidos, ventas, pagos y movimientos de caja desde una misma plataforma.

## Problemática que resuelve

En muchas cafeterías pequeñas, el registro de pedidos, ventas, pagos e inventarios todavía se realiza de manera manual. Esta forma de trabajo puede provocar errores en los cobros, pérdida de información, retrasos durante la atención a los clientes, falta de control sobre las existencias y dificultad para consultar las ventas realizadas.

Altamora Café busca solucionar esta problemática mediante un sistema web que permita automatizar el registro de pedidos, ventas y pagos, controlar el inventario, generar tickets, administrar los movimientos de caja y consultar información histórica del negocio.

El sistema también contará con autenticación y permisos según el rol de cada usuario, con la finalidad de proteger la información y limitar el acceso a determinadas funciones.

## Objetivo

Desarrollar una aplicación web organizada, segura y fácil de utilizar que permita mejorar la administración de la cafetería, reducir errores durante el registro de ventas y mantener un mejor control de los productos, inventario, pagos y movimientos de caja.

## Integrantes

- Edsai Alejandro García Reyes
- Uriel Eduardo Guzmán Ramírez

## Módulos principales

### 1. Usuarios y roles

Permitirá registrar usuarios, iniciar sesión y controlar los permisos disponibles según el rol asignado.

### 2. Categorías y productos

Permitirá registrar, consultar, actualizar y eliminar categorías y productos de la cafetería, incluyendo bebidas, alimentos y otros artículos disponibles.

### 3. Inventario e insumos

Permitirá consultar existencias, registrar entradas de productos o insumos, actualizar el stock y mostrar alertas cuando algún producto tenga pocas existencias.

### 4. Pedidos y ventas

Permitirá seleccionar productos, registrar cantidades, calcular automáticamente el total, confirmar la venta y generar un número de orden o ticket.

### 5. Pagos y caja

Permitirá registrar pagos en efectivo o mediante medios electrónicos autorizados. También incluirá la apertura de caja, el corte de caja y la consulta de movimientos realizados durante la jornada.

### 6. Historial y reportes

Permitirá consultar ventas por fecha, número de orden, productos vendidos y monto total, además de generar reportes administrativos.

## DIAGRAMA ENTIDAD RELACION
<img width="1448" height="1086" alt="ChatGPT Image 29 jul 2026, 04_34_40 a m" src="https://github.com/user-attachments/assets/9b72febc-790e-46c4-8124-6e2e5fabcce0" />


## Roles del sistema

El sistema contará con tres roles principales:

### Administrador

Tendrá acceso completo a todos los módulos del sistema.

Podrá:

- Administrar usuarios.
- Asignar roles.
- Gestionar categorías y productos.
- Controlar completamente el inventario.
- Registrar y consultar pedidos.
- Consultar pagos y ventas.
- Revisar el historial de ventas.
- Consultar reportes administrativos.
- Supervisar los movimientos de caja.
- Acceder al dashboard principal.
- Modificar las configuraciones generales del sistema.

### Gerente

Será responsable de supervisar las operaciones principales de la cafetería.

Podrá:

- Consultar productos e inventario.
- Registrar entradas de productos o insumos.
- Consultar el historial de ventas.
- Realizar la apertura de caja.
- Realizar el corte de caja.
- Consultar los movimientos realizados durante la jornada.
- Autorizar y registrar la cancelación de tickets.
- Consultar reportes de ventas.
- Supervisar las actividades realizadas por los empleados.

El gerente no podrá eliminar administradores ni modificar las configuraciones principales del sistema.

### Empleado

Será el encargado de atender a los clientes y registrar las operaciones realizadas en el mostrador.

Podrá:

- Iniciar y cerrar sesión.
- Consultar los productos disponibles.
- Registrar pedidos.
- Seleccionar productos.
- Registrar cantidades.
- Calcular automáticamente el total.
- Registrar pagos en efectivo o electrónicos.
- Confirmar ventas.
- Generar tickets o comprobantes.
- Consultar pedidos registrados.
- Actualizar automáticamente el inventario al completar una venta.

El empleado no tendrá acceso a la administración de usuarios, asignación de roles, reportes administrativos ni configuraciones generales.

## Funcionalidades principales

- Inicio y cierre de sesión.
- Control de acceso por roles.
- Administración de usuarios.
- Administración de categorías.
- Administración de productos.
- Control de inventario.
- Registro de entradas de productos o insumos.
- Alertas de stock bajo.
- Registro de pedidos.
- Cálculo automático del total.
- Registro de ventas.
- Registro de pagos.
- Generación de tickets.
- Apertura de caja.
- Corte de caja.
- Cancelación de tickets con autorización.
- Consulta del historial de ventas.
- Generación de reportes.
- Dashboard administrativo.

## Tecnologías previstas

- PHP
- Laravel
- JavaScript
- Vite
- Tailwind CSS
- Alpine.js
- Base de datos relacional (My sql)
- GitHub
- GitHub Projects

## Repositorio de GitHub
https://github.com/EdsaiGarrey/sistema-cafeteria-altamora

## Tablero de GitHub Projects
https://github.com/EdsaiGarrey/Sistema-Cafeteria-Altamora/projects

## LINK DE FIGMA 
https://www.figma.com/proto/CcHQIZrLQC9spDhtGHuYSO/cafe-altamora-login?node-id=7-6&p=f&t=3R48zDdMWzb5XXDZ-0&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=7%3A6&show-proto-sidebar=1

## Sistema Altamora:
http://82.25.93.110:8081

## API REST:
http://82.25.93.110:8082/api

## Prueba de funcionamiento:
http://82.25.93.110:8082/api/estado



## Estado del proyecto

Proyecto en fase de planificación, organización de actividades y diseño inicial.
