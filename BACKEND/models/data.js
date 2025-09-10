module.exports = (sequelize, DataTypes) => {
    const Data = sequelize.define('Data', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      megaLink: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
      },
      views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {});
    return Data;
  };
  