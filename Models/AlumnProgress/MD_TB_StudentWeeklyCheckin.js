/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/06/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_StudentWeeklyCheckin.js) contiene la definición del modelo Sequelize
 * para la tabla student_weekly_checkin, que registra el seguimiento semanal del alumno.
 * Tema: Modelos - StudentWeeklyCheckin
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const StudentWeeklyCheckinModel = db.define(
  'student_weekly_checkin',
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
    semana: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cumplio_rutina: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    energia_level: {
      type: DataTypes.TINYINT,
      allowNull: true, // Permitir null por si el alumno no completa la respuesta
      validate: {
        min: 1,
        max: 5
      }
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  },
  {
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ['student_id', 'semana', 'anio']
      }
    ]
  }
);

export default StudentWeeklyCheckinModel;
