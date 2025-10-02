/*
 * Programador: Benjamin Orellana
 * Fecha Actualización: 01 / 10 / 2025
 * Versión: 1.2 (adaptado a usuarios con rol/local_id)
 *
 * Archivo: CTS_TB_Recaptacion.js
 * Descripción:
 * Controladores CRUD para la tabla de recaptación con alcance por rol (admin/vendedor/socio)
 * y filtros por usuario/local/mes/año.
 */

// Modelos
import MD_TB_Recaptacion from '../Models/MD_TB_Recaptacion.js';
const RecaptacionModel = MD_TB_Recaptacion.RecaptacionModel;

import NotificationModel from '../Models/MD_TB_Notifications.js';
import { Op } from 'sequelize';

import { UserModel } from '../Models/MD_TB_Users.js';
import { LocalesModel } from '../Models/MD_TB_Locales.js';

// Asociaciones
RecaptacionModel.belongsTo(UserModel, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});
UserModel.belongsTo(LocalesModel, { foreignKey: 'local_id', as: 'local' });

/* -------------------------------- Helpers -------------------------------- */

const buildDateRange = (mes, anio) => {
  if (!mes || !anio) return null;
  const m = parseInt(mes, 10);
  const y = parseInt(anio, 10);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  return { [Op.gte]: start, [Op.lt]: end };
};

// Aplica alcance por rol:
// - admin: puede ver todo; opcionalmente filtrar por usuario_id o local_id
// - vendedor / socio: debe enviar su propio usuario_id (o inferirse del token) y queda restringido a ese id
const applyScopeByRol = ({ rol, usuario_id, local_id }, where) => {
  const w = { ...where };
  if (rol !== 'admin') {
    if (!usuario_id) {
      const err = new Error('Debe enviar usuario_id para roles no admin');
      err.status = 400;
      throw err;
    }
    w.usuario_id = usuario_id;
  } else {
    if (usuario_id) w.usuario_id = usuario_id;
    // Para admin, permitir filtrar por local_id (vía include de usuario)
    // Esto se aplica en el include (ver más abajo)
  }
  return w;
};

/* ------------------------------- Controladores ------------------------------- */

// GET /recaptacion?rol=admin|vendedor|socio&usuario_id=&local_id=&mes=&anio=
export const OBRS_Recaptacion_CTS = async (req, res) => {
  const { usuario_id, rol, mes, anio, local_id } = req.query;

  try {
    let where = {};
    // Alcance por rol
    where = applyScopeByRol({ rol, usuario_id, local_id }, where);

    // Filtro fecha (mes/año)
    const fechaRange = buildDateRange(mes, anio);
    if (fechaRange) where.fecha = fechaRange;

    // Include de usuario y local (para ver a quién pertenece y en qué local)
    const include = [
      {
        model: UserModel,
        as: 'usuario',
        attributes: ['id', 'nombre', 'rol', 'local_id'],
        include: [
          {
            model: LocalesModel,
            as: 'local',
            attributes: ['id', 'nombre']
          }
        ],
        // Si rol=admin y se envía local_id, filtrar por ese local
        ...(rol === 'admin' && local_id
          ? { where: { local_id: Number(local_id) } }
          : {})
      }
    ];

    const registros = await RecaptacionModel.findAll({ where, include });
    res.json(registros);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ mensajeError: error.message || 'Error interno' });
  }
};

// GET /recaptacion/:id
export const OBR_Recaptacion_CTS = async (req, res) => {
  try {
    const registro = await RecaptacionModel.findByPk(req.params.id, {
      include: [
        {
          model: UserModel,
          as: 'usuario',
          attributes: ['id', 'nombre', 'rol', 'local_id'],
          include: [
            { model: LocalesModel, as: 'local', attributes: ['id', 'nombre'] }
          ]
        }
      ]
    });
    if (!registro)
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });
    res.json(registro);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// GET /recaptacion/pendientes/count?rol=&usuario_id=&local_id=&mes=&anio=
export const CNT_RecaptacionPendientes_CTS = async (req, res) => {
  try {
    const { usuario_id, rol, mes, anio, local_id } = req.query;

    let where = {
      enviado: false,
      respondido: false,
      agendado: false,
      convertido: false
    };

    // Alcance por rol
    where = applyScopeByRol({ rol, usuario_id, local_id }, where);

    // Filtro por mes/año
    const fechaRange = buildDateRange(mes, anio);
    if (fechaRange) where.fecha = fechaRange;

    // Si es admin y envió local_id, aplicamos filtro por local vía include
    const include =
      rol === 'admin' && local_id
        ? [
            {
              model: UserModel,
              as: 'usuario',
              attributes: [],
              where: { local_id: Number(local_id) }
            }
          ]
        : [];

    const count = await RecaptacionModel.count({ where, include });
    res.json({ count });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ mensajeError: error.message || 'Error interno' });
  }
};

// POST /recaptacion  { registros: [{...}, ...] }
export const CR_Recaptacion_CTS = async (req, res) => {
  const { registros } = req.body;

  if (!registros || !Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({
      mensajeError:
        'Formato inválido: debe enviar un array de registros no vacío'
    });
  }

  try {
    const creados = await RecaptacionModel.bulkCreate(registros);

    // Notificación opcional
    if (creados?.length) {
      await NotificationModel.create({
        title: 'Nueva lista de recaptación',
        message: `Se cargaron ${creados.length} registros nuevos.`,
        module: 'recaptacion',
        reference_id: creados[0].id,
        seen_by: [],
        created_by: 'sistema'
      });
    }

    res.json({ message: 'Registros creados correctamente', data: creados });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// DELETE /recaptacion/:id
export const ER_Recaptacion_CTS = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await RecaptacionModel.destroy({ where: { id } });

    if (!eliminado)
      return res.status(404).json({ mensajeError: 'Registro no encontrado' });

    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// PATCH /recaptacion/:id
export const UR_Recaptacion_CTS = async (req, res) => {
  const { id } = req.params;

  try {
    const [updated] = await RecaptacionModel.update(req.body, {
      where: { id }
    });

    if (updated === 1) {
      const actualizado = await RecaptacionModel.findByPk(id, {
        include: [
          {
            model: UserModel,
            as: 'usuario',
            attributes: ['id', 'nombre', 'rol', 'local_id']
          }
        ]
      });
      res.json({ message: 'Registro actualizado', actualizado });
    } else {
      res.status(404).json({ mensajeError: 'Registro no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// GET /recaptacion/colaboradores
// Devuelve usuarios (id, nombre, rol, local) que tengan al menos un registro
export const OBRS_ColaboradoresConRecaptacion = async (req, res) => {
  try {
    const registros = await RecaptacionModel.findAll({
      attributes: ['usuario_id'],
      group: ['usuario_id', 'usuario.id', 'usuario->local.id'], // asegurar group correcto con include
      include: [
        {
          model: UserModel,
          as: 'usuario',
          attributes: ['id', 'nombre', 'rol', 'local_id'],
          include: [
            { model: LocalesModel, as: 'local', attributes: ['id', 'nombre'] }
          ]
        }
      ]
    });

    const colaboradores = registros.map((r) => r.usuario).filter(Boolean);

    res.json(colaboradores);
  } catch (error) {
    res
      .status(500)
      .json({
        mensajeError: 'Error al obtener colaboradores',
        error: error.message
      });
  }
};

// DELETE /recaptacion/masiva?mes=&anio=
export const ER_RecaptacionMasiva_CTS = async (req, res) => {
  const { mes, anio } = req.query;

  if (!mes || !anio) {
    return res.status(400).json({ mensajeError: 'Debe enviar mes y año' });
  }

  try {
    const fecha = buildDateRange(mes, anio);

    const eliminados = await RecaptacionModel.destroy({
      where: { fecha }
    });

    if (eliminados === 0) {
      return res.status(200).json({
        vacio: true,
        message: 'No se encontraron registros para borrar en ese mes y año.'
      });
    }

    res.json({
      message: `Se eliminaron ${eliminados} registros del mes ${mes}/${anio}`
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// DELETE /recaptacion/masiva/por-usuario?usuario_id=
export const ER_RecaptacionMasivaPorUsuario_CTS = async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ mensajeError: 'Debe enviar usuario_id' });
  }

  try {
    const eliminados = await RecaptacionModel.destroy({
      where: { usuario_id }
    });

    if (eliminados === 0) {
      return res.status(200).json({
        vacio: true,
        message: 'No se encontraron registros para borrar de ese usuario.'
      });
    }

    res.json({
      message: `Se eliminaron ${eliminados} registros del usuario seleccionado.`
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};

// DELETE /recaptacion/masiva/por-local?local_id=  (extra útil para admin)
export const ER_RecaptacionMasivaPorLocal_CTS = async (req, res) => {
  const { local_id } = req.query;

  if (!local_id) {
    return res.status(400).json({ mensajeError: 'Debe enviar local_id' });
  }

  try {
    // primero buscamos usuarios del local
    const usuariosIds = await UserModel.findAll({
      where: { local_id: Number(local_id) },
      attributes: ['id']
    }).then((rows) => rows.map((r) => r.id));

    if (usuariosIds.length === 0) {
      return res.status(200).json({
        vacio: true,
        message: 'No hay usuarios asociados a ese local.'
      });
    }

    const eliminados = await RecaptacionModel.destroy({
      where: { usuario_id: { [Op.in]: usuariosIds } }
    });

    if (eliminados === 0) {
      return res.status(200).json({
        vacio: true,
        message: 'No se encontraron registros para borrar de ese local.'
      });
    }

    res.json({
      message: `Se eliminaron ${eliminados} registros asociados al local ${local_id}.`
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
};
