'use strict'


module.exports = {
  up: (queryInterface, Sequelize) => {


    return Promise.all([
      queryInterface.addColumn('user', 'profile_pic', {
        type: Sequelize.STRING,
        after: "filename"
      }).then(() => {
      console.log('Update Table column successfully.');
      }),
      queryInterface.addColumn('user', 'status', {
        type: Sequelize,
        after: "profile_pic"
      }).then(() => {
      console.log('Update Table column successfully.');
      }) 
    ]);



    // return [
    //   queryInterface.addColumn('user', 'profile_pic', {
    //     type: Sequelize.STRING,
    //     after: "filename"
    //   }).then(() => {
    //   console.log('Update Table column successfully.');
    //   }),
    //   queryInterface.addColumn('user', 'status', {
    //     type: Sequelize,
    //     after: "profile_pic"
    //   }).then(() => {
    //   console.log('Update Table column successfully.');
    //   })  

    // ]
             
  },
  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn('user', 'profile_pic_user'),
    ];
  }
};
