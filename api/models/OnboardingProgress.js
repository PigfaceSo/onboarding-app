module.exports = (sequelize, Sequelize) => {
  const OnboardingProgress = sequelize.define("onboarding_progress", {
    step_name: { 
      type: Sequelize.STRING(100),
      allowNull: false
    },
    status: { 
      type: Sequelize.STRING(50),
      defaultValue: 'pending'
    },
    completed_at: {
      type: Sequelize.DATE
    },
    completed_by: {
      type: Sequelize.STRING(100)
    },
    notes: {
      type: Sequelize.TEXT
    }
  });
  return OnboardingProgress;
};
