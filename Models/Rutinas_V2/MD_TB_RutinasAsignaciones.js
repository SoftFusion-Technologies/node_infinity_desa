/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 16/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Modelo Sequelize para la tabla `rutinas_asignaciones`, que vincula
 * rutinas existentes con alumnos (sin clonar contenido) y define
 * la vigencia mediante `desde` (TIMESTAMP) y `hasta` (DATE).
 *
 * Tema: Modelos - Rutinas
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

// Modelos relacionados
import RutinasModel from './MD_TB_Rutinas.js';
import StudentsModel from '../MD_TB_Students.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const RutinasAsignacionesModel = db.define(
  'rutinas_asignaciones',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    rutina_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'rutinas', key: 'id' },
      onDelete: 'CASCADE'
    },

    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onDelete: 'CASCADE'
    },

    // Vigencia de la asignación
    desde: {
      // TIMESTAMP en MySQL → usar DataTypes.DATE en Sequelize
      type: DataTypes.DATE,
      allowNull: false
    },
    hasta: {
      // DATEONLY (inclusive) o NULL = indefinida
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true }
  },
  {
    tableName: 'rutinas_asignaciones',
    timestamps: false,
    indexes: [
      // Idempotencia por rutina/alumno
      {
        name: 'uq_rutina_student',
        unique: true,
        fields: ['rutina_id', 'student_id']
      },
      // Consultas por alumno y rango de fechas
      {
        name: 'idx_asig_student_fecha',
        fields: ['student_id', 'desde', 'hasta']
      }
    ]
  }
);

// =====================
// Relaciones
// =====================
RutinasAsignacionesModel.belongsTo(RutinasModel, {
  as: 'rutina',
  foreignKey: 'rutina_id'
});

RutinasAsignacionesModel.belongsTo(StudentsModel, {
  as: 'alumno',
  foreignKey: 'student_id'
});

export default RutinasAsignacionesModel;
