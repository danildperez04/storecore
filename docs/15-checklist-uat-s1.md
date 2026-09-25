# Checklist UAT — Sprint 1 — StoreCore

**Versión:** 1.0.0
**Fecha:** 25 de septiembre de 2026
**Autor:** Equipo StoreCore

Validación con el usuario final (dueño de la pulquería) de los entregados del
Sprint 1: **catálogo maestro**.

---

## 1. Datos de la Ejecución

| Campo              | Valor                                               |
| ------------------ | --------------------------------------------------- |
| Sprint             | Sprint 1 — Catálogo maestro                         |
| Versión validada   | `v0.2.0`                                            |
| Fecha de ejecución | _______________________                             |
| Validador          | Dueño de la pulquería                               |
| Acompañante        | Equipo de desarrollo                                |
| Ambiente           | _________________________________                   |
| Resultado general  | ☐ Aprobado ☐ Aprobado con observaciones ☐ Rechazado |

---

## 2. Criterio de Aprobación

El Sprint 1 se aprueba cuando:

- [ ] Todos los casos **críticos** (marcados 🔴) están aprobados.
- [ ] Ningún defecto de severidad **Crítica** o **Alta** está abierto.
- [ ] El dueño logra cargar su inventario real sin asistencia técnica.
- [ ] Al menos el 90 % de los casos de severidad **Media** están aprobados.

---

## 3. Preparación

| #   | Paso                                                       | Resultado |
| --- | ---------------------------------------------------------- | --------- |
| 1   | El sistema está desplegado y accesible                     | ☐ Sí ☐ No |
| 2   | Se tiene la lista real de productos de la tienda a la mano | ☐ Sí ☐ No |
| 3   | El administrador tiene sus credenciales                    | ☐ Sí ☐ No |
| 4   | El navegador está actualizado                              | ☐ Sí ☐ No |
| 5   | Se cuenta con una conexión estable                         | ☐ Sí ☐ No |

---

## 4. Casos de Prueba

### 4.1 Autenticación (transversal)

| #   | Caso                    | Pasos                               | Esperado                                 | Severidad  | Resultado | Notas |
| --- | ----------------------- | ----------------------------------- | ---------------------------------------- | ---------- | --------- | ----- |
| 1.1 | Inicio de sesión válido | Ingresar con credenciales correctas | Entra al sistema                         | 🔴 Crítica | ☐ P ☐ F   |       |
| 1.2 | Contraseña incorrecta   | Ingresar con contraseña incorrecta  | Mensaje claro, no entra                  | 🔴 Crítica | ☐ P ☐ F   |       |
| 1.3 | Usuario inexistente     | Ingresar con un usuario inventado   | Mensaje genérico (no revela si existe)   | 🟡 Media   | ☐ P ☐ F   |       |
| 1.4 | Campos vacíos           | Pulsar entrar sin escribir nada     | Valida que están completos               | 🟢 Baja    | ☐ P ☐ F   |       |
| 1.5 | Sesión expirada         | Dejar pasar el tiempo de expiración | Redirige a login con aviso               | 🟡 Media   | ☐ P ☐ F   |       |
| 1.6 | Cierre de sesión        | Pulsar "Salir"                      | Vuelve a la pantalla de inicio de sesión | 🟡 Media   | ☐ P ☐ F   |       |

### 4.2 Permisos por rol (transversal)

| #   | Caso                          | Pasos                                          | Esperado                           | Severidad  | Resultado | Notas |
| --- | ----------------------------- | ---------------------------------------------- | ---------------------------------- | ---------- | --------- | ----- |
| 2.1 | Cajero no entra al catálogo   | Entrar como cajero, intentar crear un producto | Rechazado, mensaje de sin permiso  | 🔴 Crítica | ☐ P ☐ F   |       |
| 2.2 | Cajero sí ve productos        | Entrar como cajero, abrir el catálogo          | Ve la lista, sin botones de editar | 🟡 Media   | ☐ P ☐ F   |       |
| 2.3 | Cajero no ve reportes         | Entrar como cajero, intentar reportes          | Rechazado                          | 🟡 Media   | ☐ P ☐ F   |       |
| 2.4 | Cajero no ve otras sucursales | Entrar como cajero de la sucursal A            | Solo ve datos de la A              | 🟡 Media   | ☐ P ☐ F   |       |
| 2.5 | Admin ve todo                 | Entrar como administrador                      | Acceso completo                    | 🟢 Baja    | ☐ P ☐ F   |       |

### 4.3 Sucursales

| #   | Caso                | Pasos                                         | Esperado                                            | Severidad | Resultado | Notas |
| --- | ------------------- | --------------------------------------------- | --------------------------------------------------- | --------- | --------- | ----- |
| 3.1 | Crear sucursal      | Nueva sucursal con código, nombre y dirección | Se guarda y aparece en la lista                     | 🟡 Media  | ☐ P ☐ F   |       |
| 3.2 | Código duplicado    | Crear una sucursal con un código existente    | Rechazado con mensaje claro                         | 🟡 Media  | ☐ P ☐ F   |       |
| 3.3 | Nombre obligatorio  | Crear sucursal sin nombre                     | Validación en el formulario                         | 🟢 Baja   | ☐ P ☐ F   |       |
| 3.4 | Editar sucursal     | Cambiar el nombre de una sucursal             | Se actualiza                                        | 🟢 Baja   | ☐ P ☐ F   |       |
| 3.5 | Desactivar sucursal | Desactivar una sucursal                       | No aparece en el selector, el historial se conserva | 🟡 Media  | ☐ P ☐ F   |       |

### 4.4 Categorías

| #   | Caso                                      | Pasos                                               | Esperado                       | Severidad  | Resultado | Notas |
| --- | ----------------------------------------- | --------------------------------------------------- | ------------------------------ | ---------- | --------- | ----- |
| 4.1 | Crear categoría                           | Nueva categoría con nombre                          | Se guarda y aparece            | 🟡 Media   | ☐ P ☐ F   |       |
| 4.2 | Crear subcategoría                        | Nueva categoría con categoría padre                 | Aparece anidada                | 🟡 Media   | ☐ P ☐ F   |       |
| 4.3 | Nombre duplicado                          | Categoría con un nombre existente                   | Rechazado                      | 🟡 Media   | ☐ P ☐ F   |       |
| 4.4 | Categoría no puede ser su propia ancestro | Editar "Refrescos" y ponerlo como padre de sí mismo | Rechazado                      | 🟡 Media   | ☐ P ☐ F   |       |
| 4.5 | Categoría con productos                   | Intentar eliminar una categoría con productos       | No permite, sugiere desactivar | 🔴 Crítica | ☐ P ☐ F   |       |
| 4.6 | Desactivar categoría                      | Desactivar una categoría                            | Sus productos no se borran     | 🟡 Media   | ☐ P ☐ F   |       |

### 4.5 Proveedores

| #   | Caso                 | Pasos                                                | Esperado                               | Severidad | Resultado | Notas |
| --- | -------------------- | ---------------------------------------------------- | -------------------------------------- | --------- | --------- | ----- |
| 5.1 | Crear proveedor      | Nombre, contacto, teléfono, correo, dirección, notas | Se guarda completo                     | 🟡 Media  | ☐ P ☐ F   |       |
| 5.2 | Proveedor mínimo     | Solo nombre                                          | Se guarda, los demás quedan vacíos     | 🟢 Baja   | ☐ P ☐ F   |       |
| 5.3 | Teléfono inválido    | Escribir letras en el teléfono                       | Validación                             | 🟢 Baja   | ☐ P ☐ F   |       |
| 5.4 | Correo inválido      | Escribir un correo sin `@`                           | Validación                             | 🟢 Baja   | ☐ P ☐ F   |       |
| 5.5 | Editar proveedor     | Cambiar datos                                        | Se actualiza                           | 🟢 Baja   | ☐ P ☐ F   |       |
| 5.6 | Buscar proveedor     | Buscar por nombre                                    | Filtra la lista                        | 🟡 Media  | ☐ P ☐ F   |       |
| 5.7 | Desactivar proveedor | Desactivar un proveedor                              | Sus productos sobreviven sin proveedor | 🟡 Media  | ☐ P ☐ F   |       |

### 4.6 Productos — Alta

| #    | Caso                               | Pasos                                           | Esperado                             | Severidad  | Resultado | Notas |
| ---- | ---------------------------------- | ----------------------------------------------- | ------------------------------------ | ---------- | --------- | ----- |
| 6.1  | Crear producto completo            | Llenar todos los campos                         | Se guarda con todos los datos        | 🔴 Crítica | ☐ P ☐ F   |       |
| 6.2  | Nombre obligatorio                 | Crear producto sin nombre                       | Validación                           | 🟡 Media   | ☐ P ☐ F   |       |
| 6.3  | SKU duplicado                      | Crear con un SKU existente                      | Rechazado                            | 🟡 Media   | ☐ P ☐ F   |       |
| 6.4  | Código de barras duplicado         | Crear con un código de barras ya usado          | Rechazado                            | 🟡 Media   | ☐ P ☐ F   |       |
| 6.5  | Precio de venta menor al de compra | Poner compra 20, venta 15                       | Rechazado con mensaje explicativo    | 🔴 Crítica | ☐ P ☐ F   |       |
| 6.6  | Precio de venta igual al de compra | Poner compra 20, venta 20                       | Rechazado (debe ser mayor)           | 🟡 Media   | ☐ P ☐ F   |       |
| 6.7  | Precio negativo                    | Poner precio −5                                 | Rechazado                            | 🟡 Media   | ☐ P ☐ F   |       |
| 6.8  | Unidad de medida                   | Elegir pieza, kilogramo o litro                 | Se guarda la elegida                 | 🟡 Media   | ☐ P ☐ F   |       |
| 6.9  | Stock mínimo cero                  | Dejar el stock mínimo en 0                      | Se acepta (no habrá alerta)          | 🟢 Baja    | ☐ P ☐ F   |       |
| 6.10 | Stock mínimo negativo              | Poner stock mínimo −10                          | Rechazado                            | 🟡 Media   | ☐ P ☐ F   |       |
| 6.11 | Producto sin código de barras      | Dejar el código vacío                           | Se acepta (hay productos sin código) | 🟢 Baja    | ☐ P ☐ F   |       |
| 6.12 | Categoría obligatoria              | Crear sin categoría                             | Validación                           | 🟡 Media   | ☐ P ☐ F   |       |
| 6.13 | Proveedor opcional                 | Crear sin proveedor                             | Se acepta                            | 🟢 Baja    | ☐ P ☐ F   |       |
| 6.14 | Stock inicial por sucursal         | Crear con stock 50 en la sucursal A, 20 en la B | Se guardan ambos                     | 🔴 Crítica | ☐ P ☐ F   |       |

### 4.7 Productos — Consulta y edición

| #    | Caso                                 | Pasos                            | Esperado                              | Severidad  | Resultado | Notas |
| ---- | ------------------------------------ | -------------------------------- | ------------------------------------- | ---------- | --------- | ----- |
| 7.1  | Ver catálogo                         | Abrir productos                  | Lista con nombre, SKU, precio, stock  | 🔴 Crítica | ☐ P ☐ F   |       |
| 7.2  | Buscar por nombre completo           | Buscar "Sabritas"                | Aparece el producto                   | 🔴 Crítica | ☐ P ☐ F   |       |
| 7.3  | Buscar por nombre parcial            | Buscar "Sabri"                   | Aparece el producto                   | 🟡 Media   | ☐ P ☐ F   |       |
| 7.4  | Buscar por SKU                       | Buscar el código exacto          | Aparece el producto                   | 🔴 Crítica | ☐ P ☐ F   |       |
| 7.5  | Buscar por código de barras          | Escribir el código de barras     | Aparece el producto                   | 🔴 Crítica | ☐ P ☐ F   |       |
| 7.6  | Búsqueda sin resultados              | Buscar algo inexistente          | Mensaje "no se encontraron productos" | 🟡 Media   | ☐ P ☐ F   |       |
| 7.7  | Filtrar por categoría                | Elegir una categoría             | Solo salen sus productos              | 🟡 Media   | ☐ P ☐ F   |       |
| 7.8  | Filtrar por proveedor                | Elegir un proveedor              | Solo salen sus productos              | 🟡 Media   | ☐ P ☐ F   |       |
| 7.9  | Filtrar por inactivos                | Mostrar también inactivos        | Aparecen los desactivados             | 🟡 Media   | ☐ P ☐ F   |       |
| 7.10 | Combinar filtros                     | Categoría + proveedor            | Solo los que cumplen ambos            | 🟢 Baja    | ☐ P ☐ F   |       |
| 7.11 | Limpiar filtros                      | Pulsar "Limpiar"                 | Vuelve la lista completa              | 🟢 Baja    | ☐ P ☐ F   |       |
| 7.12 | Paginación                           | Con más de 20 productos          | Navega entre páginas correctamente    | 🟡 Media   | ☐ P ☐ F   |       |
| 7.13 | Editar producto                      | Cambiar precio y nombre          | Se actualiza                          | 🔴 Crítica | ☐ P ☐ F   |       |
| 7.14 | Editar no cambia el SKU a duplicado  | Editar a un SKU de otro producto | Rechazado                             | 🟡 Media   | ☐ P ☐ F   |       |
| 7.15 | Desactivar producto                  | Marcar como inactivo             | Desaparece del catálogo activo        | 🟡 Media   | ☐ P ☐ F   |       |
| 7.16 | Producto inactivo conserva historial | Intentar eliminar uno ya usado   | No permite borrar, sugiere desactivar | 🔴 Crítica | ☐ P ☐ F   |       |

### 4.8 Formato de Presentación

| #   | Caso                   | Pasos                       | Esperado                                            | Severidad | Resultado | Notas |
| --- | ---------------------- | --------------------------- | --------------------------------------------------- | --------- | --------- | ----- |
| 8.1 | Formato de moneda      | Ver un precio               | Muestra `$1,234.50` con separador de miles (RNF-13) | 🟡 Media  | ☐ P ☐ F   |       |
| 8.2 | Formato de decimales   | Ver un precio unitario      | Muestra 2 decimales                                 | 🟡 Media  | ☐ P ☐ F   |       |
| 8.3 | Cero pesos             | Ver un precio de 0          | Muestra `$0.00`                                     | 🟢 Baja   | ☐ P ☐ F   |       |
| 8.4 | Idioma de la interfaz  | Revisar todas las pantallas | Todo en español, sin términos en inglés (RNF-15)    | 🟡 Media  | ☐ P ☐ F   |       |
| 8.5 | Mensajes comprensibles | Provocar 3 errores          | Los mensajes dicen qué hacer, no código técnico     | 🟡 Media  | ☐ P ☐ F   |       |

### 4.9 Carga de Inventario Real

| #   | Caso                    | Pasos                                   | Esperado                                       | Severidad  | Resultado | Notas |
| --- | ----------------------- | --------------------------------------- | ---------------------------------------------- | ---------- | --------- | ----- |
| 9.1 | Cargar 10 productos     | Cargar 10 productos reales de la tienda | Se guardan los 10                              | 🔴 Crítica | ☐ P ☐ F   |       |
| 9.2 | Cargar 50 productos     | Cargar 50 productos reales              | Se guardan los 50 sin problemas de rendimiento | 🔴 Crítica | ☐ P ☐ F   |       |
| 9.3 | Tiempo de carga         | Cronometrar la carga de 50              | Menor a 10 minutos                             | 🟡 Media   | ☐ P ☐ F   |       |
| 9.4 | Buscar entre los reales | Buscar 3 productos del inventario real  | Los 3 aparecen                                 | 🔴 Crítica | ☐ P ☐ F   |       |
| 9.5 | Escaneo de código real  | Escanear 3 códigos de barras reales     | Los 3 aparecen                                 | 🔴 Crítica | ☐ P ☐ F   |       |

### 4.10 Navegación y Usabilidad

| #    | Caso               | Pasos                               | Esperado                            | Severidad | Resultado | Notas |
| ---- | ------------------ | ----------------------------------- | ----------------------------------- | --------- | --------- | ----- |
| 10.1 | Menú lateral       | Recorrer todas las secciones        | Se llega a cada una                 | 🟡 Media  | ☐ P ☐ F   |       |
| 10.2 | Volver atrás       | Usar el botón "Atrás" del navegador | Funciona                            | 🟡 Media  | ☐ P ☐ F   |       |
| 10.3 | Recargar la página | Recargar en el catálogo             | No se pierde la sesión ni la lista  | 🟡 Media  | ☐ P ☐ F   |       |
| 10.4 | Estado de carga    | Ver una tabla con retardo           | Aparece un indicador de carga       | 🟡 Media  | ☐ P ☐ F   |       |
| 10.5 | Lista vacía        | Filtrar sin resultados              | Mensaje útil, no pantalla en blanco | 🟡 Media  | ☐ P ☐ F   |       |
| 10.6 | Tablet             | Usar en tablet en horizontal        | Se ve bien y se puede operar        | 🟡 Media  | ☐ P ☐ F   |       |
| 10.7 | Teléfono           | Ver en pantalla de teléfono         | Al menos se puede consultar         | 🟢 Baja   | ☐ P ☐ F   |       |
| 10.8 | Texto largo        | Producto con nombre muy largo       | No rompe la tabla                   | 🟢 Baja   | ☐ P ☐ F   |       |

### 4.11 Compatibilidad de Navegadores

| #    | Navegador                | Esperado          | Resultado | Notas |
| ---- | ------------------------ | ----------------- | --------- | ----- |
| 11.1 | Chrome (última versión)  | Funciona completo | ☐ P ☐ F   |       |
| 11.2 | Edge (última versión)    | Funciona completo | ☐ P ☐ F   |       |
| 11.3 | Firefox (última versión) | Funciona completo | ☐ P ☐ F   |       |
| 11.4 | Safari (última versión)  | Funciona completo | ☐ P ☐ F   |       |

---

## 5. Registro de Defectos

| #   | Caso | Descripción del defecto | Severidad | Pasos para reproducir | Estado |
| --- | ---- | ----------------------- | --------- | --------------------- | ------ |
| 1   |      |                         |           |                       |        |
| 2   |      |                         |           |                       |        |
| 3   |      |                         |           |                       |        |
| 4   |      |                         |           |                       |        |
| 5   |      |                         |           |                       |        |

### 5.1 Distribución de severidad

| Severidad  | Encontrados | Cerrados | Abiertos |
| ---------- | ----------- | -------- | -------- |
| 🔴 Crítica |             |          |          |
| 🟠 Alta    |             |          |          |
| 🟡 Media   |             |          |          |
| 🟢 Baja    |             |          |          |

## 6. Observaciones del Usuario

| #   | Observación | Prioridad | Decisión |
| --- | ----------- | --------- | -------- |
| 1   |             |           |          |
| 2   |             |           |          |
| 3   |             |           |          |

---

## 7. Resultado

| Campo                      | Valor        |
| -------------------------- | ------------ |
| Casos ejecutados           | ______ de 78 |
| Casos aprobados            | ______       |
| Casos rechazados           | ______       |
| Cobertura                  | ______ %     |
| Defectos críticos abiertos | ______       |
| Defectos de alta abiertos  | ______       |

### Decisión

☐ **Aprobado** — Se puede continuar con el Sprint 2
☐ **Aprobado con observaciones** — Se puede continuar, con los ajustes anotados
☐ **Rechazado** — Se requiere corregir antes de continuar

**Firma del validador:** _______________________ **Fecha:** _______________

---

## 8. Historial de Versiones del Documento

| Versión | Fecha       | Autor            | Descripción                    |
| ------- | ----------- | ---------------- | ------------------------------ |
| 1.0.0   | 25 sep 2026 | Equipo StoreCore | Creación inicial del documento |
