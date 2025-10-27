/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 2.0
 *
 * Descripción:
 * Controladores CRUD para RoutineRequests con referencia a ejercicios(id).
 * Filtra por instructor a través de ejercicio -> bloque -> rutina.
 * Incluye datos del alumno (student) y del ejercicio.
 * Tema: Controladores - Routine Requests
 * Capa: Backend
 */

import { Op, fn, col, where } from 'sequelize';

import RoutineRequestsModel from '../Models/MD_TB_RoutineRequests.js';
import RoutineRequestStatsModel from '../Models/MD_TB_RoutineRequestStats.js';

// Nuevos modelos/relaciones (tus paths)
import EjerciciosModel from '../Models/Rutinas_V2/MD_TB_Ejercicios.js';
import BloquesModel from '../Models/Rutinas_V2/MD_TB_Bloques.js';
import RutinasModel from '../Models/Rutinas_V2/MD_TB_Rutinas.js';
import StudentsModel from '../Models/MD_TB_Students.js';
import db from '../DataBase/db.js';
// ===============================================================
// Listar solicitudes del instructor (opcionalmente por estado)
// GET /routine-requests?instructor_id=XX&estado=pendiente|atendido
// ===============================================================
export const OBRS_RoutineRequests_CTS = async (req, res) => {
  try {
    const { estado, instructor_id } = req.query;

    if (!instructor_id) {
      return res
        .status(400)
        .json({ mensajeError: 'instructor_id es requerido' });
    }

    const registros = await RoutineRequestsModel.findAll({
      where: estado ? { estado } : {},
      include: [
        {
          model: EjerciciosModel,
          as: 'ejercicio',
          attributes: ['id', 'nombre', 'bloque_id'],
          include: [
            {
              model: BloquesModel,
              as: 'bloque',
              attributes: ['id', 'rutina_id', 'nombre', 'color_id'],
              include: [
                {
                  model: RutinasModel,
                  as: 'rutina',
                  attributes: ['id', 'instructor_id', 'nombre'],
                  where: { instructor_id } // <- requiere columna instructor_id en rutinas
                }
              ]
            }
          ]
        },
        {
          model: StudentsModel,
          as: 'student',
          attributes: ['id', 'dni', 'nomyape', 'telefono',]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(registros);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ mensajeError: 'Error al obtener solicitudes' });
  }
};

// ===============================================================
// Obtener una solicitud por ID (con alumno + jerarquía completa)
// GET /routine-requests/:id
// ===============================================================
export const OBR_RoutineRequest_CTS = async (req, res) => {
  try {
    const registro = await RoutineRequestsModel.findByPk(req.params.id, {
      include: [
        {
          model: EjerciciosModel,
          as: 'ejercicio',
          attributes: ['id', 'nombre', 'bloque_id'],
          include: [
            {
              model: BloquesModel,
              as: 'bloque',
              attributes: ['id', 'rutina_id', 'nombre', 'color_id'],
              include: [
                {
                  model: RutinasModel,
                  as: 'rutina',
                  attributes: ['id', 'instructor_id', 'nombre']
                }
              ]
            }
          ]
        },
        {
          model: StudentsModel,
          as: 'student',
          attributes: ['id', 'dni', 'nomyape']
        }
      ]
    });

    if (!registro)
      return res.status(404).json({ mensajeError: 'No encontrado' });
    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// ===============================================================
// Crear solicitud
// POST /routine-requests
// body: { student_id, ejercicio_id, mensaje }
// ===============================================================
export const CR_RoutineRequest_CTS = async (req, res) => {
  try {
    const { student_id, ejercicio_id, mensaje } = req.body;

    if (!student_id || !ejercicio_id || !mensaje) {
      return res
        .status(400)
        .json({ mensajeError: 'Faltan campos obligatorios' });
    }

    const mensajeNormalizado = mensaje.trim().toLowerCase();

    // Evita duplicados pendientes exactos por alumno+ejercicio+mensaje
    const existe = await RoutineRequestsModel.findOne({
      where: {
        student_id,
        ejercicio_id,
        estado: 'pendiente',
        [Op.and]: where(
          fn('lower', fn('trim', col('mensaje'))),
          mensajeNormalizado
        )
      }
    });

    if (existe) {
      return res.status(400).json({
        mensajeError:
          'Ya existe una solicitud pendiente para este ejercicio con el mismo mensaje'
      });
    }

    const nuevaSolicitud = await RoutineRequestsModel.create({
      student_id,
      ejercicio_id,
      mensaje,
      estado: 'pendiente'
    });

    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ mensajeError: 'Error al crear la solicitud' });
  }
};

// ===============================================================
// Eliminar solicitud
// DELETE /routine-requests/:id
// ===============================================================
export const ER_RoutineRequest_CTS = async (req, res) => {
  try {
    const deleted = await RoutineRequestsModel.destroy({
      where: { id: req.params.id }
    });
    if (!deleted)
      return res.status(404).json({ mensajeError: 'Solicitud no encontrada' });
    res.json({ message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// ===============================================================
// Actualizar solicitud
// PATCH /routine-requests/:id
// body: { mensaje?, estado? }
// ===============================================================
export const UR_RoutineRequest_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    // Whitelist de campos editables
    const { mensaje, estado } = req.body;
    const payload = {};
    if (mensaje !== undefined) payload.mensaje = mensaje;
    if (estado !== undefined) payload.estado = estado;

    const [numRowsUpdated] = await RoutineRequestsModel.update(payload, {
      where: { id }
    });
    if (numRowsUpdated !== 1) {
      return res.status(404).json({ mensajeError: 'Solicitud no encontrada' });
    }

    const registroActualizado = await RoutineRequestsModel.findByPk(id, {
      include: [
        {
          model: EjerciciosModel,
          as: 'ejercicio',
          attributes: ['id', 'nombre']
        },
        { model: StudentsModel, as: 'student', attributes: ['id', 'nomyape'] }
      ]
    });

    res.json({
      message: 'Solicitud actualizada correctamente',
      registroActualizado
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// ===============================================================
// Atender solicitud: guarda en stats y elimina la solicitud
// POST /routine-requests/:id/atender
// body: { instructor_id }
// ===============================================================
export const atenderSolicitud = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;
    const instructorId = Number(req.body.instructor_id);

    if (!instructorId) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensajeError: 'instructor_id es requerido' });
    }

    // Traigo toda la cadena y fuerzo que pertenezca al instructor
    const solicitud = await RoutineRequestsModel.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE, // evita doble atención concurrente
      include: [
        {
          model: EjerciciosModel,
          as: 'ejercicio',
          required: true,
          attributes: ['id', 'nombre', 'bloque_id'],
          include: [
            {
              model: BloquesModel,
              as: 'bloque',
              required: true,
              attributes: ['id', 'rutina_id'],
              include: [
                {
                  model: RutinasModel,
                  as: 'rutina',
                  required: true,
                  attributes: ['id'],
                  where: { instructor_id: instructorId } // 🔒 ownership en SQL
                }
              ]
            }
          ]
        }
      ]
    });

    if (!solicitud) {
      await t.rollback();
      return res
        .status(403)
        .json({ mensajeError: 'No autorizado o solicitud inexistente' });
    }

    const rutinaId = solicitud.ejercicio.bloque.rutina.id;
    const fecha = new Date();
    const fechaAtendida = fecha.toISOString().slice(0, 10); // DATEONLY

    // ✅ Guardar en stats con los nombres correctos
    await RoutineRequestStatsModel.create(
      {
        student_id: solicitud.student_id,
        ejercicio_id: solicitud.ejercicio_id,
        rutina_id: rutinaId,
        instructor_id: instructorId,
        mensaje: solicitud.mensaje,
        fecha_atendida: fechaAtendida,
        mes: fecha.getMonth() + 1,
        anio: fecha.getFullYear(),
        created_at: fecha
      },
      { transaction: t }
    );

    // 🗑️ Eliminar la solicitud original
    await solicitud.destroy({ transaction: t });

    await t.commit();
    return res.json({
      message: 'Solicitud atendida y movida a estadísticas correctamente'
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al atender solicitud:', error);
    return res.status(500).json({ mensajeError: 'Error al atender solicitud' });
  }
};