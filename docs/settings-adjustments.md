Aparatado de Ajustes de Gasotrip
- Objetivo: permitir configurar la app, perfiles de usuario y gestión de viajes.
- Ámbito:
  - Ajustes globales (Idioma, Tema, Unidades, Formato monetario)
  - Perfil de usuario con edición y guardado de viajes
  - Edición de viajes calculados desde el historial
  - Datos de precios de combustible actuales al seleccionar un tipo
- Componentes/Servicios nuevos:
  - AppSettingsService: guarda preferencias de usuario en localStorage
  - SettingsModule + SettingsPage: UI de ajustes
  - UserService: perfil de usuario y viajes guardados
  - FuelPriceService: precio actual de combustibles (en mapa local, con fallback a API en futuro)
- Flujo de cambios recomendado:
  1) Configurar HashLocationStrategy para rutas en LAN (ya aplicado)
  2) Probar menos de 1 minuto: ajustar idioma, tema y unidades
  3) Calcular viajes, guardar en perfil y editar viajes en historial
  4) Probar plugins de precio de combustible al cambiar tipo de combustible
