'use strict';
const { v4: uuidv4 } = require('uuid'); // Import the UUID generator


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    await queryInterface.bulkInsert('roles', [
      {
        id: uuidv4(),
        role: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        role: 'Super Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        role: 'Seller',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     */
    await queryInterface.bulkDelete('roles', {
      role: { [Sequelize.Op.in]: ['User', 'Admin'] },
    });
  }
};
