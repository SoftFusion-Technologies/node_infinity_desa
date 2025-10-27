/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 16/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Asigna una rutina existente a 1..N alumnos con rango desde/hasta
 * sin clonar bloques/ejercicios/series. Idempotente por (rutina_id, student_id).
 *
 * Tema: Controladores - Rutinas (Asignaciones)
 * Capa: Backend
 */

import { Op } from 'sequelize';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(tz);

import RutinasModel from '../../Models/Rutinas_V2/MD_TB_Rutinas.js';
import RutinasAsignacionesModel from '../../Models/Rutinas_V2/MD_TB_RutinasAsignaciones.js';

const TZ = 'America/Argentina/Tucuman';

// Helpers mínimos
const toUtcTimestamp = (s, assumeStartOfDay = false) => {
  if (!s) return null;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(s));
  const str = isDateOnly
    ? `${s} ${assumeStartOfDay ? '00:00:00' : '12:00:00'}`
    : String(s);
  const d = dayjs.tz(str, 'YYYY-MM-DD HH:mm:ss', TZ);
  return d.isValid() ? d.utc().format('YYYY-MM-DD HH:mm:ss') : null;
};
const toDateOnly = (s) => {
  if (!s) return null;
  const d = dayjs.tz(String(s), ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'], TZ);
  return d.isValid() ? d.format('YYYY-MM-DD') : null;
};

// ✅ POST /rutinas/:rutina_id/asignar
export const ASIG_RutinaALote_CTS = async (req, res) => {
  try {
    const { rutina_id } = req.params;
    const { student_ids, desde, hasta } = req.body;

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res
        .status(400)
        .json({
          mensajeError: 'Debe enviar student_ids (array) con al menos 1 alumno'
        });
    }

    // Normalizar fechas (Tucumán -> UTC/DATE)
    const desdeTs = toUtcTimestamp(
      desde || dayjs().tz(TZ).format('YYYY-MM-DD'),
      true
    );
    const hastaDate = toDateOnly(hasta);

    if (!desdeTs) {
      return res.status(400).json({ mensajeError: 'Fecha "desde" inválida' });
    }
    if (hastaDate) {
      const desdeLocal = dayjs.utc(desdeTs).tz(TZ);
      const hastaLocalEnd = dayjs.tz(hastaDate, 'YYYY-MM-DD', TZ).endOf('day');
      if (desdeLocal.isAfter(hastaLocalEnd)) {
        return res
          .status(400)
          .json({ mensajeError: '"desde" no puede ser posterior a "hasta"' });
      }
    }

    // Verificar que la rutina existe
    const base = await RutinasModel.findByPk(rutina_id);
    if (!base)
      return res.status(404).json({ mensajeError: 'Rutina no encontrada' });

    // Crear/actualizar asignaciones (idempotente)
    const now = dayjs().utc().format('YYYY-MM-DD HH:mm:ss');
    const payload = student_ids.map((sid) => ({
      rutina_id: Number(rutina_id),
      student_id: Number(sid),
      desde: desdeTs,
      hasta: hastaDate,
      created_at: now,
      updated_at: now
    }));

    await RutinasAsignacionesModel.bulkCreate(payload, {
      updateOnDuplicate: ['desde', 'hasta', 'updated_at']
    });

    return res.json({
      message: 'Rutina asignada (sin clonar) correctamente',
      count: payload.length
    });
  } catch (error) {
    console.error('ASIG_RutinaALote_CTS', error);
    return res.status(500).json({ mensajeError: 'Error al asignar rutina' });
  }
};
