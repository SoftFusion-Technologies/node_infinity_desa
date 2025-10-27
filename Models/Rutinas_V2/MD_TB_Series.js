/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene la definición del modelo Sequelize para la tabla `series`,
 * que representa una serie específica dentro de un ejercicio en una rutina.
 *
 * Tema: Modelos - Series
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const SeriesModel = db.define(
  'series',
  {
    ejercicio_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'ejercicios',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    numero_serie: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    repeticiones: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    descanso: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tiempo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    kg: {
      type: DataTypes.DECIMAL(6, 2),
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

export default SeriesModel;
