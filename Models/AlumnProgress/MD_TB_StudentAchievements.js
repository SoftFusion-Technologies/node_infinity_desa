/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/06/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_StudentAchievements.js) contiene la definición del modelo Sequelize
 * para la tabla student_achievements, que registra logros alcanzados por los alumnos.
 * Tema: Modelos - StudentAchievements
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const StudentAchievementsModel = db.define(
  'student_achievements',
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
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
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

export default StudentAchievementsModel;
