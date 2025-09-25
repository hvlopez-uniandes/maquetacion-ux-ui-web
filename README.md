# Pomodoro App

Una aplicación de gestión de tiempo Pomodoro construida con Angular y Angular Material.

## Características

- **Autenticación de usuarios**: Login y registro con validación de formularios
- **Gestión de alarmas Pomodoro**: Crear, editar y eliminar alarmas personalizadas
- **Seguimiento de logros**: Ver historial de sesiones completadas
- **Base de datos local**: Almacenamiento usando IndexedDB (SQLite-like)
- **Diseño responsivo**: Interfaz moderna con Angular Material

## Tecnologías utilizadas

- Angular 20
- Angular Material
- TypeScript
- SCSS
- IndexedDB (para almacenamiento local)

## Estructura del proyecto

```
src/app/
├── components/
│   ├── login/           # Componente de inicio de sesión
│   ├── register/        # Componente de registro
│   ├── main-layout/     # Layout principal con sidebar
│   ├── dashboard/       # Panel principal
│   ├── alarms/          # Gestión de alarmas Pomodoro
│   └── achievements/    # Logros y sesiones completadas
├── services/
│   ├── auth.service.ts      # Servicio de autenticación
│   └── database.service.ts  # Servicio de base de datos
└── app.routes.ts        # Configuración de rutas
```

## Instalación y ejecución

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar la aplicación:
```bash
npm start
```

3. Abrir en el navegador: `http://localhost:4200`

## Credenciales de prueba

- **Email**: demo@example.com
- **Contraseña**: password123

## Funcionalidades implementadas

### ✅ Completadas
- [x] Sistema de autenticación (login/registro)
- [x] Layout principal con navegación lateral
- [x] Página de gestión de alarmas
- [x] Página de logros/achievements
- [x] Base de datos local con IndexedDB
- [x] Diseño responsivo
- [x] Validación de formularios

### 🚧 En desarrollo
- [ ] Modal de creación/edición de alarmas
- [ ] Timer Pomodoro funcional
- [ ] Modal de historial de alarmas
- [ ] Notificaciones de tiempo

## Diseño

La aplicación sigue el diseño mostrado en las imágenes proporcionadas:
- Sidebar oscuro con navegación
- Contenido principal con bordes azules
- Formularios con validación
- Botones de acción con colores distintivos
- Modales para operaciones específicas

## Base de datos

La aplicación utiliza IndexedDB para almacenamiento local, simulando una base de datos SQLite. Los datos se almacenan en el navegador y persisten entre sesiones.

### Estructura de datos:
- **Users**: Información de usuarios
- **PomodoroAlarm**: Configuración de alarmas
- **PomodoroSession**: Sesiones completadas

## Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza los cambios
4. Envía un pull request

## Licencia

Este proyecto está bajo la Licencia MIT.
# maquetacion-ux-ui-web
