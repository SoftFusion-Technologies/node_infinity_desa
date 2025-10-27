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
  OBR_Routines_CTS,
  OBRS_Routines_CTS,
  CR_Routines_CTS,
  ER_Routines_CTS,
  UR_Routines_CTS,
  DL_RoutineExercisesByMuscle_CTS,
  DL_UpdateMuscleName_CTS,
  UR_CompletarRutina_CTS,
  OBRS_RoutinesByInstructor_CTS
} from '../Controllers/CTS_TB_Routines.js';

import {
  OBR_RoutineExercises_CTS,
  OBRS_RoutineExercises_CTS,
  CR_RoutineExercises_CTS,
  ER_RoutineExercises_CTS,
  UR_RoutineExercises_CTS
} from '../Controllers/CTS_TB_RoutineExercises.js';

import {
  OBRS_RoutineFeedback_CTS,
  OBR_RoutineFeedback_CTS,
  CR_RoutineFeedback_CTS,
  ER_RoutineFeedback_CTS,
  UR_RoutineFeedback_CTS
} from '../Controllers/CTS_TB_RoutineFeedback.js';

import {
  OBRS_RoutineRequests_CTS,
  OBR_RoutineRequest_CTS,
  CR_RoutineRequest_CTS,
  ER_RoutineRequest_CTS,
  UR_RoutineRequest_CTS,
  atenderSolicitud // <-- (marcar como atendida)
} from '../Controllers/CTS_TB_RoutineRequests.js';


// ----------------------------------------------------------------
// Obtener todas las rutinas o filtrar por student_id
router.get('/routines', OBRS_Routines_CTS);

// Obtener una rutina por ID
router.get('/routines/:id', OBRS_Routines_CTS);

// Crear una nueva rutina
router.post('/routines', CR_Routines_CTS);

// Eliminar una rutina por ID
router.delete('/routines/:id', ER_Routines_CTS);

// Actualizar una rutina por ID
router.put('/routines/:id', UR_Routines_CTS);

// eliminar rutina y musculo
router.delete('/routines/:routineId/:musculo', DL_RoutineExercisesByMuscle_CTS);
// routes
router.put('/routines/:routineId/muscle/:oldMuscle', DL_UpdateMuscleName_CTS);

// Ruta para completar una rutina
router.put('/routines/:id/completar', UR_CompletarRutina_CTS);

router.get('/routines-by-instructor', OBRS_RoutinesByInstructor_CTS);

// ----------------------------------------------------------------

// ----------------------------------------------------------------
// Obtener todos los ejercicios o filtrar por routine_id
router.get('/routine_exercises', OBRS_RoutineExercises_CTS);

// Obtener un ejercicio por id
router.get('/routine_exercises/:id', OBR_RoutineExercises_CTS);

// Crear un nuevo ejercicio
router.post('/routine_exercises', CR_RoutineExercises_CTS);

// Eliminar un ejercicio por id
router.delete(
  '/routines/:routineId/routines_exercises/:exerciseId',
  ER_RoutineExercises_CTS
);
// Actualizar un ejercicio por id
router.put(
  '/routines/:routineId/routines_exercises/:exerciseId',
  UR_RoutineExercises_CTS
);
// ----------------------------------------------------------------
// Obtener todos los feedbacks o filtrar por rutina o alumno
router.get('/routine-feedback', OBRS_RoutineFeedback_CTS);

// Obtener un feedback específico por ID
router.get('/routine-feedback/:id', OBR_RoutineFeedback_CTS);

// Crear un nuevo feedback
router.post('/routine-feedback', CR_RoutineFeedback_CTS);

// Eliminar un feedback por ID
router.delete('/routine-feedback/:id', ER_RoutineFeedback_CTS);

// Actualizar un feedback por ID
router.put('/routine-feedback/:id', UR_RoutineFeedback_CTS);
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// Rutas para routine_requests
router.get('/routine_requests', OBRS_RoutineRequests_CTS);
router.get('/routine_requests/:id', OBR_RoutineRequest_CTS);
router.post('/routine_requests', CR_RoutineRequest_CTS);
router.delete('/routine_requests/:id', ER_RoutineRequest_CTS);
router.put('/routine_requests/:id', UR_RoutineRequest_CTS);

// Nueva ruta para marcar solicitud como atendida y mover a stats
router.post('/routine_requests/atender/:id', atenderSolicitud);

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

import {
  OBR_Students_CTS,
  OBRS_Students_CTS,
  CR_Students_CTS,
  ER_Students_CTS,
  UR_Students_CTS
} from '../Controllers/CTS_TB_Students.js';

// ----------------------------------------------------------------

// ----------------------------------------------------------------
// Obtener todos los estudiantes (opcionalmente filtrar por user_id)
router.get('/students', OBRS_Students_CTS);

// Obtener un estudiante por ID
router.get('/students/:id', OBR_Students_CTS);

// Crear un nuevo estudiante
router.post('/students', CR_Students_CTS);

// Eliminar un estudiante por ID
router.delete('/students/:id', ER_Students_CTS);

// Actualizar un estudiante por ID
router.put('/students/:id', UR_Students_CTS);


import {
  OBRS_RutinaColores_CTS,
  OBR_RutinaColor_CTS,
  CR_RutinaColor_CTS,
  UR_RutinaColor_CTS,
  ER_RutinaColor_CTS
} from '../Controllers/CTS_TB_RutinaColores.js';
router.get('/rutina-colores', OBRS_RutinaColores_CTS);
router.get('/rutina-colores/:id', OBR_RutinaColor_CTS);
router.post('/rutina-colores', CR_RutinaColor_CTS);
router.put('/rutina-colores/:id', UR_RutinaColor_CTS);
router.delete('/rutina-colores/:id', ER_RutinaColor_CTS);


import {
  OBRS_Rutinas_CTS, // Obtener todas las rutinas (opcionalmente por student_id)
  OBR_Rutina_CTS, // Obtener una rutina por ID
  CR_Rutina_CTS, // Crear una nueva rutina
  ER_Rutina_CTS, // Eliminar una rutina por ID
  UR_Rutina_CTS, // Actualizar una rutina por ID
  UR_RutinaFechas_CTS // Actualizar una FECHA de rutina por ID
} from '../Controllers/Rutinas_V2/CTS_TB_Rutinas.js';

// Obtener todas las rutinas (con o sin filtros)
router.get('/rutinas', OBRS_Rutinas_CTS);

// Obtener una rutina específica por su ID
router.get('/rutinas/:id', OBR_Rutina_CTS);

// Crear una nueva rutina
router.post('/rutinas', CR_Rutina_CTS);

// Actualizar una rutina por su ID
router.put('/rutinas/:id', UR_Rutina_CTS);

// Eliminar una rutina por su ID
router.delete('/rutinas/:id', ER_Rutina_CTS);

import { ASIG_RutinaALote_CTS } from '../Controllers/Rutinas_V2/CTS_TB_RutinasAsignaciones.js';
// routes
router.post('/rutinas/:rutina_id/asignar', ASIG_RutinaALote_CTS);

import {
  OBRS_Bloques_CTS,
  OBR_Bloque_CTS,
  CR_Bloque_CTS,
  ER_Bloque_CTS,
  UR_Bloque_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_Bloques.js';

router.get('/bloques', OBRS_Bloques_CTS);
router.get('/bloques/:id', OBR_Bloque_CTS);
router.post('/bloques', CR_Bloque_CTS);
router.put('/bloques/:id', UR_Bloque_CTS);
router.delete('/bloques/:id', ER_Bloque_CTS);

import {
  OBRS_Ejercicios_CTS,
  OBR_Ejercicio_CTS,
  CR_Ejercicio_CTS,
  ER_Ejercicio_CTS,
  UR_Ejercicio_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_Ejercicios.js';

router.get('/ejercicios', OBRS_Ejercicios_CTS);
router.get('/ejercicios/:id', OBR_Ejercicio_CTS);
router.post('/ejercicios', CR_Ejercicio_CTS);
router.put('/ejercicios/:id', UR_Ejercicio_CTS);
router.delete('/ejercicios/:id', ER_Ejercicio_CTS);

import {
  OBRS_Series_CTS,
  OBR_Serie_CTS,
  CR_Serie_CTS,
  ER_Serie_CTS,
  UR_Serie_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_Series.js';

router.get('/series', OBRS_Series_CTS);
router.get('/series/:id', OBR_Serie_CTS);
router.post('/series', CR_Serie_CTS);
router.put('/series/:id', UR_Serie_CTS);
router.delete('/series/:id', ER_Serie_CTS);

import {
  OBR_RutinaCompleta_CTS,
  CR_RutinaCompleta_CTS,
  OBR_UltimaRutinaAlumno_CTS,
  OBR_RutinasDeHoyAlumno_CTS,
  OBR_RutinasVigentesPorFechaAlumno_CTS,
  OBR_RutinasVigentesHoyAlumno_CTS,
  CR_RutinaCompleta_Lote_CTS,
  OBR_RutinasAsignadasHoyAlumno_CTS,
  OBR_RutinasAsignadasPorFechaAlumno_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_Rutinas_Completas.js';

router.get('/rutinas/:id/completa', OBR_RutinaCompleta_CTS);
router.post('/rutinas-completas', CR_RutinaCompleta_CTS);

router.get('/rutinas/ultima/:student_id', OBR_UltimaRutinaAlumno_CTS);
router.get('/rutinas/hoy/:student_id', OBR_RutinasDeHoyAlumno_CTS);
router.get(
  '/rutinas/alumno/:student_id/vigentes-por-fecha',
  OBR_RutinasVigentesPorFechaAlumno_CTS
);
router.get(
  '/rutinas/alumno/:student_id/vigentes',
  OBR_RutinasVigentesHoyAlumno_CTS
);

router.post('/rutinas/completa/lote', CR_RutinaCompleta_Lote_CTS); // nuevo

// Solo asignadas (sin mezclar con las “propias”)
router.get(
  '/rutinas/asignadas/hoy/:student_id',
  OBR_RutinasAsignadasHoyAlumno_CTS
);
router.get(
  '/rutinas/asignadas/vigentes-por-fecha/:student_id',
  OBR_RutinasAsignadasPorFechaAlumno_CTS
);

import {
  OBRS_PSE_CTS,
  OBR_PSE_CTS,
  CR_PSE_CTS,
  CR_PSE_Sesion_CTS,
  CR_PSE_Serie_CTS,
  UR_PSE_CTS,
  ER_PSE_CTS,
  OBRS_PSE_CargaSesion_CTS,
  OBRS_PSE_UltimosPorSerie_CTS
} from '../Controllers/Rutinas_V2/CTS_TB_PseRegistros.js';

router.get('/pse', OBRS_PSE_CTS);
router.get('/pse/:id', OBR_PSE_CTS);
router.post('/pse', CR_PSE_CTS);
router.post('/pse/sesion', CR_PSE_Sesion_CTS);
router.post('/pse/serie', CR_PSE_Serie_CTS);
router.patch('/pse/:id', UR_PSE_CTS);
router.delete('/pse/:id', ER_PSE_CTS);

router.get('/pse/carga-sesion', OBRS_PSE_CargaSesion_CTS);
router.get('/pse/ultimos-por-serie', OBRS_PSE_UltimosPorSerie_CTS);


import {
  OBRS_RoutineSerieLogs_CTS,
  OBR_RoutineSerieLog_CTS,
  CR_RoutineSerieLog_CTS,
  UR_RoutineSerieLog_CTS,
  ER_RoutineSerieLog_CTS,
  OBR_UltimoLogSerieAlumno_CTS,
  OBRS_HistorialLogSerie_CTS
} from '../Controllers/CTS_RoutineSerieLogs.js';

import {
  OBRS_LogsGlobalPorAlumno_CTS,
  OBR_LogGlobalPorId_CTS
} from '../Controllers/Rutinas_V2/CTS_LogsGlobal.js';

// ⚠️ Primero las rutas "de palabra"
router.get('/routine_exercise_logs/last', OBR_UltimoLogSerieAlumno_CTS);
router.get('/routine_exercise_logs/history', OBRS_HistorialLogSerie_CTS);
router.get('/routine_exercise_logs/global', OBRS_LogsGlobalPorAlumno_CTS);
router.get('/routine_exercise_logs/global/:id', OBR_LogGlobalPorId_CTS);

// Luego las genéricas
router.get('/routine_exercise_logs', OBRS_RoutineSerieLogs_CTS);
router.get('/routine_exercise_logs/:id', OBR_RoutineSerieLog_CTS);
router.post('/routine_exercise_logs', CR_RoutineSerieLog_CTS);
router.put('/routine_exercise_logs/:id', UR_RoutineSerieLog_CTS);
router.delete('/routine_exercise_logs/:id', ER_RoutineSerieLog_CTS);


import { OBR_RutinasFullList_CTS } from '../Controllers/Rutinas_V2/OBR_Rutinas_CTS.js';
router.get('/rutinasss', OBR_RutinasFullList_CTS);


import {
  OBRS_StudentMonthlyGoals_CTS,
  OBR_StudentMonthlyGoals_CTS,
  CR_StudentMonthlyGoals_CTS,
  ER_StudentMonthlyGoals_CTS,
  UR_StudentMonthlyGoals_CTS
} from '../Controllers/CTS_TB_StudentMonthlyGoals.js';

// Obtener todos los objetivos o filtrarlos por student_id, mes, año
router.get('/student-monthly-goals', OBRS_StudentMonthlyGoals_CTS);

// Obtener un objetivo específico por su ID
router.get('/student-monthly-goals/:id', OBR_StudentMonthlyGoals_CTS);

// Crear un nuevo objetivo (o varios)
router.post('/student-monthly-goals', CR_StudentMonthlyGoals_CTS);

// Eliminar un objetivo por su ID
router.delete('/student-monthly-goals/:id', ER_StudentMonthlyGoals_CTS);

// Actualizar un objetivo por su ID
router.put('/student-monthly-goals/:id', UR_StudentMonthlyGoals_CTS);


// ===========================
// NUEVO MODULO DE PROGRESO PARA ALUMNOS
// ===========================

// NUEVO MODULO DE PROGRESO PARA ALUMNOS
import {
  OBRS_StudentProgress_CTS,
  OBR_StudentProgress_CTS,
  CR_StudentProgress_CTS,
  UR_StudentProgress_CTS,
  ER_StudentProgress_CTS
} from '../Controllers/AlumnProgress/CTS_TB_StudentProgress.js';


// Progreso mensual del alumno
// Obtener todos los progresos o filtrarlos por student_id, mes y año
router.get('/student-progress', OBRS_StudentProgress_CTS);

// Obtener un progreso específico por ID
router.get('/student-progress/:id', OBR_StudentProgress_CTS);

// Crear nuevo progreso
router.post('/student-progress', CR_StudentProgress_CTS);

// Actualizar progreso por ID
router.put('/student-progress/:id', UR_StudentProgress_CTS);

// Eliminar progreso por ID
router.delete('/student-progress/:id', ER_StudentProgress_CTS);

// ----------------------------------------
// NUEVO MODULO DE GESTION DE RM
import {
  OBR_StudentRM_CTS,
  OBRS_StudentRM_CTS,
  CR_StudentRM_CTS,
  ER_StudentRM_CTS,
  UR_StudentRM_CTS,
  OBRS_HistorialRM_CTS
} from '../Controllers/CTS_TB_StudentRM.js';
// NUEVO MODULO DE GESTION DE RM


// ----------------------------------------------------------------
// Obtener todos los registros de RM (opcionalmente filtrar por student_id)
router.get('/student-rm', OBRS_StudentRM_CTS);

// Obtener un registro de RM por ID
router.get('/student-rm/:id', OBR_StudentRM_CTS);

// Crear un nuevo registro de RM
router.post('/student-rm', CR_StudentRM_CTS);

// Eliminar un registro de RM por ID
router.delete('/student-rm/:id', ER_StudentRM_CTS);

// Actualizar un registro de RM por ID
router.put('/student-rm/:id', UR_StudentRM_CTS);

router.get('/rm-historial', OBRS_HistorialRM_CTS); // http://localhost:8080/rm-historial?student_id=18&ejercicio=Sentadilla

import {
  OBRS_StudentWeeklyCheckin_CTS,
  OBR_StudentWeeklyCheckin_CTS,
  CR_StudentWeeklyCheckin_CTS,
  UR_StudentWeeklyCheckin_CTS,
  ER_StudentWeeklyCheckin_CTS
} from '../Controllers/AlumnProgress/CTS_TB_StudentWeeklyCheckin.js';

// ----------------------------------------

// Check-in semanal del alumno
// Obtener todos los check-ins o filtrarlos por student_id, semana y año
router.get('/student-weekly-checkin', OBRS_StudentWeeklyCheckin_CTS);

// Obtener un check-in específico por ID
router.get('/student-weekly-checkin/:id', OBR_StudentWeeklyCheckin_CTS);

// Crear nuevo check-in
router.post('/student-weekly-checkin', CR_StudentWeeklyCheckin_CTS);

// Actualizar check-in por ID
router.put('/student-weekly-checkin/:id', UR_StudentWeeklyCheckin_CTS);

// Eliminar check-in por ID
router.delete('/student-weekly-checkin/:id', ER_StudentWeeklyCheckin_CTS);

// ----------------------------------------

import {
  OBRS_StudentAchievements_CTS,
  OBR_StudentAchievement_CTS,
  CR_StudentAchievement_CTS,
  UR_StudentAchievement_CTS,
  ER_StudentAchievement_CTS
} from '../Controllers/AlumnProgress/CTS_TB_StudentAchievements.js';
// NUEVO MODULO DE PROGRESO PARA ALUMNOS


// Logros del alumno
// Obtener todos los logros o filtrarlos por student_id
router.get('/student-achievements', OBRS_StudentAchievements_CTS);

// Obtener un logro específico por ID
router.get('/student-achievements/:id', OBR_StudentAchievement_CTS);

// Crear nuevo logro
router.post('/student-achievements', CR_StudentAchievement_CTS);

// Actualizar logro por ID
router.put('/student-achievements/:id', UR_StudentAchievement_CTS);

// Eliminar logro por ID
router.delete('/student-achievements/:id', ER_StudentAchievement_CTS);

export default router;
