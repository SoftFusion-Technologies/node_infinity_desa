/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 23 /05 / 2025
 * Fecha Actualizacion 2 : 08 /08 / 2025 se agregan campos series, repeticiones, tiempo, descanso
 * Versión: 1.2
 *
 * Descripción:
 * Definición del modelo Sequelize para la tabla routine_exercises con nuevos campos para series, repeticiones, tiempo y descanso.
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';
import RutinaColoresModel from './MD_TB_RutinaColores.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const RoutineExercisesModel = db.define(
  'routine_exercises',
  {
    routine_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    musculo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    // Nuevos campos
    series: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    repeticiones: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tiempo: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    descanso: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    desde: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hasta: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    timestamps: false
  }
);

RoutineExercisesModel.belongsTo(RutinaColoresModel, {
  foreignKey: 'color_id',
  as: 'color'
});

export default RoutineExercisesModel;
