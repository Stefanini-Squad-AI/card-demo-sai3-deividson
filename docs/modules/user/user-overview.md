# 👤 USER - Módulo de Gestión de Usuarios

**Módulo ID**: `user`  
**Versión**: 1.0  
**Última actualización**: 2026-02-09  
**Issue relacionado**: DSD-4  
**Propósito**: Disponer de una capa administrativa de seguridad que permita listar, crear, modificar y eliminar usuarios del sistema (back-office y administradores) con trazabilidad y validaciones comparables al mainframe original.

---

## 📋 Descripción general

- El módulo USER se despliega bajo `/admin/users/*` dentro del menú administrativo (`app/data/menuData.ts`) y está protegido por `ProtectedRoute requiredRole="admin"` en `app/App.tsx`.
- En producción llama a los endpoints reales de Spring Boot (`/api/users/...`), pero durante desarrollo puede activarse `VITE_USE_MOCKS=true` para que `useUserList`, `useUserAdd`, `useUserUpdate` y `useUserDelete` consuman los handlers de `app/mocks`.
- Se inspira en la pantalla COBOL original (programas `COUSR00C` a `COUSR03C`) y mantiene la experiencia de teclas de función (ENTER, F3, F4, F5, F12, F7, F8) y selecciones `U/D` gracias al componente `UserListScreen`.

### 🧭 Responsabilidades críticas

1. Listar usuarios con paginación tipo mainframe y selecciones por fila (`U` = Update, `D` = Delete).  
2. Crear nuevos usuarios cumpliendo reglas de longitud y seguridad de contraseña por pantalla `UserAddScreen`.  
3. Buscar y editar usuarios existentes con detección de cambios (`UserUpdateScreen`).  
4. Validar y eliminar usuarios con confirmación (`UserDeleteScreen`).  
5. Enriquecer el flujo con `SystemHeader` que muestra transacción, programa y manejo de sesión en cada pantalla.

---

## 🏗️ Arquitectura del módulo

```mermaid
flowchart LR
    subgraph UI
        ListPg[UserListPage]
        AddPg[UserAddPage]
        UpdatePg[UserUpdatePage]
        DeletePg[UserDeletePage]
    end
    ListPg --> ListScreen[UserListScreen]
    AddPg --> AddScreen[UserAddScreen]
    UpdatePg --> UpdateScreen[UserUpdateScreen]
    DeletePg --> DeleteScreen[UserDeleteScreen]

    subgraph Hooks
        useList[useUserList]
        useAdd[useUserAdd]
        useUpd[useUserUpdate]
        useDel[useUserDelete]
    end
    ListScreen --> useList
    AddScreen --> useAdd
    UpdateScreen --> useUpd
    DeleteScreen --> useDel
    useList --> Adapter[UserApiAdapter]
    useAdd --> Adapter
    useUpd --> Adapter
    useDel --> Adapter
    Adapter --> Api[apiClient (base /api)]
```

### Componentes clave

- `app/pages/UserListPage.tsx`, `UserAddPage.tsx`, `UserUpdatePage.tsx`, `UserDeletePage.tsx`: envuelven cada pantalla con `LoadingSpinner` y `ProtectedRoute`, validan `selectCurrentUser` (`role === 'admin'`) y, cuando corresponde, redirigen a `/login` o `/menu/main`.
- `app/components/user/UserListScreen.tsx`: tabla con `SystemHeader` (`CU00 / COUSR00C`), búsqueda en mayúsculas, paginación F7/F8, `Select` por fila para capturar `U` y `D`, y botones que replican F3 (Back), ENTER, F7, F8. También muestra chips con íconos `AdminPanelSettings` / `Person` y mantiene las líneas separadoras “---------” para conservar la estética mainframe.
- `app/components/user/UserAddScreen.tsx`: formulario en `Grid` con campos limitados (`maxLength 8` para ID/Password, 20 para nombres), visor de contraseña (`Visibility`), tiras de instrucciones (ENTER, F3, F4, F12) y validaciones en tiempo real. Usa `SystemHeader` con `transactionId="CU01"`.
- `app/components/user/UserUpdateScreen.tsx`: panel de búsqueda (ingresar `userId` en mayúsculas), detección de modo edición (`userData !== null`), validaciones estrictas (contraseña exactamente 8 caracteres) y botones con F3-F5-F12. `SystemHeader` usa `transactionId="CU02"`.
- `app/components/user/UserDeleteScreen.tsx`: misma estructura de búsqueda, cuadro de lectura para nombre, chip de tipo y diálogo de confirmación (`Dialog`, `Warning`). `SystemHeader` usa `transactionId="CU03"`.

### Hooks y estados

- `app/hooks/useUserList.ts`: encapsula paginación, búsquedas, acciones `U/D`, y navegación a `/admin/users/update` o `/admin/users/delete`. Usa `useApi` para cargar datos y registra `console.log` en cada acción para trazabilidad, maneja `VITE_USE_MOCKS` y `UserApiAdapter`.
- `app/hooks/useUserAdd.ts`, `useUserUpdate.ts`, `useUserDelete.ts`: usan `useMutation` (que depende de `useApi.ts`), validan formularios paso a paso, y exponen helpers como `clearForm`, `hasChanges`, `handleFetchUser`, `handleExit` (F12). En producción llaman a `UserApiAdapter`, en mocks se conectan a `/api/users/...` y mensajes de éxito/error se muestran con `Alert`.

### Servicio API y adaptador

- `app/services/userApi.ts` define `UserApiAdapter` que transforma las peticiones/listas a la forma del backend Spring (`startUserId`, `pageNumber`, `direction`) y adapta las respuestas (`userType` `'R'` → `'U'`, `hasNext`, `hasPrev`).  
- `apiClient` (`app/services/api.ts`) añade encabezados JSON, token `auth-token`, timeout de 10s y envuelve los distintos formatos (`success`/`data`).
- Para la navegación rápida, también ofrece `processUserSelection` (`POST /api/users/process-selection`) y métodos auxiliares `getPreviousPage`/`getNextPage` preparados para futuras pantallas.

### Menú, rutas y permisos

- Menú administrativo (`app/data/menuData.ts`) expone las rutas `/admin/users/list`, `/add`, `/update`, `/delete` y las marca `adminOnly`.  
- El App Router (`app/App.tsx`) arma las rutas protegidas con `<ProtectedRoute requiredRole="admin">`.  
- `SystemHeader` (`app/components/layout/SystemHeader.tsx`) muestra `transactionId`, `programName`, fecha/hora y botones Home/Logout para volver al menú (`CADM / COADM01`).

---

## 🌐 APIs documentadas

| Método | Endpoint | Descripción | Payload ejemplo | Respuesta ejemplo |
| --- | --- | --- | --- | --- |
| GET | `/api/users/list?startUserId=USER001&pageNumber=1&direction=FORWARD` | Lista paginada con filtro de `searchUserId`. | — | `{ "users": [{"userId":"USER001","firstName":"Juan","lastName":"Perez","userType":"U"}], "pagination": {"page":1,"limit":10,"total":1,"totalPages":1,"hasNext":false,"hasPrev":false}}` |
| POST | `/api/users/process-selection` | Valida acción `U`/`D` y retorna `redirectUrl`. | `{ "selectedUserId": "USER001", "selectionFlag": "U" }` | `{ "valid": true, "action": "U", "userId": "USER001", "redirectUrl": "/admin/users/update?userId=USER001" }` |
| POST | `/api/users` | Alta de usuario. | `{ "userId":"USER002","firstName":"Ana","lastName":"Lara","password":"P4s$W0rd","userType":"A" }` | `{ "success":true,"message":"User USER002 has been added ...","user":{...}}` |
| GET | `/api/users/USER002` (mocks usan `/api/users/security/USER002`) | Obtiene datos completos para update/delete. | — | `{ "userId":"USER002","firstName":"Ana","lastName":"Lara","userType":"A","createdDate":"2025-12-01" }` |
| PUT | `/api/users/USER002` | Actualiza el usuario. | `{ "firstName":"Anita","lastName":"Lara","password":"N3wPwd!","userType":"U" }` | `{ "success":true,"data":{...},"message":"User USER002 has been updated ..." }` |
| DELETE | `/api/users/USER002` | Elimina un usuario. | — | `{ "success":true,"data":{"userId":"USER002","message":"User USER002 has been deleted ...","success": true}}` |

> **Nota**: Los mocks (`app/mocks/*`) replican estos endpoints con `HttpResponse.json`, validan permisos (no se puede eliminar el último admin) y devuelven mensajes (por ejemplo, `Cannot delete administrator users.`).

---

## 🧱 Modelos de datos

```typescript
interface UserSecurityData { // app/types/user.ts
  userId: string;
  firstName: string;
  lastName: string;
  userType: 'A' | 'U' | 'R';
  createdDate?: string;
  lastLoginDate?: string;
  isActive?: boolean;
}

type NormalizedUserType = 'A' | 'U';
const normalizeUserType = (userType: 'A' | 'U' | 'R'): NormalizedUserType => userType === 'R' ? 'U' : userType;

interface UserAddFormData { firstName: string; lastName: string; userId: string; password: string; userType: 'A' | 'U'; }
interface UserUpdateData { userId: string; firstName: string; lastName: string; userType: 'A' | 'U'; password?: string; }
interface UserDeleteData { userId: string; firstName: string; lastName: string; userType: 'A' | 'U'; }
``` 

Los formularios reutilizan estos tipos para forzar mayúsculas (`toUpperCase()` en `handleFieldChange`), longitudes máximas (`maxLength: 8` en ID/Password) y contraseñas exactas de 8 caracteres en `UserUpdateScreen`.

---

## 🔒 Reglas de negocio

1. `userId` único de 8 caracteres en mayúsculas; se valida en los hooks de creación y actualización.  
2. Solo los admins pueden crear/modificar/eliminar otros usuarios (`useAppSelector(selectCurrentUser)` + `ProtectedRoute requiredRole=admin`).  
3. Contraseñas de exactamente 8 caracteres y máximo 8 (`validationErrors` y `helperText`).  
4. Los usuarios inactivos (no mostrados en la lista) no pueden iniciar sesión; la API marca `isActive`.  
5. Registro de auditoría simulado mediante `console.log` en los hooks y `SystemHeader` para mostrar transacción/programa en cada pantalla.  
6. No se permite eliminar al último admin ni a un admin desde la interfaz (MSW retorna 403).  
7. El `Select` de acciones solo acepta `U` o `D`; cualquier otro valor dispara error y no navega.

---

## 📝 Historias de Usuario (plantillas)

1. **Lista principal**: Como administrador, quiero ver la lista completa de usuarios para seleccionar rápidamente un registro y aplicar Update/Delete sin salir del menú principal.  
2. **Alta**: Como administrador, quiero crear usuarios nuevos con validaciones en el formulario para garantizar credenciales válidas.  
3. **Actualización**: Como administrador, quiero buscar un `userId` específico, modificar el nombre/rol y guardar el cambio con confirmación de mensaje (F5 o F3).  
4. **Baja**: Como administrador, quiero consultar un usuario existente, revisar la tarjeta de información y confirmar la baja con un diálogo para prevenir errores.

## ✅ Criterios de aceptación comunes

- Formularios validan campos obligatorios (mensajes `can NOT be empty`).  
- Los campos `userId` y `password` se convierten a mayúsculas y no admiten más de 8 caracteres.  
- `UserListScreen` mantiene la paginación y las instrucciones de F7/F8; ENTER activa búsqueda si no hay selección.  
- Los usuarios tipo `A` muestran icono `AdminPanelSettings`, los `U` muestran `Person`.  
- Las acciones `U`/`D` solo navegan una vez que el backend valida la acción (mock `validate-action`).

---

## ⚡ Factores de aceleración

- `useUserList` expone `handleSearch`, `handlePageChange`, `handleUserAction`, `handleEnterKey` y reutiliza `useApi` para evitar reproducir lógica de carga.  
- `UserApiAdapter` transforma datos de backend y detecta `userType === 'R'` para mantener compatibilidad con clientes que aún envían ese flag.  
- `SystemHeader` en cada pantalla (CU00–CU03) garantiza consistencia visual y acceso rápido a Home/Logout.  
- `useUserAdd`, `useUserUpdate`, `useUserDelete` reutilizan `useMutation` y navegan automáticamente a `/admin/users/list` tras guardar.  
- Los mocks (`app/mocks/userAddHandlers.ts`, `userUpdateHandlers.ts`, `userDeleteHandlers.ts`) cubren casi todos los errores del backend (403 al eliminar admin, 409 para userId repetido, validaciones de campos).

---

## 🧮 Guías de complejidad

- **Simple (1-2 pts)**: Ajustar texto de ayuda o color de chips en `UserListScreen`, agregar mensaje adicional en `Alert`.  
- **Medio (3-5 pts)**: Introducir validación adicional (p.ej. dominio permitido en correo) y reflejarla en el formulario con `validationErrors`.  
- **Complejo (5-8 pts)**: Integrar el módulo con un servicio externo de auditoría, incluir nuevos `UserType` y extender `normalizeUserType`.

---

**Paths clave**:  
- Pantallas: `app/pages/UserListPage.tsx`, `UserAddPage.tsx`, `UserUpdatePage.tsx`, `UserDeletePage.tsx`.  
- Componentes: `app/components/user/*.tsx`.  
- Hooks: `app/hooks/useUserList.ts`, `useUserAdd.ts`, `useUserUpdate.ts`, `useUserDelete.ts`.  
- Servicios: `app/services/userApi.ts`, `app/services/api.ts`.  
- Menú: `app/data/menuData.ts`.  
- Rutas: `app/App.tsx`.

**Diagrama de dependencias**: referirse al bloque Mermaid arriba.

