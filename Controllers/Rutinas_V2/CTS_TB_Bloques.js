/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene los controladores para manejar operaciones CRUD
 * en el modelo Sequelize de bloques, que forman parte de una rutina.
 *
 * Tema: Controladores - Bloques
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

import BloquesModel from '../../Models/Rutinas_V2/MD_TB_Bloques.js';
import RutinasModel from '../../Models/Rutinas_V2/MD_TB_Rutinas.js';
import EjerciciosModel from '../../Models/Rutinas_V2/MD_TB_Ejercicios.js';

// 🟢 Crear un nuevo bloque dentro de una rutina
export const CR_Bloque_CTS = async (req, res) => {
  try {
    const { rutina_id, nombre, orden, color_id } = req.body;

    if (!rutina_id || orden === undefined) {
      return res.status(400).json({
        mensajeError: 'Faltan datos obligatorios: rutina_id y orden'
      });
    }

    // Verificar que la rutina exista
    const rutina = await RutinasModel.findByPk(rutina_id);
    if (!rutina) {
      return res.status(404).json({ mensajeError: 'Rutina no encontrada' });
    }

    const nuevoBloque = await BloquesModel.create({
      rutina_id,
      nombre,
      orden,
      color_id: color_id || null // por si viene undefined
    });

    res.json({
      message: 'Bloque creado correctamente',
      bloque: nuevoBloque
    });
  } catch (error) {
    console.error('Error al crear bloque:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🔄 Obtener todos los bloques (opcionalmente por rutina_id)
export const OBRS_Bloques_CTS = async (req, res) => {
  try {
    const { rutina_id } = req.query;
    const whereClause = rutina_id ? { rutina_id } : {};

    const bloques = await BloquesModel.findAll({
      where: whereClause,
      include: [
        {
          model: RutinasModel,
          as: 'rutina',
          attributes: ['id', 'nombre']
        },
        {
          model: EjerciciosModel,
          as: 'ejercicios',
          attributes: ['id', 'nombre', 'orden']
        }
      ],
      order: [['orden', 'ASC']]
    });

    res.json(bloques);
  } catch (error) {
    console.error('Error al obtener bloques:', error);
    res.status(500).json({ mensajeError: 'Error al obtener bloques' });
  }
};

// 🔍 Obtener un bloque específico por ID
export const OBR_Bloque_CTS = async (req, res) => {
  try {
    const bloque = await BloquesModel.findByPk(req.params.id, {
      include: [
        {
          model: RutinasModel,
          as: 'rutina',
          attributes: ['id', 'nombre']
        },
        {
          model: EjerciciosModel,
          as: 'ejercicios',
          attributes: ['id', 'nombre', 'orden']
        }
      ]
    });

    if (!bloque) {
      return res.status(404).json({ mensajeError: 'Bloque no encontrado' });
    }

    res.json(bloque);
  } catch (error) {
    console.error('Error al obtener bloque:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🛠️ Actualizar un bloque por ID
export const UR_Bloque_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [filasActualizadas] = await BloquesModel.update(req.body, {
      where: { id }
    });

    if (filasActualizadas === 1) {
      const bloqueActualizado = await BloquesModel.findByPk(id);
      res.json({
        message: 'Bloque actualizado correctamente',
        bloqueActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Bloque no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar bloque:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🗑️ Eliminar un bloque por ID
export const ER_Bloque_CTS = async (req, res) => {
  try {
    const deletedCount = await BloquesModel.destroy({
      where: { id: req.params.id }
    });

    if (deletedCount === 1) {
      res.json({ message: 'Bloque eliminado correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'Bloque no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar bloque:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
