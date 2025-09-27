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
