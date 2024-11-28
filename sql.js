const connection = require('mysql2');

const dbConfig = {
  host: 'localhost', 
  user: 'root',           
  password: '',      
  database: 'timetable', 
};


const db = connection.createConnection(dbConfig);


const connectToDatabase = async () => {
  try {
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
    console.log('Connected to the database!');
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
    console.log('Details:', err);
  }
};



connectToDatabase();

module.exports = db;
