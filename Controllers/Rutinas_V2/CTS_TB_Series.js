/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene los controladores para manejar operaciones CRUD
 * en el modelo Sequelize de series, que forman parte de un ejercicio.
 *
 * Tema: Controladores - Series
 *
 * Capa: Backend
 *
 * Nomenclatura:
 *   OBR_  → obtenerRegistro
 *   OBRS_ → obtenerRegistros (plural)
 *   CR_   → crearRegistro
 *   ER_   → eliminarRegistro
 *   UR_   → actualizarRegistro
 */

import SeriesModel from '../../Models/Rutinas_V2/MD_TB_Series.js';
import EjerciciosModel from '../../Models/Rutinas_V2/MD_TB_Ejercicios.js';

// 🟢 Crear una nueva serie dentro de un ejercicio
export const CR_Serie_CTS = async (req, res) => {
  try {
    const { ejercicio_id, numero_serie, repeticiones, descanso, tiempo, kg } =
      req.body;

    if (!ejercicio_id || numero_serie === undefined) {
      return res.status(400).json({
        mensajeError: 'Faltan datos obligatorios: ejercicio_id y numero_serie'
      });
    }

    const ejercicio = await EjerciciosModel.findByPk(ejercicio_id);
    if (!ejercicio) {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }

    const nuevaSerie = await SeriesModel.create({
      ejercicio_id,
      numero_serie,
      repeticiones,
      descanso,
      tiempo,
      kg
    });

    res.json({
      message: 'Serie creada correctamente',
      serie: nuevaSerie
    });
  } catch (error) {
    console.error('Error al crear serie:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🔄 Obtener todas las series (opcionalmente por ejercicio_id)
export const OBRS_Series_CTS = async (req, res) => {
  try {
    const { ejercicio_id } = req.query;
    const whereClause = ejercicio_id ? { ejercicio_id } : {};

    const series = await SeriesModel.findAll({
      where: whereClause,
      include: [
        {
          model: EjerciciosModel,
          as: 'ejercicio',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['numero_serie', 'ASC']]
    });

    res.json(series);
  } catch (error) {
    console.error('Error al obtener series:', error);
    res.status(500).json({ mensajeError: 'Error al obtener series' });
  }
};

// 🔍 Obtener una serie específica por ID
export const OBR_Serie_CTS = async (req, res) => {
  try {
    const serie = await SeriesModel.findByPk(req.params.id, {
      include: [
        {
          model: EjerciciosModel,
          as: 'ejercicio',
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (!serie) {
      return res.status(404).json({ mensajeError: 'Serie no encontrada' });
    }

    res.json(serie);
  } catch (error) {
    console.error('Error al obtener serie:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🛠️ Actualizar una serie por ID
export const UR_Serie_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const [filasActualizadas] = await SeriesModel.update(req.body, {
      where: { id }
    });

    if (filasActualizadas === 1) {
      const serieActualizada = await SeriesModel.findByPk(id);
      res.json({
        message: 'Serie actualizada correctamente',
        serieActualizada
      });
    } else {
      res.status(404).json({ mensajeError: 'Serie no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar serie:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🗑️ Eliminar una serie por ID
export const ER_Serie_CTS = async (req, res) => {
  try {
    const deletedCount = await SeriesModel.destroy({
      where: { id: req.params.id }
    });

    if (deletedCount === 1) {
      res.json({ message: 'Serie eliminada correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'Serie no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar serie:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
