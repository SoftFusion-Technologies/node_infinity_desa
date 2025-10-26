/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 09 / 08 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (CTS_TB_RutinaColores.js) contiene controladores para manejar operaciones CRUD en el modelo Sequelize de la tabla rutina_colores.
 * Tema: Controladores - Rutinas / Colores
 * Capa: Backend
 */

// Importa el modelo necesario
import RutinaColoresModel from '../Models/MD_TB_RutinaColores.js';

// Obtener todos los colores (con filtro opcional por nombre)
export const OBRS_RutinaColores_CTS = async (req, res) => {
  try {
    const { nombre } = req.query;
    const whereClause = nombre ? { nombre } : {};
    const colores = await RutinaColoresModel.findAll({ where: whereClause });
    res.json(colores);
  } catch (error) {
    console.error('Error al obtener colores:', error);
    res.status(500).json({ mensajeError: 'Error al obtener colores' });
  }
};

// Obtener un color por ID
export const OBR_RutinaColor_CTS = async (req, res) => {
  try {
    const color = await RutinaColoresModel.findByPk(req.params.id);
    if (color) {
      res.json(color);
    } else {
      res.status(404).json({ mensajeError: 'Color no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Crear un nuevo color
export const CR_RutinaColor_CTS = async (req, res) => {
  try {
    const { nombre, color_hex, descripcion, creado_por } = req.body;
    const nuevoColor = await RutinaColoresModel.create({
      nombre,
      color_hex,
      descripcion,
      creado_por
    });
    res.json({
      message: 'Color creado correctamente',
      id: nuevoColor.id
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Actualizar un color existente por ID
export const UR_RutinaColor_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await RutinaColoresModel.update(req.body, {
      where: { id }
    });

    if (updatedRows === 1) {
      const colorActualizado = await RutinaColoresModel.findByPk(id);
      res.json({
        message: 'Color actualizado correctamente',
        colorActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Color no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// Eliminar un color por ID
export const ER_RutinaColor_CTS = async (req, res) => {
  try {
    const deletedRows = await RutinaColoresModel.destroy({
      where: { id: req.params.id }
    });

    if (deletedRows === 1) {
      res.json({ message: 'Color eliminado correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'Color no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
