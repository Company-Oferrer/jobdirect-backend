const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * Formatea el rango salarial a algo como: "$4,000 – $5,500"
 */
function formatSalaryRange(row) {
  if (!row.salary_min && !row.salary_max) return null;

  const currencySymbol = row.salary_currency === 'USD' ? '$' : row.salary_currency + ' ';
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const min = row.salary_min ? formatter.format(row.salary_min) : null;
  const max = row.salary_max ? formatter.format(row.salary_max) : null;

  if (min && max) return `${currencySymbol}${min} – ${currencySymbol}${max}`;
  if (min) return `${currencySymbol}${min}`;
  if (max) return `${currencySymbol}${max}`;
  return null;
}

/**
 * GET /api/health
 * Endpoint simple para comprobar que el servidor está arriba.
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * GET /api/jobs
 * Retorna un listado de ofertas en el formato solicitado
 */
app.get('/api/jobs', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        title,
        company,
        region,
        category,
        type,
        posted_at,
        salary_min,
        salary_max,
        salary_currency,
        short_description,
        description,
        tags
      FROM jobs
      ORDER BY posted_at DESC
      `
    );

    const jobs = rows.map((row) => ({
      id: String(row.id), // convertir a string
      title: row.title,
      company: row.company,
      region: row.region,
      category: row.category,
      type: row.type,
      postedAt: row.posted_at.toISOString(),
      salaryRange: formatSalaryRange(row), // p.e. "$4,000 – $5,500"
      shortDescription: row.short_description,
      description: row.description,
      tags: row.tags || [],
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Solo iniciar el servidor si el archivo se ejecuta directamente (no cuando se importa para tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Exportar la app para testing
module.exports = app;
