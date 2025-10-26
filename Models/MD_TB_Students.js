/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 23 /05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_Students.js) contiene la definición del modelo Sequelize para la tabla students.
 *
 * Tema: Modelos - Students
 *
 * Capa: Backend
 */

// Importa la configuración de la base de datos y los tipos de datos necesarios
import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const StudentsModel = db.define(
  'students',
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    nomyape: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    dni: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    objetivo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rutina_tipo: {
      type: DataTypes.ENUM('personalizado', 'general'),
      allowNull: false,
      defaultValue: 'personalizado'
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
    timestamps: false // Sequelize no agrega createdAt ni updatedAt automáticos
  }
);

export default StudentsModel;
