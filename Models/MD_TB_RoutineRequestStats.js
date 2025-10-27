/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 31/05/2025
 * Versión: 1.1
 *
 * Descripción:
 * Modelo Sequelize para la tabla routine_request_stats.
 * Usa columnas: rutina_id y ejercicio_id (nullable).
 * Tema: Modelos - Routine Request Stats
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const RoutineRequestStatsModel = db.define(
  'routine_request_stats',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    instructor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },

    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },

    // 🔹 Nuevos nombres en DB
    rutina_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true // DB: DEFAULT NULL + ON DELETE SET NULL
    },

    ejercicio_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true // DB: DEFAULT NULL + ON DELETE SET NULL
    },

    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    fecha_atendida: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    mes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'routine_request_stats',
    timestamps: false,
    indexes: [
      { fields: ['instructor_id'] },
      { fields: ['student_id'] },
      { fields: ['rutina_id'] },
      { fields: ['ejercicio_id'] },
      { fields: ['mes', 'anio'] }
    ]
  }
);

export default RoutineRequestStatsModel;
