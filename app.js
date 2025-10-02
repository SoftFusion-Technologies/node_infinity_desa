import express from 'express';
import cors from 'cors';
// El Intercambio de Recursos de Origen Cruzado (CORS (en-US))
// es un mecanismo que utiliza cabeceras HTTP adicionales para permitir que un user agent (en-US)
// obtenga permiso para acceder a recursos seleccionados desde un servidor, en un origen distinto (dominio) al que pertenece.

// importamos la conexion de la base de datos
import db from './DataBase/db.js';
import GetRoutes from './Routes/routes.js';
import dotenv from 'dotenv';

import { login, authenticateToken } from './Security/auth.js'; // Importa las funciones del archivo auth.js
import { PORT } from './DataBase/config.js';
import mysql from 'mysql2/promise'; // Usar mysql2 para las promesas
import cron from 'node-cron';
import path from 'node:path';
import NotificationModel from './Models/MD_TB_Notifications.js';

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

import './Models/relaciones.js';
// Importar relaciones
// import './Models/Proveedores/relacionesProveedor.js';

// o:
// initAuthoritativeTime();

// CONFIGURACION PRODUCCION
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// const PORT = process.env.PORT || 3000;

// console.log(process.env.PORT)

const app = express();

/* 🔑 CORS configurado con whitelist y credenciales */
const CORS_WHITELIST = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    // permitir también requests sin origin (ej. curl, Postman)
    if (!origin || CORS_WHITELIST.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // 👈 permite cookies y headers con credentials: 'include'
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-client-reported-time',
    'x-time-guard-reason'
  ]
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // manejar preflight
app.use(express.json());

app.use('/', GetRoutes);
// definimos la conexion

// Para verificar si nuestra conexión funciona, lo hacemos con el método authenticate()
//  el cual nos devuelve una promesa que funciona de la siguiente manera:
// un try y un catch para captar cualquier tipo de errores
try {
  db.authenticate();
  console.log('Conexion con la db establecida');
} catch (error) {
  console.log(`El error de la conexion es : ${error}`);
}

const pool = mysql.createPool({
  host: 'localhost', // Configurar según tu base de datos
  user: 'root', // Configurar según tu base de datos
  password: '123456', // Configurar según tu base de datos
  database: 'DB_IfinityDESA_25092025'
});

// Ruta de login
app.post('/login', login);

// Ruta protegida
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Esto es una ruta protegida' });
});

app.get('/', (req, res) => {
  if (req.url == '/') {
    res.send('si en la URL pone  vera los registros en formato JSON'); // este hola mundo se mostrara en el puerto 5000 y en la raiz principal
  } else if (req.url != '/') {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('404 ERROR');
  }
});

// sirve archivos estáticos
app.use(
  '/uploads',
  express.static(BASE_UPLOAD_DIR, {
    // opcional: evita problemas de políticas de recursos cruzados
    setHeaders(res) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  })
);

// Endpoint para obtener todas las notificaciones con consulta SQL directa
app.get('/notifications/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  console.log('User ID recibido:', userId);

  try {
    const notifications = await db.query(
      `
      SELECT 
        n.*,
        COALESCE(nu_user.leido, 0) AS leido
      FROM notifications n
      LEFT JOIN notifications_users nu_user 
        ON n.id = nu_user.notification_id AND nu_user.user_id = :userId
      WHERE 
        -- Globales (siempre visibles para todos los usuarios)
        n.title IN ('Nueva queja registrada', 'Nueva pregunta frecuente registrada', 'Nueva clase de prueba registrada')
        -- O bien, cualquier notificación asignada explícitamente al usuario
        OR nu_user.user_id IS NOT NULL
      ORDER BY n.created_at DESC
      `,
      {
        replacements: { userId },
        type: db.Sequelize.QueryTypes.SELECT
      }
    );

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error al obtener las notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});


// Endpoint para obtener una notificación por ID con consulta SQL directa
app.get('/notifications/:id', async (req, res) => {
  const notificationId = req.params.id;

  try {
    const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [
      notificationId
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ mensajeError: 'No se encontró la notificación.' });
    }

    res.json(rows[0]); // Devolvemos solo el primer resultado
  } catch (error) {
    console.error('Error al obtener la notificación:', error);
    res
      .status(500)
      .json({ mensajeError: 'Hubo un error al obtener la notificación.' });
  }
});

// Endpoint para marcar una notificación como leída
app.post('/notifications/markAsRead', async (req, res) => {
  console.log(req.body); // Verifica si el user_id y notification_id están llegando correctamente
  const { notification_id, user_id } = req.body;

  try {
    // Verificamos si la relación entre la notificación y el usuario existe
    const [rows] = await db.query(
      'SELECT * FROM notifications_users WHERE notification_id = :notification_id AND user_id = :user_id',
      {
        replacements: { notification_id, user_id }
      }
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ mensajeError: 'Notificación no encontrada para este usuario' });
    }

    // Actualizamos el estado de la notificación a leída (leido = 1)
    await db.query(
      'UPDATE notifications_users SET leido = 1 WHERE notification_id = :notification_id AND user_id = :user_id',
      {
        replacements: { notification_id, user_id }
      }
    );

    // Respondemos con un mensaje de éxito
    res.json({
      message: 'Notificación marcada como leída correctamente'
    });
  } catch (error) {
    console.error('Error al marcar la notificación como leída:', error);
    res.status(500).json({
      mensajeError: 'Hubo un error al marcar la notificación como leída.'
    });
  }
});

// Notificaciones de clase de prueba para el día
// Pendiente/Enviado se determina por n_contacto_2 (0 = pendiente, 1 = enviado)
app.get('/notifications/clases-prueba/:userId', async (req, res) => {
  const userId = Number(req.params.userId);

  try {
    // 1) Traer usuario real (rol + local_id)
    const [[user]] = await pool.query(
      'SELECT id, rol, local_id FROM usuarios WHERE id = ? LIMIT 1',
      [userId]
    );
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const rol = String(user.rol || '').toLowerCase();

    // 2) (OPCIONAL) si querés filtrar por sede del usuario,
    // obtenemos el nombre de la sede desde locales.local_id
    let sedeNombre = null;
    if (user.local_id) {
      const [[localRow]] = await pool.query(
        'SELECT nombre FROM locales WHERE id = ? LIMIT 1',
        [user.local_id]
      );
      sedeNombre = localRow?.nombre || null;
    }

    // 3) Construcción dinámica del WHERE según rol
    // Fechas "HOY" (esto se mantiene)
    const baseDateSQL = `
      (
        DATE(vp.clase_prueba_1_fecha) = CURDATE() OR
        DATE(vp.clase_prueba_2_fecha) = CURDATE() OR
        DATE(vp.clase_prueba_3_fecha) = CURDATE()
      )
    `;

    // Filtros adicionales
    const whereParts = [baseDateSQL];
    const params = [];

    if (rol === 'admin') {
      // sin filtros extra
    } else if (rol === 'vendedor') {
      // Ver las que creó el vendedor
      whereParts.push('vp.usuario_id = ?');
      params.push(userId);

      // (OPCIONAL) y, si querés, además las de su sede
      if (sedeNombre) {
        whereParts.push('vp.sede = ?');
        params.push(sedeNombre);
      }
    } else if (rol === 'socio') {
      // Por defecto, socios no ven estas notificaciones (cambiar si querés)
      return res.json([]);
    } else {
      // Rol desconocido → nada
      return res.json([]);
    }

    const whereSQL = whereParts.length
      ? `WHERE ${whereParts.join(' AND ')}`
      : '';

    const [notis] = await pool.query(
      `
      SELECT
        vp.id AS prospecto_id,
        vp.nombre,
        vp.contacto,
        vp.observacion,
        vp.clase_prueba_1_fecha,
        vp.clase_prueba_2_fecha,
        vp.clase_prueba_3_fecha,
        vp.n_contacto_2,      -- 0 pendiente, 1 realizado
        vp.usuario_id,
        u.nombre AS asesor_nombre,   -- ajustado: en tu tabla usuarios el campo es "nombre"
        vp.sede,
        

        /* Tipo de la clase/visita que cae HOY */
        CASE
          WHEN DATE(vp.clase_prueba_1_fecha) = CURDATE() THEN vp.clase_prueba_1_tipo
          WHEN DATE(vp.clase_prueba_2_fecha) = CURDATE() THEN vp.clase_prueba_2_tipo
          WHEN DATE(vp.clase_prueba_3_fecha) = CURDATE() THEN vp.clase_prueba_3_tipo
          ELSE NULL
        END AS tipo_for_today,

        /* Alias de compatibilidad para el front */
        CASE
          WHEN DATE(vp.clase_prueba_1_fecha) = CURDATE() THEN vp.clase_prueba_1_tipo
          WHEN DATE(vp.clase_prueba_2_fecha) = CURDATE() THEN vp.clase_prueba_2_tipo
          WHEN DATE(vp.clase_prueba_3_fecha) = CURDATE() THEN vp.clase_prueba_3_tipo
          ELSE NULL
        END AS tipo
      FROM ventas_prospectos vp
      JOIN usuarios u ON u.id = vp.usuario_id
      ${whereSQL}
      ORDER BY vp.n_contacto_2 ASC, vp.nombre
      `,
      params
    );

    res.json(notis);
  } catch (error) {
    console.error('Error obteniendo notificaciones clase de prueba:', error);
    res
      .status(500)
      .json({ error: 'Error obteniendo notificaciones de clase de prueba' });
  }
});


app.patch(
  '/notifications/clases-prueba/:prospectoId/enviado',
  async (req, res) => {
    const prospectoId = Number(req.params.prospectoId);
    try {
      const [r] = await pool.query(
        'UPDATE ventas_prospectos SET n_contacto_2 = 1, updated_at = NOW() WHERE id = ?',
        [prospectoId]
      );
      if (r.affectedRows === 0) {
        return res.status(404).json({ error: 'Prospecto no encontrado' });
      }
      res.json({ ok: true, n_contacto_2: 1 });
    } catch (e) {
      console.error('PATCH enviado error:', e);
      res.status(500).json({ error: 'No se pudo marcar como enviado' });
    }
  }
);


async function deleteOldNotifications() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await NotificationModel.destroy({
      where: {
        created_at: {
          [Op.lte]: oneWeekAgo
        }
      }
    });

    console.log(`${result} notificaciones eliminadas.`);
  } catch (error) {
    console.error('Error eliminando notificaciones:', error);
  }
}

// Cron: ejecuta cada día a las 00:10
cron.schedule('10 0 * * *', () => {
  console.log('Cron job iniciado - eliminando notificaciones viejas...');
  deleteOldNotifications();
});


app.get('/stats-ventas', async (req, res) => {
  try {
    const { sede, mes, anio } = req.query;
    let whereClauses = [];
    let params = [];

    // Normaliza la sede: "barrio sur" => "barriosur", etc.
    // Normaliza la sede y la agrega al filtro
    if (sede) {
      whereClauses.push('LOWER(REPLACE(sede, " ", "")) = ?');
      params.push(sede.toLowerCase().replace(/\s/g, ''));
    }
    // Filtro por mes y año (rango de fechas)
    if (mes && anio) {
      const startDate = new Date(anio, mes - 1, 1);
      const endDate = new Date(anio, mes, 1);
      whereClauses.push('fecha >= ? AND fecha < ?');
      params.push(startDate, endDate);
    }

    const whereSQL = whereClauses.length
      ? 'WHERE ' + whereClauses.join(' AND ')
      : '';

    // 1. Total de ventas
    const [[{ total_ventas }]] = await pool.query(
      `SELECT COUNT(*) AS total_ventas FROM ventas_prospectos ${whereSQL}`,
      params
    );

    // 2. Prospectos
    const [prospectos] = await pool.query(
      `SELECT tipo_prospecto AS tipo, COUNT(*) AS cantidad
   FROM ventas_prospectos ${whereSQL}
   GROUP BY tipo_prospecto`,
      params
    );

    // 3. Canales
    const [canales] = await pool.query(
      `SELECT canal_contacto AS canal, COUNT(*) AS cantidad
       FROM ventas_prospectos ${whereSQL}
       GROUP BY canal_contacto`,
      params
    );

    // 4. Actividades
    const [actividades] = await pool.query(
      `SELECT actividad, COUNT(*) AS cantidad
       FROM ventas_prospectos ${whereSQL}
       GROUP BY actividad`,
      params
    );

    // 5. Contactos (SUM)
    const [[contactos]] = await pool.query(
      `SELECT
        SUM(n_contacto_1) AS total_contacto_1,
        SUM(n_contacto_2) AS total_contacto_2,
        SUM(n_contacto_3) AS total_contacto_3
       FROM ventas_prospectos ${whereSQL}`,
      params
    );

    // 6. Total clases de prueba (sumando todas)
    const [[{ total_clases_prueba }]] = await pool.query(
      `SELECT
        SUM(CASE WHEN clase_prueba_1_fecha IS NOT NULL THEN 1 ELSE 0 END) +
        SUM(CASE WHEN clase_prueba_2_fecha IS NOT NULL THEN 1 ELSE 0 END) +
        SUM(CASE WHEN clase_prueba_3_fecha IS NOT NULL THEN 1 ELSE 0 END)
        AS total_clases_prueba
       FROM ventas_prospectos ${whereSQL}`,
      params
    );

    const whereConvertidos = [...whereClauses];
    const paramsConvertidos = [...params];

    whereConvertidos.push('(convertido = 1 OR convertido = true)');

    // 7. Convertidos
    const convertidosSQL =
      whereConvertidos.length > 0
        ? 'WHERE ' + whereConvertidos.join(' AND ')
        : '';

    const [[{ total_convertidos }]] = await pool.query(
      `SELECT COUNT(*) AS total_convertidos FROM ventas_prospectos ${convertidosSQL}`,
      paramsConvertidos
    );

    const whereCampanias = [...whereClauses];
    const paramsCampanias = [...params];

    whereCampanias.push("canal_contacto = 'Campaña'");

    // 8. Campañas desglosadas por origen (filtro sede)
    const campaniasSQL =
      whereCampanias.length > 0 ? 'WHERE ' + whereCampanias.join(' AND ') : '';

    const [campaniasPorOrigen] = await pool.query(
      `SELECT campania_origen AS origen, COUNT(*) AS cantidad
   FROM ventas_prospectos
   ${campaniasSQL}
   GROUP BY campania_origen`,
      paramsCampanias
    );

    // 9. Conversiones por campaña (origen) (filtro sede)

    const whereCampaniasConvertidas = [...whereClauses];
    const paramsCampaniasConvertidas = [...params];

    whereCampaniasConvertidas.push("canal_contacto = 'Campaña'");
    whereCampaniasConvertidas.push('(convertido = 1 OR convertido = true)');

    const campaniasConvertidasSQL =
      whereCampaniasConvertidas.length > 0
        ? 'WHERE ' + whereCampaniasConvertidas.join(' AND ')
        : '';

    const [campaniasConvertidasPorOrigen] = await pool.query(
      `SELECT
     campania_origen AS origen,
     COUNT(*) AS cantidad_convertidos
   FROM ventas_prospectos
   ${campaniasConvertidasSQL}
   GROUP BY campania_origen`,
      paramsCampaniasConvertidas
    );

    /* ---------------------------------------------------------
       🔹 NUEVO BLOQUE: ESTADÍSTICAS DE COMISIONES
       --------------------------------------------------------- */

    // Criterio de comisión
    const whereComision = [...whereClauses];
    const paramsComision = [...params];
    whereComision.push('(comision = 1 OR comision = true)');
    const comisionSQL = whereComision.length
      ? 'WHERE ' + whereComision.join(' AND ')
      : '';

    // A) Total comisiones
    const [[{ total_comisiones }]] = await pool.query(
      `SELECT COUNT(*) AS total_comisiones
       FROM ventas_prospectos
       ${comisionSQL}`,
      paramsComision
    );

    // B) Comisiones por asesor
    const [comisionesPorAsesor] = await pool.query(
      `SELECT asesor_nombre, COUNT(*) AS cantidad
       FROM ventas_prospectos
       ${comisionSQL}
       GROUP BY asesor_nombre
       ORDER BY cantidad DESC`,
      paramsComision
    );

    // C) Comisiones por canal
    const [comisionesPorCanal] = await pool.query(
      `SELECT canal_contacto AS canal, COUNT(*) AS cantidad
       FROM ventas_prospectos
       ${comisionSQL}
       GROUP BY canal_contacto
       ORDER BY cantidad DESC`,
      paramsComision
    );

    // D) Comisiones por actividad
    const [comisionesPorActividad] = await pool.query(
      `SELECT actividad, COUNT(*) AS cantidad
       FROM ventas_prospectos
       ${comisionSQL}
       GROUP BY actividad
       ORDER BY cantidad DESC`,
      paramsComision
    );

    // E) Comisiones por origen (solo canal campaña)
    const whereComisionCampania = [...whereClauses];
    const paramsComisionCampania = [...params];
    whereComisionCampania.push('(comision = 1 OR comision = true)');
    whereComisionCampania.push("canal_contacto = 'Campaña'");
    const comisionCampaniaSQL = whereComisionCampania.length
      ? 'WHERE ' + whereComisionCampania.join(' AND ')
      : '';
    const [comisionesPorOrigenCampania] = await pool.query(
      `SELECT campania_origen AS origen, COUNT(*) AS cantidad
       FROM ventas_prospectos
       ${comisionCampaniaSQL}
       GROUP BY campania_origen
       ORDER BY cantidad DESC`,
      paramsComisionCampania
    );

    // F) Serie temporal (por día) de comisiones
    const [comisionesPorDia] = await pool.query(
      `SELECT DATE(fecha) AS dia, COUNT(*) AS cantidad
       FROM ventas_prospectos
       ${comisionSQL}
       GROUP BY DATE(fecha)
       ORDER BY dia ASC`,
      paramsComision
    );

    // G) Tasa de comisión sobre convertidos (JS para evitar problemas de división)
    const tasa_comision_sobre_convertidos =
      total_convertidos > 0
        ? Number((total_comisiones / total_convertidos).toFixed(4))
        : 0;

    res.json({
      total_ventas,
      prospectos,
      canales,
      actividades,
      contactos,
      total_clases_prueba,
      total_convertidos,
      campaniasPorOrigen,
      campaniasConvertidasPorOrigen, // 🔹 NUEVO: bloque comisiones
      total_comisiones,
      tasa_comision_sobre_convertidos,
      comisionesPorAsesor,
      comisionesPorCanal,
      comisionesPorActividad,
      comisionesPorOrigenCampania,
      comisionesPorDia
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

export async function generarAgendasAutomaticas() {
  // Día de hoy
  const today = new Date().toISOString().slice(0, 10);

  // 1. Seguimiento: ventas creadas hace 7 días
  const [prospectos] = await pool.query(`
    SELECT * FROM ventas_prospectos
    WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  `);

  for (const p of prospectos) {
    const [yaTiene] = await pool.query(
      "SELECT 1 FROM agendas_ventas WHERE prospecto_id=? AND tipo='seguimiento'",
      [p.id]
    );
    if (!yaTiene.length) {
      await pool.query(
        `INSERT INTO agendas_ventas (prospecto_id, usuario_id, fecha_agenda, tipo, descripcion)
         VALUES (?, ?, ?, 'seguimiento', ?)`,
        [p.id, p.usuario_id, today, 'Recordatorio: 2do contacto automático']
      );
    }
  }

  // 2. Clase de prueba (solo si tiene fecha)
  const [conClasePrueba] = await pool.query(`
    SELECT * FROM ventas_prospectos 
    WHERE clase_prueba_1_fecha IS NOT NULL
  `);

  for (const p of conClasePrueba) {
    const fechaClase =
      p.clase_prueba_1_fecha?.toISOString?.().slice(0, 10) ||
      (typeof p.clase_prueba_1_fecha === 'string'
        ? p.clase_prueba_1_fecha.slice(0, 10)
        : null);
    if (!fechaClase) continue;
    const [yaTiene] = await pool.query(
      "SELECT 1 FROM agendas_ventas WHERE prospecto_id=? AND tipo='clase_prueba' AND fecha_agenda=?",
      [p.id, fechaClase]
    );
    if (!yaTiene.length) {
      await pool.query(
        `INSERT INTO agendas_ventas (prospecto_id, usuario_id, fecha_agenda, tipo, descripcion)
         VALUES (?, ?, ?, 'clase_prueba', ?)`,
        [
          p.id,
          p.usuario_id,
          fechaClase,
          'Recordatorio: día de la clase de prueba'
        ]
      );
    }
  }
}

cron.schedule('10 0 * * *', async () => {
  console.log('[CRON] Generando agendas automáticas...');
  try {
    await generarAgendasAutomaticas();
    console.log('[CRON] Agendas generadas OK');
  } catch (err) {
    console.error('[CRON] Error:', err);
  }
});

// Endpoint para traer agendas con filtro por usuario_id (y fácilmente extensible)
app.get('/agendas-ventas', async (req, res) => {
  try {
    const { usuario_id, desde, hasta, solo_pendientes } = req.query;
    let sql = `
      SELECT 
        a.*, 
        v.nombre AS prospecto_nombre, 
        v.sede,
        v.asesor_nombre
      FROM agendas_ventas a
      LEFT JOIN ventas_prospectos v ON a.prospecto_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (usuario_id) {
      sql += ' AND a.usuario_id = ?';
      params.push(usuario_id);
    }
    if (desde) {
      sql += ' AND a.fecha_agenda >= ?';
      params.push(desde);
    }
    if (hasta) {
      sql += ' AND a.fecha_agenda <= ?';
      params.push(hasta);
    }
    if (solo_pendientes === '1') {
      sql += ' AND a.resuelta = 0';
    }

    sql += ' ORDER BY a.fecha_agenda DESC, a.id DESC';

    const [agendas] = await pool.query(sql, params);
    res.json(agendas);
  } catch (error) {
    console.error('Error al traer agendas:', error);
    res.status(500).json({ error: 'Error al traer agendas de ventas' });
  }
});

app.put('/agendas-ventas/:id', async (req, res) => {
  const { id } = req.params;
  const { nota_envio } = req.body;

  if (!nota_envio) {
    return res.status(400).json({ error: 'Falta la nota de envío' });
  }

  try {
    const sql = `
      UPDATE agendas_ventas
      SET enviada = 1,
          fecha_envio = NOW(),
          nota_envio = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [nota_envio, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agenda no encontrada' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar agenda:', error);
    res.status(500).json({ error: 'Error al actualizar la agenda de ventas' });
  }
});

app.delete('/agendas-ventas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM agendas_ventas WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agenda no encontrada' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar agenda:', error);
    res.status(500).json({ error: 'Error al eliminar agenda de ventas' });
  }
});

// GET /prospectos-alertas
app.get('/prospectos-alertas', async (req, res) => {
  const { local_id } = req.query;
  let where = 'WHERE fecha IS NOT NULL';
  const params = [];

  if (local_id) {
    where += ' AND local_id = ?';
    params.push(Number(local_id));
  }

  const [rows] = await pool.query(
    `
    SELECT
      id,
      nombre,
      fecha,
      n_contacto_2,
      convertido,
      DATEDIFF(CURDATE(), fecha) AS dias_desde_alta,
      CASE
        WHEN n_contacto_2 = 1 OR convertido = 1 THEN 'ninguno'
        WHEN DATEDIFF(CURDATE(), fecha) = 7 THEN 'amarillo'
        WHEN DATEDIFF(CURDATE(), fecha) > 7 THEN 'rojo'
        ELSE 'ninguno'
      END AS color_2do_contacto
    FROM ventas_prospectos
    ${where}
    ORDER BY fecha ASC
    `,
    params
  );

  res.json(rows);
});


if (!PORT) {
  console.error('El puerto no está definido en el archivo de configuración.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  process.exit(1); // Opcional: reiniciar la aplicación
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no capturada:', promise, 'razón:', reason);
  process.exit(1); // Opcional: reiniciar la aplicación
});
