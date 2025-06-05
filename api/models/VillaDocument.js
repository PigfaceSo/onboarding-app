module.exports = (sequelize, Sequelize) => {
  const VillaDocument = sequelize.define("villa_document", {
    document_type: { 
      type: Sequelize.STRING(50)
    },
    file_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    file_path: {
      type: Sequelize.STRING(500),
      allowNull: false
    },
    file_size: {
      type: Sequelize.INTEGER
    },
    mime_type: {
      type: Sequelize.STRING(100)
    },
    uploaded_by: {
      type: Sequelize.STRING(100)
    },
    uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    is_required: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    description: {
      type: Sequelize.TEXT
    }
  });
  return VillaDocument;
};
