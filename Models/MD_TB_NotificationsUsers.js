/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 4 mayo 2025
 * Versión: 0.2
 *
 * Descripción:
 * Modelo Sequelize para la tabla 'notifications_users'.
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const NotificationUserModel = db.define(
  'NotificationUser', // nombre del modelo (interno)
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    notification_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'notifications', // tabla referenciada
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.INTEGER, // en tu DDL es INT
      allowNull: false,
      references: {
        model: 'usuarios', // 👈 tabla real
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    leido: {
      type: DataTypes.TINYINT, // podrías usar DataTypes.BOOLEAN si preferís
      allowNull: false,
      defaultValue: 0 // 0 = no leído, 1 = leído
    }
    // NO declares created_at/updated_at aquí si usas timestamps (abajo)
  },
  {
    tableName: 'notifications_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'fk_notifications_users_notification_id',
        fields: ['notification_id']
      },
      { name: 'notifications_users_ibfk_2', fields: ['user_id'] },
      {
        name: 'uniq_notification_user',
        unique: true,
        fields: ['notification_id', 'user_id']
      }
    ]
  }
);

export default NotificationUserModel;
