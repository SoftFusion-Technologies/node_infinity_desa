/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_StudentProgress.js) contiene controladores para manejar operaciones CRUD en el modelo student_progress.
 * Tema: Controladores - StudentProgress
 * Capa: Backend
 */

import StudentProgressModel from '../../Models/AlumnProgress/MD_TB_StudentProgress.js';

// Obtener progresos por student_id, opcionalmente filtrar por fecha
export const OBRS_StudentProgress_CTS = async (req, res) => {
  try {
    const { student_id, fecha } = req.query;

    if (!student_id) {
      return res.status(400).json({ mensajeError: 'student_id es requerido' });
    }

    const whereClause = { student_id };
    if (fecha) whereClause.fecha = fecha;

    const progresos = await StudentProgressModel.findAll({
      where: whereClause,
      order: [['fecha', 'DESC']]
    });

    res.json(progresos);
  } catch (error) {
    console.error('Error al obtener progresos:', error);
    res.status(500).json({ mensajeError: 'Error al obtener progresos' });
  }
};

// Obtener un progreso por ID
export const OBR_StudentProgress_CTS = async (req, res) => {
  try {
    const progreso = await StudentProgressModel.findByPk(req.params.id);

    if (!progreso) {
      return res.status(404).json({ mensajeError: 'Progreso no encontrado' });
    }

    res.json(progreso);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear nuevo progreso
export const CR_StudentProgress_CTS = async (req, res) => {
  try {
    const datos = req.body;
    const { student_id, fecha } = datos;

    if (!student_id || !fecha) {
      return res
        .status(400)
        .json({ mensajeError: 'student_id y fecha son requeridos' });
    }

    // Buscar progreso existente para student_id y fecha
    const progresoExistente = await StudentProgressModel.findOne({
      where: { student_id, fecha }
    });

    if (progresoExistente) {
      // Actualizar progreso existente
      await StudentProgressModel.update(datos, {
        where: { id: progresoExistente.id }
      });

      const progresoActualizado = await StudentProgressModel.findByPk(
        progresoExistente.id
      );

      return res.json({
        message: 'Progreso actualizado correctamente',
        progreso: progresoActualizado
      });
    } else {
      // Crear nuevo progreso
      const nuevoProgreso = await StudentProgressModel.create(datos);

      return res.json({
        message: 'Progreso creado correctamente',
        progreso: nuevoProgreso
      });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar progreso por ID
export const UR_StudentProgress_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizar = {
      peso_kg: req.body.peso,
      altura_cm: req.body.altura,
      grasa_corporal: req.body.grasa_corporal,
      cintura_cm: req.body.cintura,
      comentario: req.body.comentario
    };

    console.log('ID recibido para update:', id);
    console.log('Datos a actualizar:', datosActualizar);

    // Primero verificar si existe el registro
    const registroExistente = await StudentProgressModel.findByPk(id);
    if (!registroExistente) {
      return res
        .status(404)
        .json({ mensajeError: 'Progreso no encontrado antes de update' });
    }

    const [numFilasActualizadas] = await StudentProgressModel.update(
      datosActualizar,
      { where: { id } }
    );
    

    console.log('Filas actualizadas:', numFilasActualizadas);

    if (numFilasActualizadas === 0) {
      // No se modificó nada, pero el registro existe, retornamos el registro igual
      return res.json({
        message: 'No se modificaron datos (igual existe el progreso)',
        progresoActualizado: registroExistente
      });
    }

    // Si update afectó filas, buscar y retornar
    const progresoActualizado = await StudentProgressModel.findByPk(id);
    return res.json({
      message: 'Progreso actualizado correctamente',
      progresoActualizado
    });
  } catch (error) {
    console.error('Error en update progreso:', error);
    return res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar progreso por ID
export const ER_StudentProgress_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const filasEliminadas = await StudentProgressModel.destroy({
      where: { id }
    });

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensajeError: 'Progreso no encontrado' });
    }

    res.json({ message: 'Progreso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar progreso:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
