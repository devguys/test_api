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
    /*{
      classMethods: {
        associate: function(models) {
          // associations can be defined here for relationship
        }
      }
    },*/
    {
      freezeTableName: true,
    });

  // checking if password is valid
  User.validPassword = function(password, localPassword) {
    return bcrypt.compareSync(password, localPassword);
 }  
 return User;  
}
