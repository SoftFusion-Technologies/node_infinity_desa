/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 19 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_StudentRM.js) contiene controladores para manejar operaciones CRUD en el modelo Sequelize de student_rms.
 *
 * Tema: Controladores - Student RM
 *
 * Capa: Backend
 *
 * Nomenclatura: OBR_ obtenerRegistro
 *               OBRS_obtenerRegistros(plural)
 *               CR_ crearRegistro
 *               ER_ eliminarRegistro
 */

// Importa el modelo de RM
import StudentRMModel from '../Models/MD_TB_StudentRM.js';
import { Op } from 'sequelize';

// Mostrar todos los registros de RM o filtrar por student_id
export const OBRS_StudentRM_CTS = async (req, res) => {
  try {
    const { student_id } = req.query;
    const whereClause = student_id ? { student_id } : {};
    const registros = await StudentRMModel.findAll({ where: whereClause });
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener RMs:', error);
    res.status(500).json({ mensajeError: 'Error al obtener RMs' });
  }
};

// Mostrar un registro específico de RM por su ID
export const OBR_StudentRM_CTS = async (req, res) => {
  try {
    const registro = await StudentRMModel.findByPk(req.params.id);
    if (registro) {
      res.json(registro);
    } else {
      res.status(404).json({ mensajeError: 'RM no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo registro de RM
export const CR_StudentRM_CTS = async (req, res) => {
  try {
    const { student_id, ejercicio } = req.body;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // inicio del día
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1); // fin del día

    const existe = await StudentRMModel.findOne({
      where: {
        student_id,
        ejercicio,
        fecha: {
          [Op.gte]: hoy,
          [Op.lt]: mañana
        }
      }
    });

    if (existe) {
      return res.status(400).json({
        mensajeError: 'Ya se registró este ejercicio para hoy.'
      });
    }

    const registro = await StudentRMModel.create(req.body);
    res.json({ message: 'RM creado correctamente', registro });
  } catch (error) {
    console.error('Error al crear RM:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
// Eliminar un RM por su ID
export const ER_StudentRM_CTS = async (req, res) => {
  try {
    const deletedCount = await StudentRMModel.destroy({
      where: { id: req.params.id }
    });
    if (deletedCount === 1) {
      res.json({ message: 'RM eliminado correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'RM no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un RM por su ID
export const UR_StudentRM_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [numRowsUpdated] = await StudentRMModel.update(req.body, {
      where: { id }
    });

    if (numRowsUpdated === 1) {
      const registroActualizado = await StudentRMModel.findByPk(id);
      res.json({
        message: 'RM actualizado correctamente',
        registroActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'RM no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar RM:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// Obtener historial de un ejercicio específico para un alumno
export const OBRS_HistorialRM_CTS = async (req, res) => {
  try {
    const { student_id, ejercicio } = req.query;

    if (!student_id || !ejercicio) {
      return res.status(400).json({ mensajeError: 'Faltan parámetros (student_id o ejercicio)' });
    }

    const historial = await StudentRMModel.findAll({
      where: {
        student_id,
        ejercicio
      },
      attributes: ['fecha', 'rm_estimada'], // Solo lo necesario para el gráfico
      order: [['fecha', 'ASC']]
    });

    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial de RM:', error);
    res.status(500).json({ mensajeError: 'Error al obtener historial' });
  }
};