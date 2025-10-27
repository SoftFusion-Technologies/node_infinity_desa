/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 08/08/2025
 * Versión: 1.1
 *
 * Descripción:
 * Definición del modelo Sequelize para la tabla routine_exercise_logs.
 * Ahora referencia SERIES (serie_id) en lugar de routine_exercises.
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const RoutineExerciseLogsModel = db.define(
  'routine_exercise_logs',
  {
    serie_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    peso: {
      type: DataTypes.DECIMAL(5, 2), // podés subir a (6,2) si querés
      allowNull: true
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true }
  },
  { timestamps: false }
);

export default RoutineExerciseLogsModel;
