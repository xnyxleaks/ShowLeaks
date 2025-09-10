module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Model', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Atributos físicos
    hairColor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    eyeColor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bodyType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bustSize: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER, // em cm
      allowNull: true,
    },
    weight: {
      type: DataTypes.INTEGER, // em kg
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    birthPlace: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ethnicity: {
      type: DataTypes.ENUM('arab', 'asian', 'ebony', 'indian', 'latina', 'white'),
      allowNull: true,
    },
    orientation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    timestamps: true,
  });

  Model.associate = function(models) {
    Model.hasMany(models.Content, {
      foreignKey: 'modelId',
      as: 'contents'
    });
    Model.hasMany(models.Report, {
      foreignKey: 'modelId',
      as: 'reports'
    });
  };

  return Model;
};