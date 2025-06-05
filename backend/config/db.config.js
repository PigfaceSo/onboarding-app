module.exports = {
  HOST: "localhost",
  USER: "postgres",      
  PASSWORD: "1806",  
  DB: "villa_onboarding",        
  dialect: "postgres",
  pool: {
    max: 5,      
    min: 0,       
    acquire: 30000, 
    idle: 10000    
  }
};
