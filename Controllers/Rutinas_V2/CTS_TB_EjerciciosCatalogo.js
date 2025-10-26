/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 12/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene los controladores para manejar operaciones CRUD
 * en el modelo Sequelize de `ejercicios_catalogo`, que representa el catálogo
 * maestro de ejercicios disponibles para asignar a bloques o rutinas.
 *
 * Tema: Controladores - Ejercicios Catálogo
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

import EjerciciosCatalogoModel from '../../Models/Rutinas_V2/MD_TB_EjerciciosCatalogo.js';
import { Op, fn, col, where, literal } from 'sequelize';

// 🟢 Crear un nuevo ejercicio en el catálogo
export const CR_EjercicioCatalogo_CTS = async (req, res) => {
  try {
    const { nombre, musculo, aliases, tags, video_url } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensajeError: 'El nombre es obligatorio' });
    }

    const nuevoEjercicio = await EjerciciosCatalogoModel.create({
      nombre,
      musculo: musculo || null,
      aliases: aliases || null,
      tags: tags || null,
      video_url: video_url || null
    });

    res.json({
      message: 'Ejercicio creado correctamente',
      ejercicio: nuevoEjercicio
    });
  } catch (error) {
    console.error('Error al crear ejercicio catálogo:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🔄 Obtener todos los ejercicios del catálogo
export const OBRS_EjerciciosCatalogo_CTS = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;

    const rawQ = (req.query.q || '').trim();
    const q = rawQ.toLowerCase();
    const likeAny = `%${q}%`;
    const likeStart = `${q}%`;

    // helper para LIKE case-insensitive usando LOWER()
    const ciLike = (field) =>
      where(fn('LOWER', col(field)), { [Op.like]: likeAny });

    const whereClause = rawQ
      ? {
          [Op.or]: [
            ciLike('nombre'),
            ciLike('aliases'),
            ciLike('musculo'),
            ciLike('tags')
          ]
        }
      : {};

    // ranking: prioriza coincidencias que comienzan con q
    const rankExpr = literal(`
      CASE
        WHEN LOWER(nombre)  LIKE ${EjerciciosCatalogoModel.sequelize.escape(
          likeStart
        )} THEN 0
        WHEN LOWER(aliases) LIKE ${EjerciciosCatalogoModel.sequelize.escape(
          likeStart
        )} THEN 1
        WHEN LOWER(musculo) LIKE ${EjerciciosCatalogoModel.sequelize.escape(
          likeStart
        )} THEN 2
        WHEN LOWER(tags)    LIKE ${EjerciciosCatalogoModel.sequelize.escape(
          likeStart
        )} THEN 3
        ELSE 4
      END
    `);

    const { count, rows } = await EjerciciosCatalogoModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [
        [rankExpr, 'ASC'],
        ['nombre', 'ASC']
      ]
    });

    res.json({ rows, total: count });
  } catch (error) {
    console.error('Error al obtener ejercicios catálogo:', error);
    res.status(500).json({ mensajeError: 'Error al obtener ejercicios' });
  }
};

// 🔍 Obtener un ejercicio del catálogo por ID
export const OBR_EjercicioCatalogo_CTS = async (req, res) => {
  try {
    const ejercicio = await EjerciciosCatalogoModel.findByPk(req.params.id);

    if (!ejercicio) {
      return res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }

    res.json(ejercicio);
  } catch (error) {
    console.error('Error al obtener ejercicio catálogo:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🛠️ Actualizar un ejercicio del catálogo por ID
export const UR_EjercicioCatalogo_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const [filasActualizadas] = await EjerciciosCatalogoModel.update(req.body, {
      where: { id }
    });

    if (filasActualizadas === 1) {
      const ejercicioActualizado = await EjerciciosCatalogoModel.findByPk(id);
      res.json({
        message: 'Ejercicio actualizado correctamente',
        ejercicioActualizado
      });
    } else {
      res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar ejercicio catálogo:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🗑️ Eliminar un ejercicio del catálogo por ID
export const ER_EjercicioCatalogo_CTS = async (req, res) => {
  try {
    const deletedCount = await EjerciciosCatalogoModel.destroy({
      where: { id: req.params.id }
    });

    if (deletedCount === 1) {
      res.json({ message: 'Ejercicio eliminado correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'Ejercicio no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar ejercicio catálogo:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🔍 Buscar ejercicios del catálogo por nombre o alias
export const SEARCH_EjerciciosCatalogo_CTS = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);

    if (!q) {
      return res.json([]);
    }

    const ejercicios = await EjerciciosCatalogoModel.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${q}%` } },
          { aliases: { [Op.like]: `%${q}%` } }
        ]
      },
      order: [['nombre', 'ASC']],
      limit
    });

    res.json(ejercicios);
  } catch (error) {
    console.error('Error al buscar ejercicios catálogo:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
