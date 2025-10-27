/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene los controladores para manejar operaciones CRUD
 * en el modelo Sequelize de rutinas.
 *
 * Tema: Controladores - Rutinas
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

import RutinasModel from '../../Models/Rutinas_V2/MD_TB_Rutinas.js';
import StudentsModel from '../../Models/MD_TB_Students.js';
import BloquesModel from '../../Models/Rutinas_V2/MD_TB_Bloques.js'; // para incluir bloques si se desea

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(tz);

const TZ = 'America/Argentina/Tucuman';

// 🔄 Mostrar todas las rutinas (con opción de filtrar por student_id)
export const OBRS_Rutinas_CTS = async (req, res) => {
  try {
    const { student_id } = req.query;
    const whereClause = student_id ? { student_id } : {};

    const rutinas = await RutinasModel.findAll({
      where: whereClause,
      include: [
        {
          model: StudentsModel,
          as: 'alumno',
          attributes: ['id', 'nomyape']
        },
        {
          model: BloquesModel,
          as: 'bloques',
          attributes: ['id', 'nombre', 'orden']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(rutinas);
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    res.status(500).json({ mensajeError: 'Error al obtener rutinas' });
  }
};

// 🔎 Mostrar una rutina específica por ID
export const OBR_Rutina_CTS = async (req, res) => {
  try {
    const rutina = await RutinasModel.findByPk(req.params.id, {
      include: [
        {
          model: StudentsModel,
          as: 'alumno',
          attributes: ['id', 'nomyape']
        },
        {
          model: BloquesModel,
          as: 'bloques',
          attributes: ['id', 'nombre', 'orden']
        }
      ]
    });

    if (!rutina) {
      return res.status(404).json({ mensajeError: 'Rutina no encontrada' });
    }

    res.json(rutina);
  } catch (error) {
    console.error('Error al obtener rutina:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🟢 Crear una nueva rutina
export const CR_Rutina_CTS = async (req, res) => {
  try {
    const { student_id, nombre, descripcion } = req.body;

    if (!student_id || !nombre) {
      return res.status(400).json({
        mensajeError: 'Faltan datos obligatorios: student_id y nombre'
      });
    }

    const nuevaRutina = await RutinasModel.create({
      student_id,
      nombre,
      descripcion
    });

    res.json({
      message: 'Rutina creada correctamente',
      rutina: nuevaRutina
    });
  } catch (error) {
    console.error('Error al crear rutina:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🗑️ Eliminar una rutina por ID
export const ER_Rutina_CTS = async (req, res) => {
  try {
    const deletedCount = await RutinasModel.destroy({
      where: { id: req.params.id }
    });

    if (deletedCount === 1) {
      res.json({ message: 'Rutina eliminada correctamente' });
    } else {
      res.status(404).json({ mensajeError: 'Rutina no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar rutina:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

// 🛠️ Actualizar una rutina por ID
export const UR_Rutina_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    const [filasActualizadas] = await RutinasModel.update(req.body, {
      where: { id }
    });

    if (filasActualizadas === 1) {
      const rutinaActualizada = await RutinasModel.findByPk(id);
      res.json({
        message: 'Rutina actualizada correctamente',
        rutinaActualizada
      });
    } else {
      res.status(404).json({ mensajeError: 'Rutina no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

export const UR_RutinaFechas_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    let { desde, hasta } = req.body ?? {};

    const rutina = await RutinasModel.findByPk(id);
    if (!rutina)
      return res.status(404).json({ mensajeError: 'Rutina no encontrada' });

    const updates = {};

    // --- DESDE (TIMESTAMP) ---
    if (typeof desde !== 'undefined') {
      // Permitimos:
      // - "YYYY-MM-DD"  -> asumimos 00:00:00 local
      // - "YYYY-MM-DD HH:mm:ss"
      let d;

      if (/^\d{4}-\d{2}-\d{2}$/.test(String(desde))) {
        // Solo fecha → agregamos hora
        d = dayjs.tz(`${desde} 00:00:00`, 'YYYY-MM-DD HH:mm:ss', TZ);
      } else {
        // Fecha y hora
        d = dayjs.tz(String(desde), 'YYYY-MM-DD HH:mm:ss', TZ);
      }

      if (!d.isValid()) {
        return res
          .status(400)
          .json({
            mensajeError:
              "Formato de 'desde' inválido (use 'YYYY-MM-DD' o 'YYYY-MM-DD HH:mm:ss')"
          });
      }

      updates.desde = d.utc().format('YYYY-MM-DD HH:mm:ss');
    }

    // --- HASTA (DATE | NULL) ---
    if (typeof hasta !== 'undefined') {
      if (hasta === null) {
        updates.hasta = null;
      } else {
        const h = dayjs.tz(String(hasta), 'YYYY-MM-DD', TZ);
        if (!h.isValid()) {
          return res
            .status(400)
            .json({
              mensajeError:
                "Formato de 'hasta' inválido (use 'YYYY-MM-DD' o null)"
            });
        }
        updates.hasta = h.format('YYYY-MM-DD');
      }
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ mensajeError: 'No se enviaron campos a actualizar' });
    }

    // Coherencia: desde <= hasta (si hasta no es null)
    const desdeEfectivoUTC = updates.desde ?? rutina.desde;
    const hastaEfectivoDate =
      typeof updates.hasta !== 'undefined' ? updates.hasta : rutina.hasta;

    if (
      desdeEfectivoUTC &&
      hastaEfectivoDate !== null &&
      typeof hastaEfectivoDate !== 'undefined'
    ) {
      const desdeLocal = dayjs.utc(desdeEfectivoUTC).tz(TZ);
      const hastaLocalEnd = dayjs
        .tz(hastaEfectivoDate, 'YYYY-MM-DD', TZ)
        .endOf('day');
      if (desdeLocal.isAfter(hastaLocalEnd)) {
        return res
          .status(400)
          .json({ mensajeError: "'desde' no puede ser posterior a 'hasta'" });
      }
    }

    await rutina.update(updates);

    return res.json({
      message: 'Fechas actualizadas correctamente',
      rutina
    });
  } catch (error) {
    console.error('UR_RutinaFechas_CTS', error);
    return res
      .status(500)
      .json({ mensajeError: 'Error al actualizar fechas de la rutina' });
  }
};
