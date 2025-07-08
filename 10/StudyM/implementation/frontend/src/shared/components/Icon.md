# Componente Icon

El componente `Icon` es un sistema de iconos SVG reutilizable que reemplaza los emojis en la interfaz de usuario para proporcionar una apariencia más profesional y consistente.

## Uso

```jsx
import Icon from '../../../shared/components/Icon';

// Uso básico
<Icon name="books" />

// Con tamaño personalizado
<Icon name="graduation" size={32} />

// Con color personalizado
<Icon name="star" size={24} color="#ffc107" />

// Con clases CSS adicionales
<Icon name="users" size={20} className="me-2" />
```

## Iconos Disponibles

### Educación
- `graduation` - Gorra de graduación
- `book` - Libro individual
- `books` - Conjunto de libros

### Gamificación
- `gamepad` - Control de videojuegos
- `trophy` - Trofeo
- `star` - Estrella

### Comunidad
- `users` - Múltiples usuarios
- `user` - Usuario individual

### Navegación
- `menu` - Menú hamburguesa

### Otros
- `chart` - Gráfico de líneas
- `target` - Objetivo/diana

## Props

| Prop | Tipo | Valor por defecto | Descripción |
|------|------|-------------------|-------------|
| `name` | string | requerido | Nombre del icono a mostrar |
| `size` | number | 24 | Tamaño del icono en píxeles |
| `color` | string | 'currentColor' | Color del icono (CSS color) |
| `className` | string | '' | Clases CSS adicionales |

## Ejemplos de Uso

### En títulos
```jsx
<h1 className="d-flex align-items-center">
  <Icon name="books" size={32} color="#007bff" className="me-2" />
  Lecciones y Cursos
</h1>
```

### En tarjetas
```jsx
<div className="card-body text-center">
  <Icon name="trophy" size={64} color="#17a2b8" />
  <h3>Logros</h3>
</div>
```

### En navbar
```jsx
<Link className="navbar-brand d-flex align-items-center">
  <Icon name="books" size={24} color="#ffffff" className="me-2" />
  StudyMate
</Link>
```

## Agregar Nuevos Iconos

Para agregar un nuevo icono:

1. Encuentra el SVG del icono (preferiblemente de [Lucide](https://lucide.dev/) o [Heroicons](https://heroicons.com/))
2. Agrega el SVG al objeto `icons` en el componente
3. Usa el formato consistente con `viewBox="0 0 24 24"` y `stroke` para el color

```jsx
newIcon: (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="..."/>
  </svg>
)
```

## Ventajas sobre Emojis

- **Consistencia**: Misma apariencia en todos los sistemas operativos
- **Personalización**: Tamaño y color completamente personalizables
- **Accesibilidad**: Mejor soporte para lectores de pantalla
- **Rendimiento**: Mejor rendimiento que imágenes
- **Escalabilidad**: Perfecta calidad en cualquier tamaño
- **Profesionalidad**: Apariencia más profesional y moderna 