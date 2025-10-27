/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene la definición del modelo Sequelize para la tabla `ejercicios`,
 * que representa un ejercicio dentro de un bloque de una rutina.
 *
 * Tema: Modelos - Ejercicios
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const EjerciciosModel = db.define(
  'ejercicios',
  {
    bloque_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'bloques',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notas: {
      type: DataTypes.TEXT,
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

export default EjerciciosModel;
