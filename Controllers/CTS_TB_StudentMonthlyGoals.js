/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 01 /06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_StudentMonthlyGoals.js) contiene controladores para manejar operaciones CRUD en el modelo student_monthly_goals.
 * Tema: Controladores - StudentMonthlyGoals
 * Capa: Backend
 */

import StudentMonthlyGoalsModel from '../Models/MD_TB_StudentMonthlyGoals.js';

// Obtener objetivos por student_id, opcionalmente filtrar por mes y año
export const OBRS_StudentMonthlyGoals_CTS = async (req, res) => {
  try {
    const { student_id, mes, anio } = req.query;

    if (!student_id) {
      return res.status(400).json({ mensajeError: 'student_id es requerido' });
    }

    const whereClause = { student_id };
    if (mes) whereClause.mes = mes;
    if (anio) whereClause.anio = anio;

    const objetivos = await StudentMonthlyGoalsModel.findAll({
      where: whereClause,
      order: [
        ['anio', 'DESC'],
        ['mes', 'DESC']
      ]
    });

    res.json(objetivos);
  } catch (error) {
    console.error('Error al obtener objetivos:', error);
    res.status(500).json({ mensajeError: 'Error al obtener objetivos' });
  }
};

// Obtener el objetivo mensual por student_id
export const OBR_StudentMonthlyGoals_CTS = async (req, res) => {
  try {
    const objetivo = await StudentMonthlyGoalsModel.findOne({
      where: { student_id: req.params.id }
    });

    if (!objetivo) {
      return res
        .status(404)
        .json({ mensajeError: 'Objetivo no encontrado para este estudiante' });
    }

    res.json(objetivo);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear uno o varios objetivos
export const CR_StudentMonthlyGoals_CTS = async (req, res) => {
  try {
    const objetivos = req.body;

    if (Array.isArray(objetivos)) {
      const nuevosObjetivos = await StudentMonthlyGoalsModel.bulkCreate(
        objetivos,
        {
          updateOnDuplicate: ['objetivo', 'updated_at']
        }
      );
      return res.json({
        message: 'Objetivos creados o actualizados correctamente',
        nuevosObjetivos
      });
    } else {
      // Verificamos si ya existe objetivo para ese student_id + mes + anio para evitar duplicados
      const existente = await StudentMonthlyGoalsModel.findOne({
        where: {
          student_id: objetivos.student_id,
          mes: objetivos.mes,
          anio: objetivos.anio
        }
      });

      if (existente) {
        return res.status(409).json({
          mensajeError:
            'Ya existe un objetivo para este estudiante en el mes y año indicados'
        });
      }

      const nuevoObjetivo = await StudentMonthlyGoalsModel.create(objetivos);
      return res.json({
        message: 'Objetivo creado correctamente',
        nuevoObjetivo
      });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un objetivo por ID
export const UR_StudentMonthlyGoals_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizar = req.body;

    const [numFilasActualizadas] = await StudentMonthlyGoalsModel.update(
      datosActualizar,
      {
        where: { id }
      }
    );

    if (numFilasActualizadas === 1) {
      const objetivoActualizado = await StudentMonthlyGoalsModel.findByPk(id);
      return res.json({
        message: 'Objetivo actualizado correctamente',
        objetivoActualizado
      });
    } else {
      return res.status(404).json({ mensajeError: 'Objetivo no encontrado' });
    }
  } catch (error) {
    return res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un objetivo por ID
export const ER_StudentMonthlyGoals_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await StudentMonthlyGoalsModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Objetivo no encontrado' });
    }

    res.json({ message: 'Objetivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar objetivo:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
