const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://jobdirectadmin:Proyectos123@pg-jobdirect-dev.postgres.database.azure.com:5432/jobdirect',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
