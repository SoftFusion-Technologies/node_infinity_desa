/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 23 /05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_RoutineFeedback.js) contiene controladores para manejar operaciones CRUD en el modelo RoutineFeedbackModel.
 *
 * Tema: Controladores - Routine Feedback
 * Capa: Backend
 *
 * Nomenclatura: OBR_ obtenerRegistro
 *               OBRS_obtenerRegistros(plural)
 *               CR_ crearRegistro
 *               ER_ eliminarRegistro
 */

// Importa el modelo
import RoutineFeedbackModel from '../Models/MD_TB_RoutineFeedback.js';

// Obtener todos los feedbacks o filtrar por rutina o alumno
export const OBRS_RoutineFeedback_CTS = async (req, res) => {
  try {
    const { routine_id, student_id } = req.query;
    const whereClause = {};
    if (routine_id) whereClause.routine_id = routine_id;
    if (student_id) whereClause.student_id = student_id;

    const registros = await RoutineFeedbackModel.findAll({
      where: whereClause
    });
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener feedbacks:', error);
    res.status(500).json({ mensajeError: 'Error al obtener feedbacks' });
  }
};

// Obtener un feedback específico por su ID
export const OBR_RoutineFeedback_CTS = async (req, res) => {
  try {
    const registro = await RoutineFeedbackModel.findByPk(req.params.id);
    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

export const CR_RoutineFeedback_CTS = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    const { routine_id, student_id } = req.body;

    if (!routine_id || !student_id) {
      return res.status(400).json({
        mensajeError: 'Faltan datos obligatorios: routine_id o student_id'
      });
    }

    // Validar si ya existe feedback
    const existeFeedback = await RoutineFeedbackModel.findOne({
      where: { routine_id, student_id }
    });

    if (existeFeedback) {
      return res
        .status(400)
        .json({ mensajeError: 'Ya has enviado feedback para esta rutina.' });
    }

    const registro = await RoutineFeedbackModel.create(req.body);
    res.json({ message: 'Feedback creado correctamente', registro });
  } catch (error) {
    console.error('Error al crear feedback:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un feedback por ID
export const ER_RoutineFeedback_CTS = async (req, res) => {
  try {
    const numDeleted = await RoutineFeedbackModel.destroy({
      where: { id: req.params.id }
    });
    if (numDeleted) {
      res.json({ message: 'Feedback eliminado correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'Feedback no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar feedback:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un feedback por ID
export const UR_RoutineFeedback_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [numUpdated] = await RoutineFeedbackModel.update(req.body, {
      where: { id }
    });
    if (numUpdated === 1) {
      const registroActualizado = await RoutineFeedbackModel.findByPk(id);
      res.json({
        message: 'Feedback actualizado correctamente',
        registroActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Feedback no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar feedback:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
