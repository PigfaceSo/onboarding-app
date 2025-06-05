module.exports = (sequelize, Sequelize) => {
  const Item = sequelize.define("item", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    is_present: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });

  return Item;
};
