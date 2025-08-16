# QR Generator Offline

Generador de códigos QR offline que funciona como Progressive Web App (PWA). Crea QR para URLs, contactos, WiFi, pagos y más sin necesidad de conexión a internet.

## 🚀 Características

### Tipos de QR Soportados
- **URLs**: Enlaces a páginas web
- **Texto**: Texto libre personalizado
- **Email**: Direcciones de correo con asunto y cuerpo
- **WiFi**: Configuración de redes WiFi (WPA/WPA2/WEP)
- **Contactos**: Información de contacto (vCard)
- **Bitcoin**: Direcciones de wallet Bitcoin
- **PayPal**: Enlaces de pago PayPal
- **Ubicación**: Coordenadas GPS
- **Eventos**: Eventos de calendario
- **Redes Sociales**: Instagram, Facebook, YouTube, etc.

### Funcionalidades PWA
- ✅ **Funciona offline** - Sin necesidad de internet
- ✅ **Instalable** - Se puede instalar como app nativa
- ✅ **Responsive** - Diseño adaptativo para móviles
- ✅ **Tema oscuro/claro** - Interfaz personalizable
- ✅ **Historial** - Guarda QR generados
- ✅ **Descarga** - Guarda QR en diferentes formatos
- ✅ **Compartir** - Comparte QR directamente
- ✅ **Personalización** - Colores, tamaño, corrección de errores

### Tecnologías
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **PWA**: Service Worker, Manifest, Cache API
- **Librerías**: QRCode.js, FileSaver.js
- **Hosting**: GitHub Pages (estático)

## 📱 Instalación

### Opción 1: Usar Online
1. Ve a [https://tu-usuario.github.io/qr-generator](https://tu-usuario.github.io/qr-generator)
2. Haz clic en "Instalar" cuando aparezca el prompt
3. ¡Listo! La app se instalará en tu dispositivo

### Opción 2: Desarrollo Local
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/qr-generator.git
cd qr-generator

# Servir archivos localmente (necesario para PWA)
python -m http.server 8000
# o
npx serve .

# Abrir en navegador
open http://localhost:8000
```

## 🎯 Uso

### Generar un QR Básico
1. Selecciona el tipo de QR (URL, texto, WiFi, etc.)
2. Completa los campos requeridos
3. Personaliza el diseño (opcional)
4. Haz clic en "Generar QR"
5. Descarga o comparte el QR

### Personalización Avanzada
- **Tamaño**: 128x128 hasta 1024x1024 píxeles
- **Corrección de errores**: L (7%), M (15%), Q (25%), H (30%)
- **Colores**: Personaliza colores de frente y fondo
- **Margen**: Ajusta el espacio alrededor del QR
- **Logo**: Añade un logo central (opcional)

### Funciones Offline
- ✅ Generar QR sin internet
- ✅ Ver historial de QR generados
- ✅ Personalizar diseño
- ✅ Descargar QR guardados

## 💰 Monetización

### Cuba (Mercado Local)
- **Donaciones MLC**: Integración con tiendas en línea cubanas
- **Servicios premium**: QR personalizados con logo

### Mercado Internacional
- **Google AdSense**: Publicidad contextual
- **Donaciones Bitcoin**: Lightning Network para transacciones rápidas

## 📊 Marketing Digital

### Estrategia de Contenido
1. **Facebook/Instagram**: Videos cortos mostrando casos de uso
2. **Twitter**: Hilos educativos sobre QR
3. **LinkedIn**: Contenido profesional sobre digitalización
4. **TikTok**: Retos virales y contenido rápido
5. **YouTube**: Tutoriales completos

### Contenido Sugerido
- "5 usos creativos para QR que no conocías"
- "Cómo los QR están ayudando a negocios cubanos"
- "Genera tu QR en 10 segundos"
- "Cómo crear códigos QR sin internet"

## 🛠️ Desarrollo

### Estructura del Proyecto
```
qr-generator/
├── index.html          # Página principal
├── manifest.json       # Configuración PWA
├── sw.js              # Service Worker
├── css/
│   └── style.css      # Estilos
├── js/
│   ├── app.js         # Lógica principal
│   ├── qr-types.js    # Tipos de QR
│   └── pwa.js         # Funcionalidades PWA
└── assets/
    └── icons/         # Iconos PWA
```

### Agregar Nuevos Tipos de QR
1. Edita `js/qr-types.js`
2. Añade el nuevo tipo al objeto `QR_TYPES`
3. Define campos, validación y función de generación
4. Actualiza las categorías si es necesario

### Personalizar Estilos
- Edita `css/style.css`
- Usa variables CSS para colores y espaciado
- Soporte para tema oscuro/claro incluido

## 📈 Métricas de Éxito

- **Tiempo de carga**: < 3 segundos
- **Puntuación Lighthouse**: > 90
- **Compatibilidad**: 95% de navegadores
- **Tamaño**: < 500KB total

## 🔧 Configuración

### Variables de Entorno
```javascript
// En js/app.js
const CONFIG = {
    APP_NAME: 'QR Generator',
    VERSION: '1.0.0',
    DONATION_ADDRESS: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ANALYTICS_ID: 'GA_TRACKING_ID'
};
```

### Personalización de Colores
```css
/* En css/style.css */
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --accent-color: #f59e0b;
    /* ... más variables */
}
```

## 🚀 Despliegue

### GitHub Pages
1. Sube el código a GitHub
2. Ve a Settings > Pages
3. Selecciona la rama main
4. La app estará disponible en `https://tu-usuario.github.io/qr-generator`

### Netlify
1. Conecta tu repositorio a Netlify
2. Configura el directorio de build como `/`
3. Despliega automáticamente

### Vercel
1. Importa el proyecto en Vercel
2. Configura como proyecto estático
3. Despliega con un clic

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Opera 57+

### Dispositivos
- ✅ Android 5.0+
- ✅ iOS 12+
- ✅ Windows 10+
- ✅ macOS 10.14+
- ✅ Linux (Chrome/Firefox)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [QRCode.js](https://github.com/davidshimjs/qrcodejs) - Librería de generación QR
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) - Descarga de archivos
- [MDN Web Docs](https://developer.mozilla.org/) - Documentación PWA
- Comunidad de desarrolladores cubanos

## 📞 Contacto

- **Email**: contacto@qr-generator.com
- **Twitter**: [@qrgenerator](https://twitter.com/qrgenerator)
- **GitHub**: [qr-generator](https://github.com/qr-generator)

---

**Hecho con ❤️ para Cuba y el mundo**
