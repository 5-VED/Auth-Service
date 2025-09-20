'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableName = 'address';
    const [results] = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}' AND column_name IN ('isActive','isDeleted');`
    );
    const existingColumns = new Set(results.map(r => r.column_name));

    if (!existingColumns.has('isActive')) {
      await queryInterface.addColumn(tableName, 'isActive', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    if (!existingColumns.has('isDeleted')) {
      await queryInterface.addColumn(tableName, 'isDeleted', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableName = 'address';
    const [results] = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}' AND column_name IN ('isActive','isDeleted');`
    );
    const existingColumns = new Set(results.map(r => r.column_name));

    if (existingColumns.has('isActive')) {
      await queryInterface.removeColumn(tableName, 'isActive');
    }

    if (existingColumns.has('isDeleted')) {
      await queryInterface.removeColumn(tableName, 'isDeleted');
    }
  }
};
