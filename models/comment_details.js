'use strict'

module.exports = (sequelize, DataTypes) => {
  
  const Product = sequelize.define('comment_details', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: DataTypes.INTEGER,
      feed_id: DataTypes.INTEGER,
      parent_comment_id: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      // profile_pic: DataTypes.TEXT
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

 return Product;  
}
