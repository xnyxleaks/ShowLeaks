module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Model', {
    model_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
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
    sexuality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    boobsType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cupSize: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: true,
    getterMethods: {
      age() {
        if (!this.birthDate) return null;
        const today = new Date();
        const birthDate = new Date(this.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      }
    }
  });

  Model.associate = function(models) {
    Model.hasMany(models.Content, {
      foreignKey: 'modelId',
      sourceKey: 'model_id',
      as: 'contents'
    });
    Model.hasMany(models.Report, {
      foreignKey: 'modelId',
      as: 'reports'
    });
    Model.hasMany(models.UserHistory, {
      foreignKey: 'model_id',
      sourceKey: 'model_id',
      as: 'histories'
    });
  };

  return Model;
};
