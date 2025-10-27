/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene los controladores para manejar operaciones CRUD
 * en el modelo Sequelize de ejercicios, que forman parte de un bloque.
 *
 * Tema: Controladores - Ejercicios
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

import EjerciciosModel from '../../Models/Rutinas_V2/MD_TB_Ejercicios.js';
import BloquesModel from '../../Models/Rutinas_V2/MD_TB_Bloques.js';
import SeriesModel from '../../Models/Rutinas_V2/MD_TB_Series.js';

// 🟢 Crear un nuevo ejercicio dentro de un bloque
export const CR_Ejercicio_CTS = async (req, res) => {
  try {
    const { bloque_id, nombre, orden, notas } = req.body;

    if (!bloque_id || !nombre || orden === undefined) {
      return res.status(400).json({
        mensajeError: 'Faltan datos obligatorios: bloque_id, nombre y orden'
      });
    }

    const bloque = await BloquesModel.findByPk(bloque_id);
    if (!bloque) {
      return res.status(404).json({ mensajeError: 'Bloque no encontrado' });
    }

    const nuevoEjercicio = await EjerciciosModel.create({
      bloque_id,
      nombre,
      orden,
      notas
    });

    res.json({
      message: 'Ejercicio creado correctamente',
      ejercicio: nuevoEjercicio
    });
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🔄 Obtener todos los ejercicios (opcionalmente por bloque_id)
export const OBRS_Ejercicios_CTS = async (req, res) => {
  try {
    const { bloque_id } = req.query;
    const whereClause = bloque_id ? { bloque_id } : {};

    const ejercicios = await EjerciciosModel.findAll({
      where: whereClause,
      include: [
        {
          model: BloquesModel,
          as: 'bloque',
          attributes: ['id', 'nombre']
        },
        {
          model: SeriesModel,
          as: 'series',
          attributes: ['id', 'numero_serie', 'repeticiones', 'kg']
        }
      ],
      order: [['orden', 'ASC']]
    });

    res.json(ejercicios);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ mensajeError: 'Error al obtener ejercicios' });
  }
};

// 🔍 Obtener un ejercicio específico por ID
export const OBR_Ejercicio_CTS = async (req, res) => {
  try {
    const ejercicio = await EjerciciosModel.findByPk(req.params.id, {
      include: [
        {
          model: BloquesModel,
          as: 'bloque',
          attributes: ['id', 'nombre']
        },
        {
          model: SeriesModel,
          as: 'series'
        }
      ]
    });

    if (!ejercicio) {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }

    res.json(ejercicio);
  } catch (error) {
    console.error('Error al obtener ejercicio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🛠️ Actualizar un ejercicio por ID
export const UR_Ejercicio_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [filasActualizadas] = await EjerciciosModel.update(req.body, {
      where: { id }
    });

    if (filasActualizadas === 1) {
      const ejercicioActualizado = await EjerciciosModel.findByPk(id);
      res.json({
        message: 'Ejercicio actualizado correctamente',
        ejercicioActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar ejercicio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🗑️ Eliminar un ejercicio por ID
export const ER_Ejercicio_CTS = async (req, res) => {
  try {
    const deletedCount = await EjerciciosModel.destroy({
      where: { id: req.params.id }
    });

    if (deletedCount === 1) {
      res.json({ message: 'Ejercicio eliminado correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar ejercicio:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
