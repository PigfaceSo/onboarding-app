module.exports = (sequelize, Sequelize) => {
  const Villa = sequelize.define("villa", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false
    },
    postal_code: Sequelize.STRING,
    country: {
      type: Sequelize.STRING,
      defaultValue: 'Thailand'
    },
    bedrooms: Sequelize.INTEGER,
    bathrooms: Sequelize.INTEGER,
    max_guests: Sequelize.INTEGER,
    property_type: Sequelize.STRING,
    onboarding_status: {
      type: Sequelize.STRING,
      defaultValue: 'pending'
    }
  });

  return Villa;
};
