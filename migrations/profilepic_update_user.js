'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'user',
        'profile_pic',
        {
          type: Sequelize.TEXT
        }
      ),
      queryInterface.addColumn(
        'user',
        'adhar_no',
        {
          type: Sequelize.STRING
        }
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      // queryInterface.removeColumn('tableName', 'columnName1'),
      // queryInterface.removeColumn('tableName', 'columnName2')
    ]);
  }
};
