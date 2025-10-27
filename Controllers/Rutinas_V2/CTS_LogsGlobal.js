// Controllers/RoutineExerciseLogs/CTS_LogsGlobal.js
/*
 * Programador: Benjamin Orellana
 * Fecha: 12/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Listado global de registros (routine_exercise_logs) con contexto completo:
 * Serie → Ejercicio → Bloque → Rutina, filtrado por alumno y con paginación.
 */

import { Op, col, where } from 'sequelize';

import RoutineExerciseLogsModel from '../../Models/MD_TB_RoutineExerciseLogs.js';
import SeriesModel from '../../Models/Rutinas_V2/MD_TB_Series.js';
import EjerciciosModel from '../../Models/Rutinas_V2/MD_TB_Ejercicios.js';
import BloquesModel from '../../Models/Rutinas_V2/MD_TB_Bloques.js';
import RutinasModel from '../../Models/Rutinas_V2/MD_TB_Rutinas.js';

/**
 * GET /routine_exercise_logs/global
 * Params:
 *   - student_id (req)            -> ID del alumno
 *   - page (opt, default 1)
 *   - limit (opt, default 20)
 *   - q (opt)                     -> busca en rutina/bloque/ejercicio
 *   - date_from (opt, YYYY-MM-DD)
 *   - date_to   (opt, YYYY-MM-DD)
 *   - rutina_id / bloque_id / ejercicio_id / serie_id (opt) -> filtros puntuales
 */
export const OBRS_LogsGlobalPorAlumno_CTS = async (req, res) => {
  try {
    const student_id = req.query.student_id;
    if (!student_id) {
      return res
        .status(400)
        .json({ mensajeError: 'student_id es obligatorio' });
    }

    const page = Number.parseInt(req.query.page || '1', 10);
    const limit = Number.parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const q = (req.query.q || '').trim();
    const date_from = req.query.date_from;
    const date_to = req.query.date_to;

    const rutina_id = req.query.rutina_id;
    const bloque_id = req.query.bloque_id;
    const ejercicio_id = req.query.ejercicio_id;
    const serie_id = req.query.serie_id;

    // Filtros base sobre la tabla de logs
    const whereLogs = { student_id };

    if (date_from && date_to) {
      whereLogs.fecha = { [Op.between]: [date_from, date_to] };
    } else if (date_from) {
      whereLogs.fecha = { [Op.gte]: date_from };
    } else if (date_to) {
      whereLogs.fecha = { [Op.lte]: date_to };
    }

    if (serie_id) whereLogs.serie_id = serie_id;

    // Incluimos toda la cadena para poder filtrar por IDs “arriba”
    const includeChain = [
      {
        model: SeriesModel,
        as: 'serie',
        attributes: ['id', 'numero_serie'],
        include: [
          {
            model: EjerciciosModel,
            as: 'ejercicio',
            attributes: ['id', 'nombre', 'orden'],
            include: [
              {
                model: BloquesModel,
                as: 'bloque',
                attributes: ['id', 'nombre', 'orden', 'color_id'],
                include: [
                  {
                    model: RutinasModel,
                    as: 'rutina',
                    attributes: ['id', 'nombre', 'fecha', 'student_id']
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    // Filtros por IDs en niveles superiores (usamos where sobre columnas vía col())
    const andFilters = [];
    if (ejercicio_id) {
      andFilters.push(where(col('serie->ejercicio.id'), ejercicio_id));
    }
    if (bloque_id) {
      andFilters.push(where(col('serie->ejercicio->bloque.id'), bloque_id));
    }
    if (rutina_id) {
      andFilters.push(
        where(col('serie->ejercicio->bloque->rutina.id'), rutina_id)
      );
    }

    // Búsqueda por texto en nombres (ejercicio/bloque/rutina)
    if (q) {
      andFilters.push({
        [Op.or]: [
          where(col('serie->ejercicio.nombre'), { [Op.like]: `%${q}%` }),
          where(col('serie->ejercicio->bloque.nombre'), {
            [Op.like]: `%${q}%`
          }),
          where(col('serie->ejercicio->bloque->rutina.nombre'), {
            [Op.like]: `%${q}%`
          })
        ]
      });
    }

    const whereFinal = andFilters.length
      ? { [Op.and]: [whereLogs, ...andFilters] }
      : whereLogs;

    const { count, rows } = await RoutineExerciseLogsModel.findAndCountAll({
      where: whereFinal,
      include: includeChain,
      attributes: [
        'id',
        'fecha',
        'peso',
        'observaciones',
        'student_id',
        'serie_id'
      ],
      order: [
        ['fecha', 'DESC'],
        [col('serie->ejercicio->bloque->rutina.fecha'), 'DESC'],
        ['id', 'DESC']
      ],
      distinct: true, // evita sobreconteo con joins
      subQuery: false, // mejora la paginación con include anidados
      limit,
      offset
    });

    // Estructura plana, lista para UI (breadcrumb)
    const data = rows.map((r) => {
      const ej = r.serie?.ejercicio;
      const bloq = ej?.bloque;
      const rut = bloq?.rutina;
      return {
        id: r.id,
        fecha: r.fecha,
        peso: r.peso,
        observaciones: r.observaciones,
        student_id: r.student_id,
        serie: {
          id: r.serie?.id,
          numero_serie: r.serie?.numero_serie
        },
        ejercicio: ej ? { id: ej.id, nombre: ej.nombre } : null,
        bloque: bloq
          ? { id: bloq.id, nombre: bloq.nombre, color_id: bloq.color_id }
          : null,
        rutina: rut
          ? { id: rut.id, nombre: rut.nombre, fecha: rut.fecha }
          : null
      };
    });

    res.json({ total: count, page, limit, rows: data });
  } catch (error) {
    console.error('Error logs globales:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};

/**
 * GET /routine_exercise_logs/global/:id
 * Devuelve un log con TODO el contexto por ID (útil para ver detalle o deep-link)
 */
export const OBR_LogGlobalPorId_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await RoutineExerciseLogsModel.findByPk(id, {
      include: [
        {
          model: SeriesModel,
          as: 'serie',
          attributes: ['id', 'numero_serie'],
          include: [
            {
              model: EjerciciosModel,
              as: 'ejercicio',
              attributes: ['id', 'nombre', 'orden'],
              include: [
                {
                  model: BloquesModel,
                  as: 'bloque',
                  attributes: ['id', 'nombre', 'orden', 'color_id'],
                  include: [
                    {
                      model: RutinasModel,
                      as: 'rutina',
                      attributes: ['id', 'nombre', 'fecha', 'student_id']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!row)
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });

    const ej = row.serie?.ejercicio;
    const bloq = ej?.bloque;
    const rut = bloq?.rutina;

    res.json({
      id: row.id,
      fecha: row.fecha,
      peso: row.peso,
      observaciones: row.observaciones,
      student_id: row.student_id,
      serie: { id: row.serie?.id, numero_serie: row.serie?.numero_serie },
      ejercicio: ej ? { id: ej.id, nombre: ej.nombre } : null,
      bloque: bloq
        ? { id: bloq.id, nombre: bloq.nombre, color_id: bloq.color_id }
        : null,
      rutina: rut ? { id: rut.id, nombre: rut.nombre, fecha: rut.fecha } : null
    });
  } catch (error) {
    console.error('Error log global por id:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
