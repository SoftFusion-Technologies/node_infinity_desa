/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 23 /05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_RoutineFeedback.js) contiene la definición del modelo Sequelize para la tabla routine_feedback.
 *
 * Tema: Modelos - Routine Feedback
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const RoutineFeedbackModel = db.define(
  'routine_feedback',
  {
    routine_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'routines',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    gusto: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    dificultad: {
      type: DataTypes.ENUM('fácil', 'normal', 'difícil'),
      allowNull: false
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false
  }
);

export default RoutineFeedbackModel;
