'use strict'

module.exports = (sequelize, DataTypes) => {
  
  const Product = sequelize.define('product_details', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      parnet_category_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
      company_id: DataTypes.INTEGER,
      price_value: DataTypes.STRING,
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
