/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 16/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Controladores CRUD y utilitarios para PSE/RPE (tabla `pse_registros`).
 * Soporta registros por nivel (rutina, bloque, ejercicio, serie),
 * y cálculo de sRPE (carga de sesión) = rpe_real * duracion_min.
 *
 * Tema: Controladores - PSE/RPE
 * Capa: Backend
 *
 * Nomenclatura:
 *   OBR_  → obtenerRegistro
 *   OBRS_ → obtenerRegistros (plural)
 *   CR_   → crearRegistro
 *   ER_   → eliminarRegistro
 *   UR_   → actualizarRegistro
 */

import { Op, fn, col, literal } from 'sequelize';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';

import PseRegistrosModel from '../../Models/Rutinas_V2/MD_TB_PseRegistros.js';
import StudentsModel from '../../Models/MD_TB_Students.js';
import RutinasModel from '../../Models/Rutinas_V2/MD_TB_Rutinas.js';
import BloquesModel from '../../Models/Rutinas_V2/MD_TB_Bloques.js';
import EjerciciosModel from '../../Models/Rutinas_V2/MD_TB_Ejercicios.js';
import SeriesModel from '../../Models/Rutinas_V2/MD_TB_Series.js';

dayjs.extend(utc);
dayjs.extend(tz);

const TZ = 'America/Argentina/Tucuman';

/* ────────────────────────────────────────────────────────────── *
 * Helpers
 * ────────────────────────────────────────────────────────────── */

const validarRangosPorEscala = (escala, rpe_objetivo, rpe_real) => {
  const dentro = (v, min, max) =>
    v == null || (Number.isFinite(+v) && +v >= min && +v <= max);

  if (escala === 'RPE_10' || escala === 'CR10') {
    if (!dentro(rpe_objetivo, 0, 10) || !dentro(rpe_real, 0, 10)) {
      return "Con escala RPE_10/CR10, 'rpe_objetivo' y 'rpe_real' deben estar entre 0 y 10.";
    }
  } else if (escala === 'BORG_6_20') {
    if (!dentro(rpe_objetivo, 6, 20) || !dentro(rpe_real, 6, 20)) {
      return "Con escala BORG_6_20, 'rpe_objetivo' y 'rpe_real' deben estar entre 6 y 20.";
    }
  }
  return null;
};

const validarFKSegunNivel = (body) => {
  const { nivel, rutina_id, bloque_id, ejercicio_id, serie_id } = body;
  if (nivel === 'rutina' && !rutina_id)
    return "Para nivel='rutina' se requiere 'rutina_id'.";
  if (nivel === 'bloque' && !bloque_id)
    return "Para nivel='bloque' se requiere 'bloque_id'.";
  if (nivel === 'ejercicio' && !ejercicio_id)
    return "Para nivel='ejercicio' se requiere 'ejercicio_id'.";
  if (nivel === 'serie' && !serie_id)
    return "Para nivel='serie' se requiere 'serie_id'.";
  return null;
};

const buildWhere = (q) => {
  const {
    student_id,
    rutina_id,
    bloque_id,
    ejercicio_id,
    serie_id,
    nivel,
    escala,
    fecha_desde, // YYYY-MM-DD
    fecha_hasta // YYYY-MM-DD
  } = q;

  const where = {};

  if (student_id) where.student_id = student_id;
  if (rutina_id) where.rutina_id = rutina_id;
  if (bloque_id) where.bloque_id = bloque_id;
  if (ejercicio_id) where.ejercicio_id = ejercicio_id;
  if (serie_id) where.serie_id = serie_id;
  if (nivel) where.nivel = nivel;
  if (escala) where.escala = escala;

  if (fecha_desde || fecha_hasta) {
    // Interpretar límites en TZ local pero guardar comparar como UTC del campo
    const desde = fecha_desde
      ? dayjs
          .tz(`${fecha_desde} 00:00:00`, 'YYYY-MM-DD HH:mm:ss', TZ)
          .utc()
          .format('YYYY-MM-DD HH:mm:ss')
      : null;
    const hasta = fecha_hasta
      ? dayjs
          .tz(`${fecha_hasta} 23:59:59`, 'YYYY-MM-DD HH:mm:ss', TZ)
          .utc()
          .format('YYYY-MM-DD HH:mm:ss')
      : null;

    where.fecha_registro = {};
    if (desde) where.fecha_registro[Op.gte] = desde;
    if (hasta) where.fecha_registro[Op.lte] = hasta;
  }

  return where;
};

const commonInclude = [
  { model: StudentsModel, as: 'alumno', attributes: ['id', 'nomyape'] },
  { model: RutinasModel, as: 'rutina', attributes: ['id', 'nombre'] },
  { model: BloquesModel, as: 'bloque', attributes: ['id', 'nombre'] },
  { model: EjerciciosModel, as: 'ejercicio', attributes: ['id', 'nombre'] },
  { model: SeriesModel, as: 'serie', attributes: ['id', 'numero_serie'] }
];

/* ────────────────────────────────────────────────────────────── *
 * OBRS_ Listado con filtros y paginado
 * GET /pse?student_id=&rutina_id=&nivel=&fecha_desde=&fecha_hasta=&page=1&pageSize=20
 * ────────────────────────────────────────────────────────────── */
export const OBRS_PSE_CTS = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(req.query.pageSize || '20', 10), 1),
      100
    );
    const where = buildWhere(req.query);

    const { rows, count } = await PseRegistrosModel.findAndCountAll({
      where,
      include: commonInclude,
      order: [
        ['fecha_registro', 'DESC'],
        ['id', 'DESC']
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    res.json({
      data: rows,
      meta: { total: count, page, pageSize, pages: Math.ceil(count / pageSize) }
    });
  } catch (error) {
    console.error('OBRS_PSE_CTS', error);
    res.status(500).json({ mensajeError: 'Error al listar PSE' });
  }
};

/* ────────────────────────────────────────────────────────────── *
 * OBR_ Obtener por ID
 * GET /pse/:id
 * ────────────────────────────────────────────────────────────── */
export const OBR_PSE_CTS = async (req, res) => {
  try {
    const reg = await PseRegistrosModel.findByPk(req.params.id, {
      include: commonInclude
    });
    if (!reg)
      return res
        .status(404)
        .json({ mensajeError: 'Registro PSE no encontrado' });
    res.json(reg);
  } catch (error) {
    console.error('OBR_PSE_CTS', error);
    res.status(500).json({ mensajeError: 'Error al obtener PSE' });
  }
};

/* ────────────────────────────────────────────────────────────── *
 * CR_ Crear genérico
 * POST /pse
 * ────────────────────────────────────────────────────────────── */
export const CR_PSE_CTS = async (req, res) => {
  try {
    const {
      student_id,
      nivel,
      escala = 'RPE_10',
      rutina_id,
      bloque_id,
      ejercicio_id,
      serie_id,
      rpe_objetivo,
      rpe_real,
      rir,
      duracion_min,
      dolor,
      fatiga,
      comentarios,
      fecha_registro
    } = req.body || {};

    if (!student_id || !nivel) {
      return res
        .status(400)
        .json({
          mensajeError: 'Faltan datos: student_id y nivel son obligatorios.'
        });
    }

    // Validaciones lógicas
    const errFK = validarFKSegunNivel(req.body);
    if (errFK) return res.status(400).json({ mensajeError: errFK });

    const errEscala = validarRangosPorEscala(escala, rpe_objetivo, rpe_real);
    if (errEscala) return res.status(400).json({ mensajeError: errEscala });

    // Si es sesión (nivel=rutina) y querés calcular carga luego, sugiero exigir duracion_min
    if (
      nivel === 'rutina' &&
      (duracion_min == null || Number.isNaN(+duracion_min))
    ) {
      // opcional: comentar si no querés obligarlo
      // return res.status(400).json({ mensajeError: "Para nivel='rutina' se recomienda informar 'duracion_min'." });
    }

    // Normalización de fecha_registro (opcional): permitir YYYY-MM-DD HH:mm:ss local
    let fecha_db = undefined;
    if (fecha_registro) {
      const d = dayjs.tz(String(fecha_registro), 'YYYY-MM-DD HH:mm:ss', TZ);
      if (!d.isValid()) {
        return res
          .status(400)
          .json({
            mensajeError:
              "Formato inválido para 'fecha_registro' (use 'YYYY-MM-DD HH:mm:ss' local)."
          });
      }
      fecha_db = d.utc().format('YYYY-MM-DD HH:mm:ss');
    }

    const nuevo = await PseRegistrosModel.create({
      student_id,
      nivel,
      escala,
      rutina_id,
      bloque_id,
      ejercicio_id,
      serie_id,
      rpe_objetivo,
      rpe_real,
      rir,
      duracion_min,
      dolor,
      fatiga,
      comentarios,
      ...(fecha_db ? { fecha_registro: fecha_db } : {})
    });

    res.json({ message: 'PSE creado correctamente', pse: nuevo });
  } catch (error) {
    console.error('CR_PSE_CTS', error);
    res.status(500).json({ mensajeError: 'Error al crear PSE' });
  }
};

/* ────────────────────────────────────────────────────────────── *
 * CR_ Crear específico: sesión (sRPE)
 * POST /pse/sesion
 * ────────────────────────────────────────────────────────────── */
export const CR_PSE_Sesion_CTS = async (req, res) => {
  try {
    const body = { ...req.body, nivel: 'rutina' };
    return await CR_PSE_CTS({ ...req, body }, res);
  } catch (error) {
    console.error('CR_PSE_Sesion_CTS', error);
    res.status(500).json({ mensajeError: 'Error al crear PSE de sesión' });
  }
};

/* ────────────────────────────────────────────────────────────── *
 * CR_ Crear específico: serie (RPE/RIR por serie)
 * POST /pse/serie
 * ────────────────────────────────────────────────────────────── */
export const CR_PSE_Serie_CTS = async (req, res) => {
  try {
    const body = { ...req.body, nivel: 'serie' };
    return await CR_PSE_CTS({ ...req, body }, res);
  } catch (error) {
    console.error('CR_PSE_Serie_CTS', error);
    res.status(500).json({ mensajeError: 'Error al crear PSE de serie' });
  }
};

/* ────────────────────────────────────────────────────────────── *
 * UR_ Actualizar por ID
 * PATCH /pse/:id
 * ────────────────────────────────────────────────────────────── */
export const UR_PSE_CTS = async (req, res) => {
  try {
    const { id } = req.params;

    // Validaciones si vienen esos campos
    if (
      req.body.escala ||
      req.body.rpe_objetivo != null ||
      req.body.rpe_real != null
    ) {
      const esc = req.body.escala || 'RPE_10';
      const msg = validarRangosPorEscala(
        esc,
        req.body.rpe_objetivo,
        req.body.rpe_real
      );
      if (msg) return res.status(400).json({ mensajeError: msg });
    }
    if (req.body.nivel) {
      const msgFK = validarFKSegunNivel({ ...req.body });
      if (msgFK) return res.status(400).json({ mensajeError: msgFK });
    }

    // Normalizar fecha_registro si viene
    if (req.body.fecha_registro) {
      const d = dayjs.tz(
        String(req.body.fecha_registro),
        'YYYY-MM-DD HH:mm:ss',
        TZ
      );
      if (!d.isValid()) {
        return res
          .status(400)
          .json({
            mensajeError:
              "Formato inválido para 'fecha_registro' (use 'YYYY-MM-DD HH:mm:ss')."
          });
      }
      req.body.fecha_registro = d.utc().format('YYYY-MM-DD HH:mm:ss');
    }

    const [n] = await PseRegistrosModel.update(req.body, { where: { id } });
    if (n !== 1)
      return res
        .status(404)
        .json({ mensajeError: 'Registro PSE no encontrado' });

    const actualizado = await PseRegistrosModel.findByPk(id, {
      include: commonInclude
    });
    res.json({ message: 'PSE actualizado correctamente', pse: actualizado });
  } catch (error) {
    console.error('UR_PSE_CTS', error);
    res.status(500).json({ mensajeError: 'Error al actualizar PSE' });
  }
};

/* ────────────────────────────────────────────────────────────── *
 * ER_ Eliminar por ID
 * DELETE /pse/:id
 * ────────────────────────────────────────────────────────────── */
export const ER_PSE_CTS = async (req, res) => {
  try {
    const n = await PseRegistrosModel.destroy({ where: { id: req.params.id } });
    if (n === 1) return res.json({ message: 'PSE eliminado correctamente' });
    return res.status(404).json({ mensajeError: 'Registro PSE no encontrado' });
  } catch (error) {
    console.error('ER_PSE_CTS', error);
    res.status(500).json({ mensajeError: 'Error al eliminar PSE' });
  }
};

/* ────────────────────────────────────────────────────────────── *
 * OBRS_ Carga de sesión (sRPE) agregada
 * GET /pse/carga-sesion?student_id=..&rutina_id=..&fecha_desde=..&fecha_hasta=..
 * Devuelve: { carga_sesion, registros }
 * ────────────────────────────────────────────────────────────── */
export const OBRS_PSE_CargaSesion_CTS = async (req, res) => {
  try {
    const where = buildWhere({ ...req.query, nivel: 'rutina' });

    // Carga total = SUM(rpe_real * duracion_min)
    const registros = await PseRegistrosModel.findAll({
      where,
      attributes: [
        'id',
        'student_id',
        'rutina_id',
        'fecha_registro',
        'rpe_real',
        'duracion_min',
        'escala'
      ],
      order: [
        ['fecha_registro', 'DESC'],
        ['id', 'DESC']
      ]
    });

    const carga_sesion = registros.reduce((acc, r) => {
      const rpe = Number(r.rpe_real) || 0;
      const min = Number(r.duracion_min) || 0;
      return acc + rpe * min;
    }, 0);

    res.json({ carga_sesion, registros });
  } catch (error) {
    console.error('OBRS_PSE_CargaSesion_CTS', error);
    res.status(500).json({ mensajeError: 'Error al calcular carga de sesión' });
  }
};

/* ────────────────────────────────────────────────────────────── *
 * OBRS_ Último PSE por serie (para ver feedback reciente)
 * GET /pse/ultimos-por-serie?serie_ids=1,2,3
 * ────────────────────────────────────────────────────────────── */
export const OBRS_PSE_UltimosPorSerie_CTS = async (req, res) => {
  try {
    const serie_ids = String(req.query.serie_ids || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!serie_ids.length) {
      return res
        .status(400)
        .json({ mensajeError: 'Debe indicar serie_ids separados por coma.' });
    }

    // Estrategia: tomar el registro más reciente por serie_id
    const registros = await PseRegistrosModel.findAll({
      where: { serie_id: { [Op.in]: serie_ids }, nivel: 'serie' },
      include: commonInclude,
      order: [
        ['serie_id', 'ASC'],
        ['fecha_registro', 'DESC'],
        ['id', 'DESC']
      ]
    });

    // Reducir al último por serie
    const map = new Map();
    for (const r of registros) {
      const k = r.serie_id;
      if (!map.has(k)) map.set(k, r);
    }

    res.json({ data: Array.from(map.values()) });
  } catch (error) {
    console.error('OBRS_PSE_UltimosPorSerie_CTS', error);
    res
      .status(500)
      .json({ mensajeError: 'Error al obtener últimos PSE por serie' });
  }
};
