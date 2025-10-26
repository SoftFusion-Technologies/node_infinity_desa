/*
 * Programador: Benjamin Orellana
 * Fecha actualización: 21 / 06 / 2025
 *
 * Descripción:
 * Autenticación con JWT basada en la tabla 'usuarios'
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../Models/MD_TB_Users.js';
import db from '../DataBase/db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar solo por email
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res.json({ message: 'Fail', error: 'Credenciales inválidas' });
    }

    // Comparar password con bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ message: 'Fail', error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        rol: user.rol,
        local_id: user.local_id,
        es_reemplazante: !!user.es_reemplazante
      },
      'softfusion',
      {
        expiresIn: '1h'
      }
    );

    return res.json({
      message: 'Success',
      token,
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      local_id: user.local_id,
      es_reemplazante: !!user.es_reemplazante
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.json({
      message: 'Fail',
      error: 'Error interno del servidor'
    });
  }
};

// Middleware para proteger rutas con token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // formato: Bearer TOKEN

  if (!token) return res.sendStatus(401); // No autorizado

  jwt.verify(token, 'softfusion', (err, user) => {
    if (err) return res.sendStatus(403); // Token inválido
    req.user = user;
    next();
  });
};

export const loginAlumno = async (req, res) => {
  const { telefono, dni } = req.body;

  const sql = `
    SELECT * FROM students
    WHERE telefono = :telefono AND dni = :dni
  `;

  try {
    const [results] = await db.query(sql, {
      replacements: { telefono, dni }
    });

    if (results.length > 0) {
      const students = results[0];
      const token = jwt.sign(
        { id: students.id, nomyape: students.nomyape },
        'softfusion',
        {
          expiresIn: '1h'
        }
      );
      if (results.length > 0) {
        return res.json({
          message: 'Success',
          token,
          nomyape: students.nomyape,
          id: students.id
        });
      } else {
        return res.json({ message: 'Fail' });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const authenticateStudent = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'softfusion', (err, student) => {
    if (err) return res.sendStatus(403);
    req.student = student;
    next();
  });
};
