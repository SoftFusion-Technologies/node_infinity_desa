/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 23 /05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_Students.js) contiene controladores para manejar operaciones CRUD en el modelo Sequelize de students.
 *
 * Tema: Controladores - Students
 *
 * Capa: Backend
 *
 * Nomenclatura: OBR_ obtenerRegistro
 *               OBRS_obtenerRegistros(plural)
 *               CR_ crearRegistro
 *               ER_ eliminarRegistro
 */

// Importa el modelo de students
import StudentsModel from '../Models/MD_TB_Students.js';

// Mostrar todos los registros de StudentsModel o filtrar por query
// controller
import { Op } from 'sequelize';

export const OBRS_Students_CTS = async (req, res) => {
  try {
    const { user_id, rutina_tipo, mode, viewer_id } = req.query;

    // Admin u otros filtros simples
    if (mode !== 'instructor') {
      const whereClause = {};
      if (user_id) whereClause.user_id = user_id;
      if (rutina_tipo) whereClause.rutina_tipo = rutina_tipo;

      const registros = await StudentsModel.findAll({ where: whereClause });
      return res.json(registros);
    }

    // --- MODO INSTRUCTOR ---
    const viewerId = Number.parseInt(viewer_id, 10);
    if (!viewerId) {
      return res.status(400).json({ mensajeError: 'viewer_id requerido' });
    }

    // 1) Generales de TODOS
    const generales = await StudentsModel.findAll({
      where: { rutina_tipo: 'general' }
    });

    // 2) Mis personalizados (solo los del viewer)
    const misPersonalizados = await StudentsModel.findAll({
      where: { user_id: viewerId, rutina_tipo: 'personalizado' }
    });

    // Unimos
    const registros = [...generales, ...misPersonalizados];

    return res.json(registros);
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    res.status(500).json({ mensajeError: 'Error al obtener alumnos' });
  }
};

// Mostrar un registro específico de StudentsModel por su ID
export const OBR_Students_CTS = async (req, res) => {
  try {
    const registro = await StudentsModel.findByPk(req.params.id);
    if (registro) {
      res.json(registro);
    } else {
      res.status(404).json({ mensajeError: 'Alumno no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo registro en StudentsModel
export const CR_Students_CTS = async (req, res) => {
  try {
    const registro = await StudentsModel.create(req.body);
    res.json({ message: 'Alumno creado correctamente', registro });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un registro en StudentsModel por su ID
export const ER_Students_CTS = async (req, res) => {
  try {
    const deletedCount = await StudentsModel.destroy({
      where: { id: req.params.id }
    });
    if (deletedCount === 1) {
      res.json({ message: 'Alumno eliminado correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'Alumno no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un registro en StudentsModel por su ID
export const UR_Students_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [numRowsUpdated] = await StudentsModel.update(req.body, {
      where: { id }
    });

    if (numRowsUpdated === 1) {
      const registroActualizado = await StudentsModel.findByPk(id);
      res.json({
        message: 'Alumno actualizado correctamente',
        registroActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Alumno no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
