# Sistema de Ventas FullStack

Este proyecto es un sistema de ventas desarrollado con Node.js/Express para el backend y React para el frontend. Incluye funcionalidades para la gestión de usuarios (vendedores, administradores), productos, y ventas, además de un panel de administración con estadísticas.

## Características Principales

*   **Backend (Node.js/Express):**
    *   API RESTful para autenticación, usuarios, productos, ventas y dashboard.
    *   Modelos MongoDB (Mongoose): Usuario, Producto, Venta.
    *   Autenticación basada en JWT (con cookies HttpOnly).
    *   Roles de usuario (admin, vendedor, cliente).
    *   Cálculo automático de total en ventas y actualización de stock.
    *   Endpoint de dashboard para administradores con datos agregados.
*   **Frontend (React):**
    *   Interfaz para registro de usuarios y login.
    *   Formulario de registro de vendedor para administradores, con:
        *   Obtención de ubicación actual del navegador (`navigator.geolocation`).
        *   Selección de ubicación en un mapa interactivo (Leaflet).
        *   Carga de imágenes (convertidas a base64).
    *   Panel para registrar ventas, con:
        *   Selector de productos y cantidades.
        *   Cálculo de total en tiempo real.
    *   Dashboard para administradores con visualización de estadísticas.
    *   Rutas protegidas según rol de usuario.
    *   Manejo de estado de autenticación global con Context API.
*   **Base de Datos:** MongoDB.
*   **Almacenamiento de Imágenes:** Strings Base64 almacenados en MongoDB como parte de los documentos de Usuario (vendedor) y Producto (opcional).

## Requisitos Previos

*   Node.js (v16 o superior recomendado)
*   npm (o yarn)
*   MongoDB (local o una instancia en la nube como MongoDB Atlas)

## Configuración del Backend

1.  **Clonar el repositorio (si aplica) o tener los archivos del proyecto.**
2.  **Navegar a la carpeta `backend`:**
    ```bash
    cd backend
    ```
3.  **Instalar dependencias:**
    ```bash
    npm install
    ```
4.  **Crear un archivo `.env` en la raíz de la carpeta `backend`**.
    Copiar el contenido de un archivo `.env.example` (si existiera) o crear uno nuevo con las siguientes variables:
    ```env
    MONGO_URI="mongodb://localhost:27017/sistema_ventas_dev" # Cambiar por tu URI de MongoDB
    JWT_SECRET="tu_secreto_jwt_muy_seguro_debe_ser_largo_y_aleatorio" # Cambiar por un secreto fuerte
    NODE_ENV="development"
    PORT="5000" # Puerto para el servidor backend

    # Opcional: para crear un admin inicial (ver notas en código o implementar script de seed)
    # ADMIN_EMAIL="admin@example.com"
    # ADMIN_PASSWORD="passwordseguro"
    ```
    Asegúrate de reemplazar `MONGO_URI` y `JWT_SECRET` con tus propios valores.

5.  **Iniciar el servidor backend:**
    ```bash
    npm start
    ```
    El servidor debería estar corriendo en `http://localhost:5000` (o el puerto que hayas configurado).

## Configuración del Frontend

1.  **Navegar a la carpeta `frontend`:**
    ```bash
    cd frontend
    ```
    (Si estás en la carpeta `backend`, primero haz `cd ..`)

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Iniciar el servidor de desarrollo de React:**
    ```bash
    npm start
    ```
    La aplicación React debería abrirse automáticamente en tu navegador en `http://localhost:3000`.

## Uso

Una vez ambos servidores (backend y frontend) estén corriendo:

1.  **Registro de Usuario Admin (Inicial):**
    *   El sistema actualmente no tiene un flujo de creación de admin vía UI pública por seguridad.
    *   **Opción 1 (Manual en BD):** Registra un usuario normal a través de la UI (`/register`) y luego modifica su documento en MongoDB directamente para asignarle `rol: "admin"` e `isAdmin: true`.
    *   **Opción 2 (Modificación de Código Temporal):** Podrías modificar temporalmente la ruta `POST /api/auth/register` en `authController.js` para que el primer usuario registrado obtenga rol de admin, o crear un script de "seed" que se ejecute una vez.
2.  **Acceder a la aplicación:** Abre `http://localhost:3000` en tu navegador.
3.  **Funcionalidades:**
    *   **Usuarios Generales:** Pueden registrarse y loguearse (serán 'clientes').
    *   **Administrador:**
        *   Acceder al Dashboard (`/dashboard`).
        *   Registrar nuevos vendedores (`/registrar-vendedor`).
    *   **Vendedor:**
        *   Acceder al Panel de Ventas (`/panel-ventas`) para registrar nuevas transacciones.

## Estructura del Proyecto (Simplificada)

```
/
├── backend/
│   ├── config/       # Conexión DB, etc.
│   ├── controllers/  # Lógica de endpoints
│   ├── middleware/   # Middlewares (auth, error handling)
│   ├── models/       # Esquemas Mongoose
│   ├── routes/       # Definición de rutas Express
│   ├── .env          # Variables de entorno (local)
│   └── server.js     # Punto de entrada del backend
├── frontend/
│   ├── public/       # Archivos estáticos
│   ├── src/
│   │   ├── components/ # Componentes reutilizables (layout, common, auth, vendedores, etc.)
│   │   ├── context/    # React Context (ej. AuthContext)
│   │   ├── pages/      # Componentes que representan páginas completas
│   │   ├── services/   # Lógica de API (ej. instancia de Axios)
│   │   ├── App.js      # Componente raíz con el router
│   │   └── index.js    # Punto de entrada del frontend
│   └── package.json
└── README.md         # Este archivo
```

## Próximos Pasos / Mejoras Potenciales

*   Implementar un script de "seed" para crear un usuario administrador inicial.
*   Añadir gestión de productos completa desde la UI para vendedores/admins.
*   Mejorar la UI/UX general.
*   Paginación, filtros y búsqueda más avanzados en listas.
*   Notificaciones en tiempo real.
*   Funcionalidad de "Olvidé mi contraseña".
*   Edición de perfiles de usuario/vendedor.
*   Pruebas unitarias y de integración.
*   Despliegue a un entorno de producción.
```
