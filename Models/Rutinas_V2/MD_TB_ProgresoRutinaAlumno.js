/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene la definición del modelo Sequelize para la tabla `progreso_rutina_alumno`,
 * que permite registrar el avance del alumno en diferentes niveles de la rutina (rutina, bloque, ejercicio, serie).
 *
 * Tema: Modelos - Progreso Alumno
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const ProgresoRutinaAlumnoModel = db.define(
  'progreso_rutina_alumno',
  {
    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    rutina_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'rutinas',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    bloque_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'bloques',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    ejercicio_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'ejercicios',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    serie_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'series',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    nivel: {
      type: DataTypes.ENUM('rutina', 'bloque', 'ejercicio', 'serie'),
      allowNull: false
    },
    completado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false
  }
);

export default ProgresoRutinaAlumnoModel;
