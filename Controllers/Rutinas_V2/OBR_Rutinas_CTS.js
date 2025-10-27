// Controllers/Rutinas_V2/OBR_Rutinas_CTS.js
import { Op, fn, col, where, literal } from 'sequelize';
import RutinasModel from '../../Models/Rutinas_V2/MD_TB_Rutinas.js';
import BloquesModel from '../../Models/Rutinas_V2/MD_TB_Bloques.js';
import EjerciciosModel from '../../Models/Rutinas_V2/MD_TB_Ejercicios.js';
import SeriesModel from '../../Models/Rutinas_V2/MD_TB_Series.js';
import StudentsModel from '../../Models/MD_TB_Students.js';
import UsersModel from '../../Models/MD_TB_Users.js';

export const OBR_RutinasFullList_CTS = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      instructor_id,
      student_id,
      desde, // YYYY-MM-DD
      hasta, // YYYY-MM-DD
      vigentes, // "true"
      q, // búsqueda
      orderBy = 'created_at',
      orderDir = 'DESC',
      view // "lite"
    } = req.query;

    const limit = Math.min(Number(pageSize) || 20, 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

    const whereRutina = {};
    if (instructor_id) whereRutina.instructor_id = instructor_id;
    if (student_id) whereRutina.student_id = student_id;

    // Rango por fechas (solapamiento)
    if (desde || hasta) {
      if (desde && hasta) {
        whereRutina.desde = { [Op.lte]: hasta };
        whereRutina[Op.and] = [
          { [Op.or]: [{ hasta: { [Op.gte]: desde } }, { hasta: null }] }
        ];
      } else if (desde) {
        whereRutina.desde = { [Op.gte]: desde };
      } else if (hasta) {
        whereRutina[Op.or] = [{ hasta: { [Op.lte]: hasta } }, { hasta: null }];
      }
    }

    // Vigentes hoy
    if (String(vigentes).toLowerCase() === 'true') {
      whereRutina.desde = { [Op.lte]: literal('CURRENT_DATE') };
      whereRutina[Op.and] = [
        {
          [Op.or]: [
            { hasta: { [Op.gte]: literal('CURRENT_DATE') } },
            { hasta: null }
          ]
        }
      ];
    }

    // Búsqueda por nombre/desc/alumno
    if (q && q.trim()) {
      const needle = q.trim().toLowerCase();
      whereRutina[Op.or] = [
        where(fn('LOWER', col('rutinas.nombre')), { [Op.like]: `%${needle}%` }),
        where(fn('LOWER', col('rutinas.descripcion')), {
          [Op.like]: `%${needle}%`
        }),
        where(fn('LOWER', col('alumno.nomyape')), { [Op.like]: `%${needle}%` })
      ];
    }

    // Includes
    const includeInstructor = {
      model: UsersModel,
      as: 'instructor',
      attributes: ['id', 'name', 'email'],
      required: false
    };

    const includeAlumno = {
      model: StudentsModel,
      as: 'alumno',
      attributes: ['id', 'nomyape'],
      required: false
    };

    const includeFull = [
      includeInstructor,
      includeAlumno,
      {
        model: BloquesModel,
        as: 'bloques',
        attributes: ['id', 'rutina_id', 'nombre', 'color_id', 'orden'],
        separate: true,
        order: [['orden', 'ASC']],
        include: [
          {
            model: EjerciciosModel,
            as: 'ejercicios',
            attributes: ['id', 'bloque_id', 'nombre', 'orden', 'notas'],
            separate: true,
            order: [['orden', 'ASC']],
            include: [
              {
                model: SeriesModel,
                as: 'series',
                attributes: [
                  'id',
                  'ejercicio_id',
                  'numero_serie',
                  'repeticiones',
                  'kg',
                  'descanso',
                  'tiempo'
                ],
                separate: true,
                order: [['numero_serie', 'ASC']]
              }
            ]
          }
        ]
      }
    ];

    const includeLite = [includeInstructor, includeAlumno];

    // Orden seguro (sobre columnas de rutinas)
    const orderSafe = new Set([
      'id',
      'fecha',
      'desde',
      'hasta',
      'created_at',
      'updated_at',
      'nombre'
    ]);
    const finalOrderBy = orderSafe.has(orderBy) ? orderBy : 'created_at';
    const finalOrderDir =
      String(orderDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await RutinasModel.findAndCountAll({
      where: whereRutina,
      include: view === 'lite' ? includeLite : includeFull,
      limit,
      offset,
      order: [[finalOrderBy, finalOrderDir]]
    });

    // Estado calculado (futura / vigente / vencida)
    const today = new Date();
    const data = rows.map((r) => {
      const d = r.desde ? new Date(r.desde) : null;
      const h = r.hasta ? new Date(r.hasta) : null;
      let estado = '—';
      if (d && d > today) estado = 'futura';
      else if (!h || h >= today) estado = 'vigente';
      else estado = 'vencida';
      return { ...r.toJSON(), estado };
    });

    res.json({
      data,
      meta: {
        page: Number(page),
        pageSize: limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error en OBR_RutinasFullList_CTS:', error);
    res.status(500).json({ mensajeError: error.message });
  }
};
