/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Crea una rutina completa con bloques, ejercicios y series en una sola llamada,
 * utilizando una transacción Sequelize para mantener la integridad de los datos.
 *
 * Tema: Controladores - Rutinas Completas
 *
 * Capa: Backend
 */

import db from '../../DataBase/db.js';
import RutinasModel from '../../Models/Rutinas_V2/MD_TB_Rutinas.js';
import BloquesModel from '../../Models/Rutinas_V2/MD_TB_Bloques.js';
import EjerciciosModel from '../../Models/Rutinas_V2/MD_TB_Ejercicios.js';
import SeriesModel from '../../Models/Rutinas_V2/MD_TB_Series.js';
import StudentsModel from '../../Models/MD_TB_Students.js';
import RutinasAsignacionesModel from '../../Models/Rutinas_V2/MD_TB_RutinasAsignaciones.js';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
import { Op } from 'sequelize';
dayjs.extend(utc);
dayjs.extend(tz);

const TZ = 'America/Argentina/Tucuman';

export const OBR_RutinaCompleta_CTS = async (req, res) => {
  try {
    const rutina = await RutinasModel.findByPk(req.params.id, {
      include: [
        {
          model: BloquesModel,
          as: 'bloques',
          include: [
            {
              model: EjerciciosModel,
              as: 'ejercicios',
              include: [
                {
                  model: SeriesModel,
                  as: 'series'
                }
              ]
            }
          ]
        },
        {
          model: StudentsModel,
          as: 'alumno',
          attributes: ['id', 'nomyape']
        }
      ]
    });

    if (!rutina) {
      return res.status(404).json({ mensajeError: 'Rutina no encontrada' });
    }

    res.json(rutina);
  } catch (error) {
    console.error('Error al obtener rutina completa:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

export const CR_RutinaCompleta_CTS = async (req, res) => {
  const t = await db.transaction();
  try {
    const {
      student_id,
      instructor_id,
      nombre,
      descripcion,
      fecha,
      desde,
      hasta,
      bloques
    } = req.body;

    // Validación básica de campos obligatorios
    if (!student_id || !instructor_id || !nombre || !bloques?.length) {
      return res.status(400).json({
        mensajeError: 'Faltan datos obligatorios: student_id, nombre o bloques'
      });
    }

    // Validar si el student_id existe
    const alumno = await StudentsModel.findByPk(student_id);
    if (!alumno) {
      return res.status(404).json({
        mensajeError: `El alumno con ID ${student_id} no existe`
      });
    }

    // ✅ Validación de fechas
    const isValidDate = (d) => {
      return d && !isNaN(new Date(d).getTime());
    };

    if (!isValidDate(fecha) || !isValidDate(desde)) {
      return res.status(400).json({
        mensajeError: 'Las fechas "fecha" y "desde" deben ser válidas'
      });
    }

    // Si 'hasta' no es válida, lo dejamos como null
    const fechaHasta = isValidDate(hasta) ? hasta : null;

    // 1. Crear la rutina
    const rutina = await RutinasModel.create(
      {
        student_id,
        instructor_id: Number(instructor_id), // 👈 guardamos el instructor
        nombre,
        descripcion,
        fecha,
        desde,
        hasta: fechaHasta
      },
      { transaction: t }
    );

    // 2. Crear cada bloque
    for (const bloque of bloques) {
      const bloqueCreado = await BloquesModel.create(
        {
          rutina_id: rutina.id,
          nombre: bloque.nombre,
          orden: bloque.orden,
          color_id: bloque.color_id || null
        },
        { transaction: t }
      );

      // 3. Crear ejercicios del bloque
      for (const ejercicio of bloque.ejercicios || []) {
        const ejercicioCreado = await EjerciciosModel.create(
          {
            bloque_id: bloqueCreado.id,
            nombre: ejercicio.nombre,
            orden: ejercicio.orden,
            notas: ejercicio.notas || null
          },
          { transaction: t }
        );

        // 4. Crear series del ejercicio
        for (const serie of ejercicio.series || []) {
          await SeriesModel.create(
            {
              ejercicio_id: ejercicioCreado.id,
              numero_serie: parseInt(serie.numero_serie) || 1,
              repeticiones:
                serie.repeticiones !== '' ? parseInt(serie.repeticiones) : null,
              descanso: serie.descanso !== '' ? parseInt(serie.descanso) : null,
              tiempo: serie.tiempo !== '' ? parseInt(serie.tiempo) : null,
              kg: serie.kg !== '' ? parseFloat(serie.kg) : null
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();

    res.json({
      message: 'Rutina completa creada correctamente',
      rutina_id: rutina.id
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al crear rutina completa:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

export const OBR_UltimaRutinaAlumno_CTS = async (req, res) => {
  try {
    const { student_id } = req.params;

    const rutina = await RutinasModel.findOne({
      where: { student_id },
      order: [
        ['fecha', 'DESC'],
        ['desde', 'DESC']
      ],
      include: [
        {
          model: BloquesModel,
          as: 'bloques',
          include: [
            {
              model: EjerciciosModel,
              as: 'ejercicios',
              include: [
                {
                  model: SeriesModel,
                  as: 'series'
                }
              ]
            }
          ]
        },
        {
          model: StudentsModel,
          as: 'alumno',
          attributes: ['id', 'nomyape']
        }
      ]
    });

    if (!rutina) {
      return res
        .status(404)
        .json({ mensajeError: 'No se encontró rutina para este alumno.' });
    }

    res.json(rutina);
  } catch (error) {
    console.error('Error al obtener última rutina del alumno:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

export const OBR_RutinasDeHoyAlumno_CTS = async (req, res) => {
  try {
    const { student_id } = req.params;

    // Tomamos "hoy" en America/Argentina/Tucuman
    const start = dayjs().tz('America/Argentina/Tucuman').startOf('day');
    const end = start.add(1, 'day');

    const rutinas = await RutinasModel.findAll({
      where: {
        student_id,
        // fecha ∈ [hoy 00:00, mañana 00:00)
        fecha: {
          [Op.gte]: start.format('YYYY-MM-DD HH:mm:ss'),
          [Op.lt]: end.format('YYYY-MM-DD HH:mm:ss')
        }
      },
      include: [
        {
          model: BloquesModel,
          as: 'bloques',
          include: [
            {
              model: EjerciciosModel,
              as: 'ejercicios',
              include: [{ model: SeriesModel, as: 'series' }]
            }
          ]
        },
        { model: StudentsModel, as: 'alumno', attributes: ['id', 'nomyape'] }
      ],
      order: [
        ['fecha', 'DESC'],
        ['desde', 'DESC']
      ]
    });

    return res.json(rutinas);
  } catch (error) {
    console.error('OBR_RutinasDeHoyAlumno_CTS', error);
    res.status(500).json({ mensajeError: 'Error al obtener rutinas de hoy' });
  }
};

export const OBR_RutinasVigentesPorFechaAlumno_CTS = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { fecha } = req.query;

    // Día objetivo en hora de Tucumán
    const base = fecha ? dayjs.tz(fecha, TZ) : dayjs().tz(TZ);
    const startLocal = base.startOf('day'); // 13/08 00:00 local
    const endLocal = base.endOf('day'); // 13/08 23:59:59.999 local

    // Límites en UTC para comparar con columnas DATETIME (como `desde`)
    const startUTC = startLocal.utc().format('YYYY-MM-DD HH:mm:ss');
    const endUTC = endLocal.utc().format('YYYY-MM-DD HH:mm:ss');

    // `hasta` es DATEONLY => comparar con 'YYYY-MM-DD' en LOCAL
    const startLocalDateStr = startLocal.format('YYYY-MM-DD');

    // Intersección: empieza antes o dentro del día  -> desde <= finDelDía
    //               y no terminó antes de empezar   -> hasta IS NULL OR hasta >= inicioDelDía
    const rutinas = await RutinasModel.findAll({
      where: {
        student_id,
        [Op.and]: [
          { desde: { [Op.lte]: endUTC } },
          {
            [Op.or]: [
              {
                hasta: null,
                desde: { [Op.eq]: startUTC } // o comparar solo el YYYY-MM-DD
              },
              { hasta: { [Op.gte]: startLocalDateStr } }
            ]
          }
        ]
      },
      include: [
        {
          model: BloquesModel,
          as: 'bloques',
          include: [
            {
              model: EjerciciosModel,
              as: 'ejercicios',
              include: [{ model: SeriesModel, as: 'series' }]
            }
          ]
        },
        { model: StudentsModel, as: 'alumno', attributes: ['id', 'nomyape'] }
      ],
      order: [
        ['desde', 'DESC'],
        ['fecha', 'DESC']
      ]
    });

    return res.json(rutinas);
  } catch (error) {
    console.error('OBR_RutinasVigentesPorFechaAlumno_CTS', error);
    res
      .status(500)
      .json({ mensajeError: 'Error al obtener rutinas vigentes por fecha' });
  }
};

export const OBR_RutinasVigentesHoyAlumno_CTS = (req, res) => {
  req.query.fecha = dayjs().tz(TZ).format('YYYY-MM-DD');
  return OBR_RutinasVigentesPorFechaAlumno_CTS(req, res);
};

// ==== Helpers comunes ====

const isValidDateLoose = (s) =>
  !!s && dayjs(s, ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'], true).isValid();

const toUtcTimestamp = (s, assumeStartOfDay = false) => {
  if (!s) return null;
  let d;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(s))) {
    const base = assumeStartOfDay ? '00:00:00' : '12:00:00';
    d = dayjs.tz(`${s} ${base}`, 'YYYY-MM-DD HH:mm:ss', TZ);
  } else {
    d = dayjs.tz(String(s), 'YYYY-MM-DD HH:mm:ss', TZ);
  }
  if (!d.isValid()) return null;
  return d.utc().format('YYYY-MM-DD HH:mm:ss');
};

const toDateOnly = (s) => {
  if (!s) return null;
  const d = dayjs.tz(String(s), ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'], TZ);
  if (!d.isValid()) return null;
  return d.format('YYYY-MM-DD');
};

// Números seguros → null si no es válido
const intOrNull = (v) => {
  if (v === '' || v === null || typeof v === 'undefined') return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

const floatOrNull = (v) => {
  if (v === '' || v === null || typeof v === 'undefined') return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

export const CR_RutinaCompleta_Lote_CTS = async (req, res) => {
  // Body esperado:
  // {
  //   student_ids: number[],
  //   instructor_id: number,
  //   nombre: string,
  //   descripcion?: string,
  //   fecha?: "YYYY-MM-DD HH:mm:ss" | "YYYY-MM-DD",
  //   desde: "YYYY-MM-DD" | "YYYY-MM-DD HH:mm:ss",
  //   hasta?: "YYYY-MM-DD" | null,
  //   bloques?: Bloque[],
  //   rutina_base_id?: number // opcional: si viene, ignoramos 'bloques' y clonamos del server
  // }

  try {
    const {
      student_ids,
      instructor_id,
      nombre,
      descripcion,
      fecha,
      desde,
      hasta,
      bloques,
      rutina_base_id
    } = req.body;

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({
        mensajeError: 'Debe enviar student_ids (array) con al menos 1 alumno'
      });
    }
    if (!instructor_id || !nombre) {
      return res
        .status(400)
        .json({ mensajeError: 'Faltan datos: instructor_id o nombre' });
    }
    if (!desde && !fecha) {
      return res
        .status(400)
        .json({ mensajeError: 'Debe especificar al menos "desde" o "fecha"' });
    }

    // --- fechas normalizadas (re-usa helpers del paso 1)
    const fechaTs = toUtcTimestamp(
      fecha ?? dayjs().tz(TZ).format('YYYY-MM-DD HH:mm:ss')
    );
    const desdeTs = toUtcTimestamp(
      desde || dayjs().tz(TZ).format('YYYY-MM-DD'),
      true
    );
    const hastaDate = toDateOnly(hasta);

    if (!fechaTs || !desdeTs) {
      return res.status(400).json({
        mensajeError: 'Las fechas "fecha" y/o "desde" no son válidas'
      });
    }
    if (hastaDate) {
      const desdeLocal = dayjs.utc(desdeTs).tz(TZ);
      const hastaLocalEnd = dayjs.tz(hastaDate, 'YYYY-MM-DD', TZ).endOf('day');
      if (desdeLocal.isAfter(hastaLocalEnd)) {
        return res
          .status(400)
          .json({ mensajeError: "'desde' no puede ser posterior a 'hasta'" });
      }
    }

    // Si viene rutina_base_id, cargamos del server
    let bloquesFuente = bloques;
    if (rutina_base_id) {
      const base = await RutinasModel.findByPk(rutina_base_id, {
        include: [
          {
            model: BloquesModel,
            as: 'bloques',
            include: [
              {
                model: EjerciciosModel,
                as: 'ejercicios',
                include: [{ model: SeriesModel, as: 'series' }]
              }
            ]
          }
        ]
      });
      if (!base)
        return res
          .status(404)
          .json({ mensajeError: 'Rutina base no encontrada' });

      // Mapear al formato esperado
      bloquesFuente = (base.bloques || []).map((b, iB) => ({
        nombre: b.nombre || `Bloque ${iB + 1}`,
        orden: b.orden ?? iB + 1,
        color_id: b.color_id ?? null,
        ejercicios: (b.ejercicios || []).map((e, iE) => ({
          nombre: e.nombre || `Ejercicio ${iE + 1}`,
          orden: e.orden ?? iE + 1,
          notas: e.notas || null,
          series: (e.series || []).map((s, iS) => ({
            numero_serie: Number.isFinite(+s.numero_serie)
              ? +s.numero_serie
              : iS + 1,
            repeticiones: s.repeticiones ?? null,
            descanso: s.descanso ?? null,
            tiempo: s.tiempo ?? null,
            kg: s.kg ?? null
          }))
        }))
      }));
    }

    if (!bloquesFuente?.length) {
      return res
        .status(400)
        .json({ mensajeError: 'No hay bloques para crear la rutina' });
    }

    // Procesar uno por uno (transacción por alumno para que un fallo no tire todo)
    const resultados = [];
    for (const sid of student_ids) {
      const t = await db.transaction();
      try {
        const alumno = await StudentsModel.findByPk(sid);
        if (!alumno) {
          await t.rollback();
          resultados.push({
            student_id: sid,
            ok: false,
            error: 'Alumno no existe'
          });
          continue;
        }

        const rutina = await RutinasModel.create(
          {
            student_id: sid,
            instructor_id: Number(instructor_id),
            nombre,
            descripcion,
            fecha: fechaTs,
            desde: desdeTs,
            hasta: hastaDate
          },
          { transaction: t }
        );

        for (const b of bloquesFuente) {
          const bloqueCreado = await BloquesModel.create(
            {
              rutina_id: rutina.id,
              nombre: b.nombre,
              orden: b.orden,
              color_id: b.color_id ?? null
            },
            { transaction: t }
          );

          for (const e of b.ejercicios || []) {
            const ejercicioCreado = await EjerciciosModel.create(
              {
                bloque_id: bloqueCreado.id,
                nombre: e.nombre,
                orden: e.orden,
                notas: e.notas ?? null
              },
              { transaction: t }
            );

            for (const s of e.series || []) {
              await SeriesModel.create(
                {
                  ejercicio_id: ejercicioCreado.id,
                  numero_serie: intOrNull(s.numero_serie) ?? 1,
                  repeticiones: intOrNull(s.repeticiones),
                  descanso: intOrNull(s.descanso),
                  tiempo: intOrNull(s.tiempo),
                  kg: floatOrNull(s.kg)
                },
                { transaction: t }
              );
            }
          }
        }

        await t.commit();
        resultados.push({ student_id: sid, ok: true, rutina_id: rutina.id });
      } catch (e) {
        await t.rollback();
        resultados.push({ student_id: sid, ok: false, error: e.message });
      }
    }

    return res.json({
      message: 'Asignación en lote procesada',
      resultados
    });
  } catch (error) {
    console.error(' ', error);
    return res
      .status(500)
      .json({ mensajeError: 'Error en asignación en lote' });
  }
};


export const OBR_RutinasAsignadasHoyAlumno_CTS = async (req, res) => {
  try {
    const { student_id } = req.params;

    const startLocal = dayjs().tz(TZ).startOf('day');
    const endLocal = startLocal.endOf('day');
    const startUTC = startLocal.utc().format('YYYY-MM-DD HH:mm:ss');
    const endUTC = endLocal.utc().format('YYYY-MM-DD HH:mm:ss');
    const startLocalDateStr = startLocal.format('YYYY-MM-DD');

    const asignadas = await RutinasAsignacionesModel.findAll({
      where: {
        student_id,
        [Op.and]: [
          { desde: { [Op.lte]: endUTC } },
          {
            [Op.or]: [
              { hasta: null },
              { hasta: { [Op.gte]: startLocalDateStr } }
            ]
          }
        ]
      },
      include: [
        {
          model: RutinasModel,
          as: 'rutina',
          include: [
            {
              model: BloquesModel,
              as: 'bloques',
              include: [
                {
                  model: EjerciciosModel,
                  as: 'ejercicios',
                  include: [{ model: SeriesModel, as: 'series' }]
                }
              ]
            }
          ]
        },
        { model: StudentsModel, as: 'alumno', attributes: ['id', 'nomyape'] }
      ],
      order: [['desde', 'DESC']]
    });

    const salida = asignadas
      .filter((a) => a.rutina)
      .map((a) => {
        const r = a.rutina.toJSON();
        return {
          ...r,
          student_id: a.student_id,
          desde: a.desde,
          hasta: a.hasta,
          alumno: a.alumno || r.alumno
        };
      });

    return res.json(salida);
  } catch (e) {
    console.error('OBR_RutinasAsignadasHoyAlumno_CTS', e);
    return res
      .status(500)
      .json({ mensajeError: 'Error al obtener asignadas de hoy' });
  }
};

// GET /rutinas/asignadas/vigentes-por-fecha/:student_id?fecha=YYYY-MM-DD
export const OBR_RutinasAsignadasPorFechaAlumno_CTS = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { fecha } = req.query;

    const base = fecha ? dayjs.tz(fecha, TZ) : dayjs().tz(TZ);
    const startLocal = base.startOf('day');
    const endLocal = base.endOf('day');
    const startUTC = startLocal.utc().format('YYYY-MM-DD HH:mm:ss');
    const endUTC = endLocal.utc().format('YYYY-MM-DD HH:mm:ss');
    const startLocalDateStr = startLocal.format('YYYY-MM-DD');

    const asignadas = await RutinasAsignacionesModel.findAll({
      where: {
        student_id,
        [Op.and]: [
          { desde: { [Op.lte]: endUTC } },
          {
            [Op.or]: [
              { hasta: null },
              { hasta: { [Op.gte]: startLocalDateStr } }
            ]
          }
        ]
      },
      include: [
        {
          model: RutinasModel,
          as: 'rutina',
          include: [
            {
              model: BloquesModel,
              as: 'bloques',
              include: [
                {
                  model: EjerciciosModel,
                  as: 'ejercicios',
                  include: [{ model: SeriesModel, as: 'series' }]
                }
              ]
            }
          ]
        },
        { model: StudentsModel, as: 'alumno', attributes: ['id', 'nomyape'] }
      ],
      order: [['desde', 'DESC']]
    });

    const salida = asignadas
      .filter((a) => a.rutina)
      .map((a) => {
        const r = a.rutina.toJSON();
        return {
          ...r,
          student_id: a.student_id,
          desde: a.desde,
          hasta: a.hasta,
          alumno: a.alumno || r.alumno
        };
      });

    return res.json(salida);
  } catch (e) {
    console.error('OBR_RutinasAsignadasPorFechaAlumno_CTS', e);
    return res
      .status(500)
      .json({ mensajeError: 'Error al obtener asignadas por fecha' });
  }
};