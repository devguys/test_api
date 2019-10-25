'use strict'

const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));
module.exports = (sequelize, DataTypes) => {
  
  const User = sequelize.define('user', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: DataTypes.STRING,
      password: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      address: DataTypes.STRING,
      phone_number: DataTypes.NUMBER,
      address: DataTypes.STRING,
      profile_pic: DataTypes.TEXT,
      adhar_no: DataTypes.STRING,
    },
    // {
    //   classMethods: {
    //     associate: function(models) {

    //       //console.log(models);console.log("AKASH WWWWW");

    //        User.belongsTo(models.Feed, { foreignKey: 'userId' });

    //      // models.Feed.hasOne(User);
    //       // associations can be defined here for relationship
    //     }
    //   }
    // },
    {
      freezeTableName: true,
    });

    User.associate = (models) => {  
        User.belongsTo(models.feed_details, {  foreignKey: 'id', });
        User.hasOne(models.feed_details, {  foreignKey: 'user_id', });
    };  

  // checking if password is valid
  User.validPassword = function(password, localPassword) {
    return bcrypt.compareSync(password, localPassword);
 }  

 return User;  
}
