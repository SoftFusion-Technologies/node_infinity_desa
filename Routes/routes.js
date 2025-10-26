/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 21 /06 /2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (routes.js) define las rutas HTTP para operaciones CRUD en la tabla 'locales'
 * Tema: Rutas - Locales
 *
 * Capa: Backend
 */

import express from 'express'; // Importa la librería Express
const router = express.Router(); // Inicializa el router
import { authenticateToken } from '../Security/auth.js'; // Importa las funciones del archivo auth.js

// Importar controladores de usuarios
import {
  OBRS_Usuarios_CTS,
  OBR_Usuario_CTS,
  CR_Usuario_CTS,
  ER_Usuario_CTS,
  UR_Usuario_CTS
} from '../Controllers/CTS_TB_Users.js';
// Importar controladores de usuarios
// ----------------------------------------------------------------
// Rutas para operaciones CRUD en la tabla 'usuarios'
// ----------------------------------------------------------------

router.get('/users', OBRS_Usuarios_CTS);
router.get('/usuarios', authenticateToken, OBRS_Usuarios_CTS);
router.get('/users/:id', OBR_Usuario_CTS);
router.post('/usuarios', authenticateToken, CR_Usuario_CTS);
router.put('/usuarios/:id', authenticateToken, UR_Usuario_CTS);
router.delete('/usuarios/:id', authenticateToken, ER_Usuario_CTS);

// Importar controladores de Sedes
import {
  OBRS_Locales_Activas_Selector,
  OBRS_Locales_CTS,
  OBR_Local_CTS,
  CR_Local_CTS,
  ER_Local_CTS,
  UR_Local_CTS
} from '../Controllers/CTS_TB_Locales.js';
// Importar controladores de Sedes

// ----------------------------------------------------------------
// Rutas para operaciones CRUD en la tabla 'locales'
// ----------------------------------------------------------------

router.get('/locales/activas', OBRS_Locales_Activas_Selector);

// Obtener todos los locales
router.get('/locales', OBRS_Locales_CTS);

// Obtener un solo local por ID
router.get('/locales/:id', OBR_Local_CTS);

// Crear un nuevo local
router.post('/locales', CR_Local_CTS);

// Eliminar un local por ID
router.delete('/locales/:id', ER_Local_CTS);

// Actualizar un local por ID
router.put('/locales/:id', UR_Local_CTS);

import { OBRS_Logs_CTS, OBR_Log_CTS } from '../Controllers/CTS_TB_Logs.js';

router.get('/logs', authenticateToken, OBRS_Logs_CTS);
router.get('/logs/:id', authenticateToken, OBR_Log_CTS);

import {
  COUNT_PENDIENTES_TestClass_CTS,
  OBR_TestClass_CTS,
  OBRS_TestClass_CTS,
  CR_TestClass_CTS,
  ER_TestClass_CTS,
  UR_TestClass_CTS,
  MOVER_A_VENTAS_CTS
  // Importa los controladores necesarios para la tabla password_reset - tb_13
} from '../Controllers/CTS_TB_TestClass.js';

// ----------------------------------------------------------------
// Ruta para obtener todos los registros de TestClass_CTS tb_13
// ----------------------------------------------------------------
// Define las rutas para cada método del controlador de TestClass_CTS

// ✅ NUEVA: conteo de pendientes para el badge
router.get('/testclass/count-pendientes', COUNT_PENDIENTES_TestClass_CTS);

router.get('/testclass', OBRS_TestClass_CTS);

// Obtener un registro específico de TestClass_CTS por su ID
router.get('/testclass/:id', OBR_TestClass_CTS);

// Crear un nuevo registro en TestClass_CTS
router.post('/testclass', CR_TestClass_CTS);

// Eliminar un registro en TestClass_CTS por su ID
router.delete('/testclass/:id', ER_TestClass_CTS);
// Actualizar un registro en TestClass_CTS por su ID
router.put('/testclass/:id', UR_TestClass_CTS);

router.post('/testclass/mover-a-ventas', MOVER_A_VENTAS_CTS);

import {
  OBR_VentasProspecto_CTS,
  OBRS_VentasProspectos_CTS,
  CR_VentasProspecto_CTS,
  ER_VentasProspecto_CTS,
  UR_VentasProspecto_CTS,
  OBRS_ColaboradoresConVentasProspectos
} from '../Controllers/CTS_TB_VentasProspectos.js';

// Obtener todos los prospectos (con filtros opcionales)
router.get('/ventas_prospectos', OBRS_VentasProspectos_CTS);

// Obtener un prospecto por ID
router.get('/ventas_prospectos/:id', OBR_VentasProspecto_CTS);

// Crear un prospecto
router.post('/ventas_prospectos', CR_VentasProspecto_CTS);

// Actualizar un prospecto
router.put('/ventas_prospectos/:id', UR_VentasProspecto_CTS);

// Eliminar un prospecto
router.delete('/ventas_prospectos/:id', ER_VentasProspecto_CTS);

// Obtener lista de usuarios que cargaron prospectos
router.get(
  '/ventas_prospectos_colaboradores',
  OBRS_ColaboradoresConVentasProspectos
);

import {
  GET_AgendaHoy,
  GET_AgendaHoyCount,
  PATCH_AgendaDone,
  POST_GenerarAgendaHoy // opcional (para pruebas/manual)
} from '../Controllers/CTS_TB_VentasAgenda.js';


// Agenda de HOY (pendientes). Admin ve todo; user por usuario_id
// GET /api/ventas/agenda/hoy?usuario_id=123&level=user&with_prospect=1
router.get('/ventas/agenda/hoy', /* requireAuth, */ GET_AgendaHoy);

// Contador para badge
// GET /api/ventas/agenda/hoy/count?usuario_id=123&level=user
router.get('/ventas/agenda/hoy/count', /* requireAuth, */ GET_AgendaHoyCount);

// Marcar seguimiento como realizado
// PATCH /api/ventas/agenda/:id/done
router.patch('/ventas/agenda/:id/done', /* requireAuth, */ PATCH_AgendaDone);

// Forzar generación hoy (útil para pruebas)
// POST /api/ventas/agenda/generar-hoy
router.post(
  '/ventas/agenda/generar-hoy',
  /* requireAuth, */ POST_GenerarAgendaHoy
);

import {
  OBR_Recaptacion_CTS,
  OBRS_Recaptacion_CTS,
  CNT_RecaptacionPendientes_CTS,
  CR_Recaptacion_CTS,
  ER_Recaptacion_CTS,
  UR_Recaptacion_CTS,
  OBRS_ColaboradoresConRecaptacion,
  ER_RecaptacionMasiva_CTS,
  ER_RecaptacionMasivaPorUsuario_CTS
} from '../Controllers/CTS_TB_Recaptacion.js';


// Obtener todos los registros (puede filtrar por usuario o ser admin/coordinador)
router.get('/recaptacion', OBRS_Recaptacion_CTS);
router.get('/recaptacion/pendientes/count', CNT_RecaptacionPendientes_CTS);

// Obtener un registro específico
router.get('/recaptacion/:id', OBR_Recaptacion_CTS);

// Crear uno o varios registros nuevos
router.post('/recaptacion', CR_Recaptacion_CTS);

// Eliminar un registro
router.delete('/recaptacion/:id', ER_Recaptacion_CTS);

// Actualizar un registro
router.put('/recaptacion/:id', UR_Recaptacion_CTS);

router.get('/usuarios-con-registros', OBRS_ColaboradoresConRecaptacion);

router.delete('/recaptacion-masivo', ER_RecaptacionMasiva_CTS);

// Ejemplo: DELETE /recaptacion-masiva-usuario?usuario_id=10
router.delete(
  '/recaptacion-masiva-usuario',
  ER_RecaptacionMasivaPorUsuario_CTS
);

import RT_Import_Recaptacion from '../Controllers/RT_Import_Recaptacion.js';
router.use('/recaptacionImport', RT_Import_Recaptacion);


import {
  OBRS_EjerciciosCatalogo_CTS,
  OBR_EjercicioCatalogo_CTS,
  CR_EjercicioCatalogo_CTS,
  ER_EjercicioCatalogo_CTS,
  UR_EjercicioCatalogo_CTS,
  SEARCH_EjerciciosCatalogo_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_EjerciciosCatalogo.js';

router.get('/catalogo-ejercicios', OBRS_EjerciciosCatalogo_CTS);
router.get('/catalogo-ejercicios/:id', OBR_EjercicioCatalogo_CTS);
router.post('/catalogo-ejercicios', CR_EjercicioCatalogo_CTS);
router.put('/catalogo-ejercicios/:id', UR_EjercicioCatalogo_CTS);
router.delete('/catalogo-ejercicios/:id', ER_EjercicioCatalogo_CTS);
router.get('/catalogo-ejercicios/search', SEARCH_EjerciciosCatalogo_CTS);

export default router;
