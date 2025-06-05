module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "postgres",      
  PASSWORD: process.env.DB_PASSWORD || "1806",  
  DB: process.env.DB_NAME || "villa_onboarding",        
  dialect: "postgres",
  pool: {
    max: 5,      
    min: 0,       
    acquire: 30000, 
    idle: 10000    
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
};
