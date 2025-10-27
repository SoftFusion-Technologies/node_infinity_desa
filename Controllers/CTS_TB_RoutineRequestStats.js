/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 31/05/2025
 * Versión: 1.0
 *
 * Descripción:
 * Controlador para manejar estadísticas de solicitudes atendidas (routine_request_stats)
 */

import RoutineRequestStatsModel from '../Models/MD_TB_RoutineRequestStats.js';
import UserModel from '../Models/MD_TB_Users.js';

// Consultar estadísticas por instructor, mes y año (opcional)
// export const getStats = async (req, res) => {
//   try {
//     const { instructor_id, mes, anio } = req.query;

//     const whereClause = {};
//     if (instructor_id) whereClause.instructor_id = instructor_id;
//     if (mes) whereClause.mes = mes;
//     if (anio) whereClause.anio = anio;

//     const stats = await RoutineRequestStatsModel.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: UserModel,
//           as: 'routines_stats',
//           attributes: ['name'] // usa 'name' porque así defines el campo en UsersModel
//         }
//       ]
//     });
    

//     // Opcional: mapear para enviar un JSON plano
//     const result = stats.map((stat) => ({
//       profesor_id: stat.instructor_id,
//       profesor_nombre: stat.instructor ? stat.instructor.nombre : 'Desconocido',
//       total_ayudas_resueltas: stat.total_ayudas_resueltas, // o el campo que tengas
//       mes: stat.mes,
//       anio: stat.anio
//     }));

//     res.json(result);
//   } catch (error) {
//     console.error('Error al obtener estadísticas:', error);
//     res.status(500).json({ mensajeError: 'Error al obtener estadísticas' });
//   }
// };
