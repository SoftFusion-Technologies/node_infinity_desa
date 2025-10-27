/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_StudentWeeklyCheckin.js) contiene controladores para manejar operaciones CRUD en el modelo student_weekly_checkin.
 * Tema: Controladores - StudentWeeklyCheckin
 * Capa: Backend
 */

import StudentWeeklyCheckinModel from '../../Models/AlumnProgress/MD_TB_StudentWeeklyCheckin.js';

// Obtener todos los check-ins por student_id, opcionalmente filtrar por semana y año
export const OBRS_StudentWeeklyCheckin_CTS = async (req, res) => {
  try {
    const { student_id, semana, anio } = req.query;

    if (!student_id) {
      return res.status(400).json({ mensajeError: 'student_id es requerido' });
    }

    const whereClause = { student_id };
    if (semana) whereClause.semana = semana;
    if (anio) whereClause.anio = anio;

    const checkins = await StudentWeeklyCheckinModel.findAll({
      where: whereClause,
      order: [
        ['anio', 'DESC'],
        ['semana', 'DESC']
      ]
    });

    res.json(checkins);
  } catch (error) {
    console.error('Error al obtener check-ins:', error);
    res.status(500).json({ mensajeError: 'Error al obtener check-ins' });
  }
};

// Obtener un check-in por ID
export const OBR_StudentWeeklyCheckin_CTS = async (req, res) => {
  try {
    const checkin = await StudentWeeklyCheckinModel.findByPk(req.params.id);

    if (!checkin) {
      return res.status(404).json({ mensajeError: 'Check-in no encontrado' });
    }

    res.json(checkin);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo check-in
export const CR_StudentWeeklyCheckin_CTS = async (req, res) => {
  try {
    const datos = req.body;

    // Validar duplicados: no permitir más de un check-in por semana y año
    const existente = await StudentWeeklyCheckinModel.findOne({
      where: {
        student_id: datos.student_id,
        semana: datos.semana,
        anio: datos.anio
      }
    });

    if (existente) {
      return res.status(409).json({
        mensajeError:
          'Ya existe un check-in para este estudiante en la semana y año indicados'
      });
    }

    const nuevoCheckin = await StudentWeeklyCheckinModel.create(datos);

    res.json({
      message: 'Check-in creado correctamente',
      nuevoCheckin
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un check-in por ID
export const UR_StudentWeeklyCheckin_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizar = req.body;

    const [numFilasActualizadas] = await StudentWeeklyCheckinModel.update(
      datosActualizar,
      {
        where: { id }
      }
    );

    if (numFilasActualizadas === 1) {
      const checkinActualizado = await StudentWeeklyCheckinModel.findByPk(id);
      return res.json({
        message: 'Check-in actualizado correctamente',
        checkinActualizado
      });
    } else {
      return res.status(404).json({ mensajeError: 'Check-in no encontrado' });
    }
  } catch (error) {
    return res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un check-in por ID
export const ER_StudentWeeklyCheckin_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await StudentWeeklyCheckinModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Check-in no encontrado' });
    }

    res.json({ message: 'Check-in eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar check-in:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
