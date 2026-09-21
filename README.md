# DocGuía — Módulo de Disponibilidad y Reserva de Citas

Módulo ágil y optimizado para móviles diseñado para que pacientes y profesionales médicos puedan consultar disponibilidad horaria en bloques de 20 minutos y agendar citas médicas al instante, con protección nativa contra reservas duplicadas simultáneas.

---

## 🚀 Decisiones Técnicas y Arquitectura

1. **Next.js (App Router) + TypeScript**:
   - Arquitectura basada en Route Handlers (`/api/doctors`, `/api/slots`, `/api/bookings`) y componentes cliente interactivos para una navegación fluida en móviles.
2. **Lógica de Slots Aislada y Pura (`src/lib/slots.ts`)**:
   - El cálculo de slots de 20 minutos y el descuento de citas existentes está desacoplado de la base de datos en una función pura. Esto permite pruebas unitarias inmediatas (Vitest), determinismo y portabilidad.
3. **Manejo de Condiciones de Carrera (Race Conditions)**:
   - A nivel de base de datos se estableció una restricción única compuesta: `@@unique([doctorId, startTime])`.
   - Si dos usuarios intentan reservar el mismo slot simultáneamente, la base de datos rechaza la segunda inserción mediante una violación de restricción (`P2002`). La API intercepta este error y responde con `HTTP 409 Conflict`.
4. **Prisma + PostgreSQL (Supabase)**:
   - Modelado relacional limpio: `Doctor`, `Availability` (bloques semanales por día) y `Appointment` (citas confirmadas con timestamp UTC).
   - Soporte para Transaction Pooler y Direct Connection para despliegue sin problemas de conexiones en serverless/Vercel.

---

## 📱 Decisiones de UI/UX (Mobile-First)

El diseño está centrado en el uso desde teléfonos móviles:

- **Touch Targets Ergonómicos**: Botones de slots de al menos 48px de alto, agrupados en **Mañana** y **Tarde** para reducir la fatiga visual.
- **Grid de Médicos Responsivo**: Visualización en 3 columnas simétricas en escritorio y filas de ancho completo en móvil, evitando cualquier corte visual de las tarjetas.
- **Selector Rápido de Días**: Chips táctiles ("Hoy", "Mañana", etc.) más selector de calendario nativo (`<input type="date">`) para evitar dependencias innecesarias.
- **Estados Vacíos con Contexto**:
  - Si el médico no atiende un día (ej. domingo), explica amablemente que no atiende ese día y qué días sí tiene consulta.
  - Si todos los cupos fueron tomados, indica claramente "Cupos agotados para este día".
- **Estados de Carga y Error**: Skeletons visuales con pulsación durante las consultas y botón de reintento ante errores de red.
- **Manejo del Conflicto de Reserva**: Si un slot es ganado por otro paciente mientras se llenaba el formulario, el modal no falla en silencio: muestra una alerta explicativa, actualiza la disponibilidad de fondo y permite elegir otro horario sin perder el contexto.
- **Confirmación Visual Animada (SweetAlert)**: Modal de éxito emergente en color púrpura oficial de DocGuía con trazado animado de SVG checkmark, resumen completo de la cita y código identificador.

---

## 🧪 Pruebas Unitarias

Se implementaron pruebas unitarias con **Vitest** en [`tests/slots.test.ts`](tests/slots.test.ts):
1. Generación de slots de 20 minutos respetando múltiples bloques en el mismo día (ej. 08:00 a 12:00 y 14:00 a 17:00).
2. Descuento exacto de citas previas (marcando slots como ocupados).
3. Respuesta ante días sin atención médica programada.

Ejecutar tests:
```bash
npm test
```

---

## ⏱️ Qué se dejó fuera por tiempo (Próximos Pasos)

- **WebSockets / Supabase Realtime**: Para que los slots reservados por otros usuarios se deshabiliten en vivo en la pantalla de los demás sin requerir refresco manual.
- **Gestión de Excepciones y Feriados**: Bloqueos de fechas específicas (vacaciones o licencias médicas) que sobreescriban la regla recurrente semanal.
- **Notificaciones Transaccionales**: Envío de confirmación y recordatorio por correo electrónico (Resend) o WhatsApp (Twilio).
- **Cancelación / Reprogramación**: Flujo para que el paciente o médico cancele la cita mediante un enlace seguro con token.

---

## 🛠️ Puesta en Marcha Local

### 1. Variables de entorno
Crea un archivo `.env` basado en `.env.example` con la URL de tu base de datos Supabase:
```env
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### 2. Migración y Seed
```bash
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

### 3. Ejecución
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000).
