/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo establece las relaciones entre los modelos Sequelize del sistema de rutinas.
 * Incluye asociaciones entre estudiantes, rutinas, bloques, ejercicios, series y progreso.
 *
 * Tema: Asociaciones Sequelize - Sistema de Rutinas
 *
 * Capa: Backend
 */

// Importación de modelos
import StudentsModel from '../MD_TB_Students.js';
import RutinasModel from './MD_TB_Rutinas.js';
import BloquesModel from './MD_TB_Bloques.js';
import EjerciciosModel from './MD_TB_Ejercicios.js';
import SeriesModel from './MD_TB_Series.js';
import ProgresoRutinaAlumnoModel from './MD_TB_ProgresoRutinaAlumno.js';
// 📝 NUEVO: logs de serie (routine_exercise_logs con FK serie_id)
import RoutineExerciseLogsModel from '../MD_TB_RoutineExerciseLogs.js';

import { UserModel } from '../MD_TB_Users.js';
import PseRegistrosModel from './MD_TB_PseRegistros.js';

// 🧑‍🏫 Student → Rutinas
StudentsModel.hasMany(RutinasModel, {
  foreignKey: 'student_id',
  as: 'rutinas'
});
RutinasModel.belongsTo(StudentsModel, {
  foreignKey: 'student_id',
  as: 'alumno'
});

// 📚 Rutina → Bloques
RutinasModel.hasMany(BloquesModel, {
  foreignKey: 'rutina_id',
  as: 'bloques'
});
BloquesModel.belongsTo(RutinasModel, {
  foreignKey: 'rutina_id',
  as: 'rutina'
});

// 🧱 Bloque → Ejercicios
BloquesModel.hasMany(EjerciciosModel, {
  foreignKey: 'bloque_id',
  as: 'ejercicios'
});
EjerciciosModel.belongsTo(BloquesModel, {
  foreignKey: 'bloque_id',
  as: 'bloque'
});

// 🏋️‍♂️ Ejercicio → Series
EjerciciosModel.hasMany(SeriesModel, {
  foreignKey: 'ejercicio_id',
  as: 'series'
});
SeriesModel.belongsTo(EjerciciosModel, {
  foreignKey: 'ejercicio_id',
  as: 'ejercicio'
});

// ✅ Progreso → Student
StudentsModel.hasMany(ProgresoRutinaAlumnoModel, {
  foreignKey: 'student_id',
  as: 'progresos'
});
ProgresoRutinaAlumnoModel.belongsTo(StudentsModel, {
  foreignKey: 'student_id',
  as: 'alumno'
});

// ✅ Progreso → Rutina / Bloque / Ejercicio / Serie
RutinasModel.hasMany(ProgresoRutinaAlumnoModel, {
  foreignKey: 'rutina_id',
  as: 'progresos_rutina'
});
BloquesModel.hasMany(ProgresoRutinaAlumnoModel, {
  foreignKey: 'bloque_id',
  as: 'progresos_bloque'
});
EjerciciosModel.hasMany(ProgresoRutinaAlumnoModel, {
  foreignKey: 'ejercicio_id',
  as: 'progresos_ejercicio'
});
SeriesModel.hasMany(ProgresoRutinaAlumnoModel, {
  foreignKey: 'serie_id',
  as: 'progresos_serie'
});

ProgresoRutinaAlumnoModel.belongsTo(RutinasModel, {
  foreignKey: 'rutina_id',
  as: 'rutina'
});
ProgresoRutinaAlumnoModel.belongsTo(BloquesModel, {
  foreignKey: 'bloque_id',
  as: 'bloque'
});
ProgresoRutinaAlumnoModel.belongsTo(EjerciciosModel, {
  foreignKey: 'ejercicio_id',
  as: 'ejercicio'
});
ProgresoRutinaAlumnoModel.belongsTo(SeriesModel, {
  foreignKey: 'serie_id',
  as: 'serie'
});

// 📝 NUEVO: Series ↔ Logs (un serie tiene muchos logs)
SeriesModel.hasMany(RoutineExerciseLogsModel, {
  foreignKey: 'serie_id',
  as: 'logs' // ej: include: [{ model: SeriesModel, as: 'serie', include: [{ as: 'logs' }] }]
});
RoutineExerciseLogsModel.belongsTo(SeriesModel, {
  foreignKey: 'serie_id',
  as: 'serie'
});

// 📝 NUEVO: Student ↔ Logs (un alumno tiene muchos logs)
StudentsModel.hasMany(RoutineExerciseLogsModel, {
  foreignKey: 'student_id',
  as: 'logs_peso'
});
RoutineExerciseLogsModel.belongsTo(StudentsModel, {
  foreignKey: 'student_id',
  as: 'alumno'
});

// Usuario → Rutinas asignadas (por instructor_id)
UserModel.hasMany(RutinasModel, {
  foreignKey: 'instructor_id',
  as: 'rutinas_asignadas',   // ✅ alias nuevo, no choca con 'rutinas'
  onDelete: 'SET NULL',      // si se elimina el usuario, se deja NULL el instructor_id
  onUpdate: 'CASCADE'
});

// Rutina → Usuario (como instructor)
RutinasModel.belongsTo(UserModel, {
  foreignKey: 'instructor_id',
  as: 'instructor',          // ✅ alias nuevo, no choca con 'alumno'
  constraints: true
});

/* ===========================
 * PSE/RPE: asociaciones nuevas
 * =========================== */

// PSE pertenece a Student / Rutina / Bloque / Ejercicio / Serie
PseRegistrosModel.belongsTo(StudentsModel,  { foreignKey: 'student_id',  as: 'alumno' });
PseRegistrosModel.belongsTo(RutinasModel,   { foreignKey: 'rutina_id',   as: 'rutina' });
PseRegistrosModel.belongsTo(BloquesModel,   { foreignKey: 'bloque_id',   as: 'bloque' });
PseRegistrosModel.belongsTo(EjerciciosModel,{ foreignKey: 'ejercicio_id',as: 'ejercicio' });
PseRegistrosModel.belongsTo(SeriesModel,    { foreignKey: 'serie_id',    as: 'serie' });

// Inversas: cada entidad tiene muchos registros PSE
StudentsModel.hasMany(PseRegistrosModel,  { foreignKey: 'student_id',  as: 'pse_registros' });
RutinasModel.hasMany(PseRegistrosModel,   { foreignKey: 'rutina_id',   as: 'pse_rutina' });
BloquesModel.hasMany(PseRegistrosModel,   { foreignKey: 'bloque_id',   as: 'pse_bloque' });
EjerciciosModel.hasMany(PseRegistrosModel,{ foreignKey: 'ejercicio_id',as: 'pse_ejercicio' });
SeriesModel.hasMany(PseRegistrosModel,    { foreignKey: 'serie_id',    as: 'pse_serie' });
