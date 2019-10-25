'use strict'

module.exports = (sequelize, DataTypes) => {
  
  const Feed = sequelize.define('feed_details', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: DataTypes.INTEGER,
      role_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      photos: DataTypes.STRING,
      content: DataTypes.TEXT,
      location: DataTypes.STRING,
      latitude: DataTypes.STRING,
      longitude: DataTypes.STRING,
      like_count: DataTypes.INTEGER,
      comment_count: DataTypes.INTEGER,
      View_count: DataTypes.INTEGER,
      share_count: DataTypes.INTEGER,
      // profile_pic: DataTypes.TEXT
    },
    // {
    //   classMethods: {
    //     associate: function(models) {
    //       //console.log(models);console.log("AKASH WWWWW");
    //       //models.user.belongsTo(Feed , {foreignKey: 'userId'});
    //       Feed.hasOne(models.User, { foreignKey: 'userId' });
    //       //Feed.hasOne(User, { foreignKey: 'id' });
    //       // associations can be defined here for relationship
    //     }
    //   }
    // },
    {
      freezeTableName: true,
    });

    Feed.associate = (models) => {  
      //Feed.hasOne(models.user, { foreignKey: 'id' });
      //models.user.hasOne(Feed, { foreignKey: 'userId' });
    };

 return Feed;  
}
