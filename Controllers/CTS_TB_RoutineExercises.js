/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 23 /05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 *Este archivo (CTS_TB_RoutineExercises.js) contiene controladores para manejar operaciones CRUD en el modelo routine_exercises.
 * Tema: Controladores - RoutineExercises
 * Capa: Backend
 */

import RoutineExercisesModel from '../Models/MD_TB_RoutineExercises.js';
import RutinaColoresModel from '../Models/MD_TB_RutinaColores.js';

export const OBRS_RoutineExercises_CTS = async (req, res) => {
  try {
    const { routine_id } = req.query;
    const whereClause = routine_id ? { routine_id } : {};
    const registros = await RoutineExercisesModel.findAll({
      where: whereClause,
      include: [
        {
          model: RutinaColoresModel,
          as: 'color', // El alias que pusiste arriba
          attributes: ['id', 'nombre', 'color_hex', 'descripcion']
        }
      ]
    });
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ mensajeError: 'Error al obtener ejercicios' });
  }
};

export const OBR_RoutineExercises_CTS = async (req, res) => {
  try {
    const registro = await RoutineExercisesModel.findByPk(req.params.id, {
      include: [
        {
          model: RutinaColoresModel,
          as: 'color',
          attributes: ['id', 'nombre', 'color_hex', 'descripcion']
        }
      ]
    });
    if (!registro) {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }
    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo ejercicio
export const CR_RoutineExercises_CTS = async (req, res) => {
  try {
    const ejercicios = req.body;

    if (Array.isArray(ejercicios)) {
      // Crear varios ejercicios con bulkCreate
      const nuevosEjercicios = await RoutineExercisesModel.bulkCreate(
        ejercicios
      );
      return res.json({
        message: 'Ejercicios creados correctamente',
        nuevosEjercicios
      });
    } else {
      // Crear un solo ejercicio
      const nuevoEjercicio = await RoutineExercisesModel.create(ejercicios);
      return res.json({
        message: 'Ejercicio creado correctamente',
        nuevoEjercicio
      });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

export const ER_RoutineExercises_CTS = async (req, res) => {
  try {
    const { routineId, exerciseId } = req.params;

    const filasEliminadas = await RoutineExercisesModel.destroy({
      where: {
        id: exerciseId,
        routine_id: routineId
      }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }

    res.json({ message: 'Ejercicio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ejercicio:', error); // <-- Aquí imprime el error en consola
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un ejercicio por ID
export const UR_RoutineExercises_CTS = async (req, res) => {
  try {
    const { exerciseId } = req.params; // fijate que sea este, no "id"
    const datosActualizar = req.body;

    const [numFilasActualizadas] = await RoutineExercisesModel.update(
      datosActualizar,
      { where: { id: exerciseId } }
    );

    if (numFilasActualizadas === 1) {
      const ejercicioActualizado = await RoutineExercisesModel.findByPk(
        exerciseId
      );
      return res.json({
        message: 'Ejercicio actualizado correctamente',
        ejercicioActualizado
      });
    } else {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }
  } catch (error) {
    return res.status(500).json({ mensajeError: error.message });
  }
};
