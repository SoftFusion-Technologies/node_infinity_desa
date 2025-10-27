/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_StudentAchievements.js) contiene controladores para manejar operaciones CRUD en el modelo student_achievements.
 * Tema: Controladores - StudentAchievements
 * Capa: Backend
 */

import StudentAchievementsModel from '../../Models/AlumnProgress/MD_TB_StudentAchievements.js';

// Obtener todos los logros por student_id (con filtros opcionales)
export const OBRS_StudentAchievements_CTS = async (req, res) => {
  try {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ mensajeError: 'student_id es requerido' });
    }

    const logros = await StudentAchievementsModel.findAll({
      where: { student_id },
      order: [['fecha', 'DESC']]
    });

    res.json(logros);
  } catch (error) {
    console.error('Error al obtener logros:', error);
    res.status(500).json({ mensajeError: 'Error al obtener logros' });
  }
};

// Obtener un logro por ID
export const OBR_StudentAchievement_CTS = async (req, res) => {
  try {
    const logro = await StudentAchievementsModel.findByPk(req.params.id);

    if (!logro) {
      return res.status(404).json({ mensajeError: 'Logro no encontrado' });
    }

    res.json(logro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo logro
export const CR_StudentAchievement_CTS = async (req, res) => {
  try {
    const datos = req.body;

    if (!datos.student_id || !datos.titulo || !datos.fecha) {
      return res.status(400).json({
        mensajeError:
          'Campos obligatorios faltantes (student_id, titulo, fecha)'
      });
    }

    const nuevoLogro = await StudentAchievementsModel.create(datos);

    res.json({
      message: 'Logro creado correctamente',
      nuevoLogro
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un logro por ID
export const UR_StudentAchievement_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizar = req.body;

    const [numFilasActualizadas] = await StudentAchievementsModel.update(
      datosActualizar,
      {
        where: { id }
      }
    );

    if (numFilasActualizadas === 1) {
      const logroActualizado = await StudentAchievementsModel.findByPk(id);
      return res.json({
        message: 'Logro actualizado correctamente',
        logroActualizado
      });
    } else {
      return res.status(404).json({ mensajeError: 'Logro no encontrado' });
    }
  } catch (error) {
    return res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un logro por ID
export const ER_StudentAchievement_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await StudentAchievementsModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Logro no encontrado' });
    }

    res.json({ message: 'Logro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar logro:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
