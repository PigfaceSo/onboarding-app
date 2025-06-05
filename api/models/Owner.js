module.exports = (sequelize, Sequelize) => {
  const Owner = sequelize.define("owner", {
    first_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    last_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    phone: Sequelize.STRING,
    address: Sequelize.TEXT,
    city: Sequelize.STRING,
    country: Sequelize.STRING,
    preferred_language: {
      type: Sequelize.STRING,
      defaultValue: 'en'
    }
  });

  return Owner;
};
