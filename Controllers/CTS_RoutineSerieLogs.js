/*
 * Programador: Benjamin Orellana
 * Fecha: 08/08/2025
 * Versión: 1.1
 *
 * Controladores para routine_exercise_logs -> ahora usan SERIE_ID
 */

import RoutineExerciseLogsModel from '../Models/MD_TB_RoutineExerciseLogs.js';
import { Op } from 'sequelize';

// LISTAR (opcionalmente por student_id / serie_id)
export const OBRS_RoutineSerieLogs_CTS = async (req, res) => {
  try {
    const { student_id, serie_id, limit, offset } = req.query;
    const where = {};
    if (student_id) where.student_id = student_id;
    if (serie_id) where.serie_id = serie_id;

    const options = {
      where,
      order: [
        ['fecha', 'DESC'],
        ['id', 'DESC']
      ]
    };
    if (limit) options.limit = Number(limit);
    if (offset) options.offset = Number(offset);

    const rows = await RoutineExerciseLogsModel.findAll(options);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ mensajeError: 'Error al obtener logs' });
  }
};

// OBTENER por ID
export const OBR_RoutineSerieLog_CTS = async (req, res) => {
  try {
    const row = await RoutineExerciseLogsModel.findByPk(req.params.id);
    if (!row)
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// CREAR
export const CR_RoutineSerieLog_CTS = async (req, res) => {
  try {
    const { serie_id, student_id, fecha } = req.body;
    if (!serie_id || !student_id || !fecha) {
      return res
        .status(400)
        .json({
          mensajeError: 'serie_id, student_id y fecha son obligatorios'
        });
    }
    const nuevoLog = await RoutineExerciseLogsModel.create(req.body);
    res.json({ message: 'Registro de peso creado correctamente', nuevoLog });
  } catch (error) {
    console.error('Error al crear log:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// ACTUALIZAR por ID
export const UR_RoutineSerieLog_CTS = async (req, res) => {
  try {
    const { id } = req.params; // <<< usar :id en la ruta
    const [n] = await RoutineExerciseLogsModel.update(req.body, {
      where: { id }
    });
    if (n === 1) {
      const updated = await RoutineExerciseLogsModel.findByPk(id);
      return res.json({
        message: 'Registro actualizado correctamente',
        updated
      });
    }
    return res.status(404).json({ mensajeError: 'Registro no encontrado' });
  } catch (error) {
    return res.status(500).json({ mensajeError: error.message });
  }
};

// ELIMINAR por ID
export const ER_RoutineSerieLog_CTS = async (req, res) => {
  try {
    const { id } = req.params; // <<< usar :id en la ruta
    const n = await RoutineExerciseLogsModel.destroy({ where: { id } });
    if (n === 0)
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// ÚLTIMO LOG por alumno + serie
// GET /routine_exercise_logs/last?student_id=XX&serie_id=YY
export const OBR_UltimoLogSerieAlumno_CTS = async (req, res) => {
  try {
    const { student_id } = req.query;
    const serie_id = req.query.serie_id || req.query.routine_exercise_id; // compat
    if (!student_id || !serie_id) {
      return res
        .status(400)
        .json({ mensajeError: 'Faltan parámetros: student_id y serie_id' });
    }
    const ultimo = await RoutineExerciseLogsModel.findOne({
      where: { student_id, serie_id },
      order: [
        ['fecha', 'DESC'],
        ['id', 'DESC']
      ]
    });
    res.json(ultimo || null);
  } catch (error) {
    console.error('Error último log:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// HISTORIAL por alumno + serie (limit)
// GET /routine_exercise_logs/history?student_id=XX&serie_id=YY&limit=3
export const OBRS_HistorialLogSerie_CTS = async (req, res) => {
  try {
    const { student_id, limit = 3 } = req.query;
    const serie_id = req.query.serie_id || req.query.routine_exercise_id; // compat
    if (!student_id || !serie_id) {
      return res
        .status(400)
        .json({ mensajeError: 'Faltan parámetros: student_id y serie_id' });
    }
    const rows = await RoutineExerciseLogsModel.findAll({
      where: { student_id, serie_id },
      order: [
        ['fecha', 'DESC'],
        ['id', 'DESC']
      ],
      limit: Number(limit)
    });
    res.json(rows);
  } catch (error) {
    console.error('Error historial log:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
