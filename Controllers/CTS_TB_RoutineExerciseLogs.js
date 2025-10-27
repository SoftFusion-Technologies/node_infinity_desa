/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 08/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Controladores para manejar operaciones CRUD en el modelo routine_exercise_logs.
 * Tema: Controladores - RoutineExerciseLogs
 * Capa: Backend
 */

import RoutineExerciseLogsModel from '../Models/MD_TB_RoutineExerciseLogs.js';

// Obtener todos los registros de logs o filtrar por ejercicio/alumno
export const OBRS_RoutineExerciseLogs_CTS = async (req, res) => {
  try {
    const { student_id, routine_exercise_id } = req.query;
    const whereClause = {};
    if (student_id) whereClause.student_id = student_id;
    if (routine_exercise_id)
      whereClause.routine_exercise_id = routine_exercise_id;

    const registros = await RoutineExerciseLogsModel.findAll({
      where: whereClause
    });
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ mensajeError: 'Error al obtener logs' });
  }
};

// Obtener un log por ID
export const OBR_RoutineExerciseLog_CTS = async (req, res) => {
  try {
    const registro = await RoutineExerciseLogsModel.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });
    }
    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo log (registro de peso)
export const CR_RoutineExerciseLog_CTS = async (req, res) => {
  try {
    const log = req.body;

    const nuevoLog = await RoutineExerciseLogsModel.create(log);
    return res.json({
      message: 'Registro de peso creado correctamente',
      nuevoLog
    });
  } catch (error) {
    console.error('Error al crear log:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};


// Eliminar un log por ID
export const ER_RoutineExerciseLog_CTS = async (req, res) => {
  try {
    const { logId } = req.params;
    const filasEliminadas = await RoutineExerciseLogsModel.destroy({
      where: { id: logId }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });
    }
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un log por ID (si se permite)
export const UR_RoutineExerciseLog_CTS = async (req, res) => {
  try {
    const { logId } = req.params;
    const datosActualizar = req.body;

    const [numFilasActualizadas] = await RoutineExerciseLogsModel.update(
      datosActualizar,
      { where: { id: logId } }
    );

    if (numFilasActualizadas === 1) {
      const logActualizado = await RoutineExerciseLogsModel.findByPk(logId);
      return res.json({
        message: 'Registro actualizado correctamente',
        logActualizado
      });
    } else {
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });
    }
  } catch (error) {
    return res.status(500).json({ mensajeError: error.message });
  }
};

// Obtener el último log (registro más reciente) por alumno y ejercicio
export const OBR_LastRoutineExerciseLog_CTS = async (req, res) => {
  try {
    const { student_id, routine_exercise_id } = req.query;
    if (!student_id || !routine_exercise_id) {
      return res.status(400).json({ mensajeError: 'Faltan parámetros' });
    }
    const ultimoLog = await RoutineExerciseLogsModel.findOne({
      where: { student_id, routine_exercise_id },
      order: [
        ['fecha', 'DESC'],
        ['id', 'DESC']
      ]
    });
    if (!ultimoLog) {
      return res.status(404).json({ mensaje: 'No hay registros previos' });
    }
    res.json(ultimoLog);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

export const OBRS_ExercisesWithLastLog_CTS = async (req, res) => {
  try {
    const { routine_id, student_id } = req.query;
    if (!routine_id || !student_id) {
      return res.status(400).json({ mensajeError: 'Faltan parámetros' });
    }

    // Traer todos los ejercicios de la rutina
    const exercises = await RoutineExerciseModel.findAll({
      where: { routine_id },
      raw: true
    });

    // Traer todos los logs del alumno para estos ejercicios
    const exerciseIds = exercises.map((ej) => ej.id);
    const logs = await RoutineExerciseLogsModel.findAll({
      where: {
        routine_exercise_id: exerciseIds,
        student_id
      },
      order: [
        ['fecha', 'DESC'],
        ['id', 'DESC']
      ],
      raw: true
    });

    // Mapear el último log de cada ejercicio
    const logsMap = {};
    logs.forEach((log) => {
      if (!logsMap[log.routine_exercise_id]) {
        logsMap[log.routine_exercise_id] = log;
      }
    });

    // Unir datos para el frontend
    const result = exercises.map((ej) => ({
      ...ej,
      ultimo_log: logsMap[ej.id] || null
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// GET /routine_exercise_logs/history?student_id=XX&routine_exercise_id=YY&limit=3
export const OBR_HistoryRoutineExerciseLogs_CTS = async (req, res) => {
  try {
    const { student_id, routine_exercise_id, limit = 3 } = req.query;
    if (!student_id || !routine_exercise_id) {
      return res.status(400).json({ mensajeError: 'Faltan parámetros' });
    }
    const logs = await RoutineExerciseLogsModel.findAll({
      where: { student_id, routine_exercise_id },
      order: [['fecha', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit),
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
