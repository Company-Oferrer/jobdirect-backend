const express = require('express');
const cors = require('cors');
const pool = require('./db');
const logger = require('./logger');
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
 * POST /api/seed
 * Inicializa la base de datos con datos ficticios para desarrollo/testing
 */
app.post('/api/seed', async (req, res) => {
  try {
    // Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        region TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        salary_min NUMERIC(10, 2),
        salary_max NUMERIC(10, 2),
        salary_currency TEXT DEFAULT 'USD',
        short_description TEXT NOT NULL,
        description TEXT NOT NULL,
        tags TEXT[]
      )
    `);

    // Limpiar tabla existente
    await pool.query('DELETE FROM jobs');

    // Datos ficticios variados
    const seedJobs = [
      {
        title: 'Senior Frontend Engineer',
        company: 'BlueWave Tech',
        region: 'Lima',
        category: 'Technology',
        type: 'Full Time',
        salary_min: 4000,
        salary_max: 5500,
        salary_currency: 'USD',
        short_description: 'Lead the frontend of our SaaS analytics platform using React and TypeScript.',
        description: 'We are looking for a Senior Frontend Engineer to own the user interface of our analytics platform. You will work closely with designers and backend engineers to ship high-quality, performant experiences.',
        tags: ['React', 'TypeScript', 'SaaS', 'Leadership']
      },
      {
        title: 'Backend Developer',
        company: 'DataCore Solutions',
        region: 'Arequipa',
        category: 'Technology',
        type: 'Full Time',
        salary_min: 3500,
        salary_max: 4500,
        salary_currency: 'USD',
        short_description: 'Build scalable APIs and microservices with Node.js and PostgreSQL.',
        description: 'Join our backend team to develop robust APIs that power our fintech platform. Experience with Node.js, Express, and relational databases required.',
        tags: ['Node.js', 'PostgreSQL', 'APIs', 'Microservices']
      },
      {
        title: 'UX/UI Designer',
        company: 'Creative Studio Peru',
        region: 'Lima',
        category: 'Design',
        type: 'Full Time',
        salary_min: 2500,
        salary_max: 3500,
        salary_currency: 'USD',
        short_description: 'Create beautiful and intuitive user experiences for mobile apps.',
        description: 'We need a talented designer to lead the visual design of our mobile applications. Proficiency in Figma and understanding of design systems is essential.',
        tags: ['Figma', 'Mobile', 'Design Systems', 'Prototyping']
      },
      {
        title: 'Data Analyst',
        company: 'Analytics Pro',
        region: 'Cusco',
        category: 'Technology',
        type: 'Part Time',
        salary_min: 1800,
        salary_max: 2500,
        salary_currency: 'USD',
        short_description: 'Analyze business data and create insightful reports and dashboards.',
        description: 'Help our clients make data-driven decisions by analyzing datasets, creating visualizations, and presenting findings to stakeholders.',
        tags: ['SQL', 'Python', 'Tableau', 'Excel']
      },
      {
        title: 'Marketing Manager',
        company: 'GrowthLab',
        region: 'Lima',
        category: 'Marketing',
        type: 'Full Time',
        salary_min: 3000,
        salary_max: 4000,
        salary_currency: 'USD',
        short_description: 'Lead digital marketing strategies for B2B SaaS products.',
        description: 'Drive growth through SEO, content marketing, and paid acquisition. You will manage a small team and work closely with sales.',
        tags: ['SEO', 'Content Marketing', 'B2B', 'Team Management']
      },
      {
        title: 'DevOps Engineer',
        company: 'CloudFirst',
        region: 'Trujillo',
        category: 'Technology',
        type: 'Full Time',
        salary_min: 4500,
        salary_max: 6000,
        salary_currency: 'USD',
        short_description: 'Manage cloud infrastructure and CI/CD pipelines on AWS.',
        description: 'Build and maintain our cloud infrastructure, implement CI/CD pipelines, and ensure high availability of our services.',
        tags: ['AWS', 'Docker', 'Kubernetes', 'CI/CD']
      },
      {
        title: 'Contador Senior',
        company: 'FinanzasPlus',
        region: 'Lima',
        category: 'Finance',
        type: 'Full Time',
        salary_min: 2800,
        salary_max: 3800,
        salary_currency: 'PEN',
        short_description: 'Gestionar la contabilidad general y reportes financieros.',
        description: 'Responsable de la contabilidad general, preparación de estados financieros, y cumplimiento tributario para clientes corporativos.',
        tags: ['Contabilidad', 'NIIF', 'SAP', 'Tributación']
      },
      {
        title: 'Customer Success Manager',
        company: 'TechSupport Inc',
        region: 'Arequipa',
        category: 'Sales',
        type: 'Full Time',
        salary_min: 2200,
        salary_max: 3000,
        salary_currency: 'USD',
        short_description: 'Ensure customer satisfaction and drive product adoption.',
        description: 'Work directly with enterprise customers to ensure they get maximum value from our platform. Manage onboarding, training, and renewals.',
        tags: ['Customer Success', 'SaaS', 'Enterprise', 'Communication']
      },
      {
        title: 'Mobile Developer (React Native)',
        company: 'AppFactory',
        region: 'Lima',
        category: 'Technology',
        type: 'Contract',
        salary_min: 3000,
        salary_max: 4000,
        salary_currency: 'USD',
        short_description: 'Build cross-platform mobile apps with React Native.',
        description: 'Join our team to develop and maintain mobile applications for iOS and Android using React Native. Experience with native modules is a plus.',
        tags: ['React Native', 'iOS', 'Android', 'JavaScript']
      },
      {
        title: 'HR Generalist',
        company: 'PeopleFirst',
        region: 'Cusco',
        category: 'Human Resources',
        type: 'Part Time',
        salary_min: 1500,
        salary_max: 2000,
        salary_currency: 'USD',
        short_description: 'Support HR operations including recruitment and employee relations.',
        description: 'Handle day-to-day HR tasks including recruitment coordination, onboarding, employee inquiries, and maintaining HR records.',
        tags: ['Recruitment', 'Onboarding', 'Employee Relations', 'HRIS']
      },
      {
        title: 'Product Manager',
        company: 'InnovateTech',
        region: 'Lima',
        category: 'Technology',
        type: 'Full Time',
        salary_min: 5000,
        salary_max: 7000,
        salary_currency: 'USD',
        short_description: 'Define product vision and roadmap for our core platform.',
        description: 'Lead product strategy, work with engineering and design teams, and drive the product lifecycle from concept to launch.',
        tags: ['Product Strategy', 'Agile', 'Roadmapping', 'Stakeholder Management']
      },
      {
        title: 'Content Writer',
        company: 'MediaHub',
        region: 'Trujillo',
        category: 'Marketing',
        type: 'Remote',
        salary_min: 1200,
        salary_max: 1800,
        salary_currency: 'USD',
        short_description: 'Create engaging content for blogs, social media, and newsletters.',
        description: 'Write compelling content that drives engagement and supports our marketing goals. Strong writing skills in Spanish and English required.',
        tags: ['Copywriting', 'SEO', 'Social Media', 'Bilingual']
      }
    ];

    // Insertar cada job
    for (const job of seedJobs) {
      await pool.query(
        `INSERT INTO jobs (title, company, region, category, type, salary_min, salary_max, salary_currency, short_description, description, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [job.title, job.company, job.region, job.category, job.type, job.salary_min, job.salary_max, job.salary_currency, job.short_description, job.description, job.tags]
      );
    }

    logger.info('Database seeded successfully', { count: seedJobs.length });
    res.json({ message: 'Database seeded successfully', count: seedJobs.length });
  } catch (error) {
    logger.error('Error seeding database', { error: error.message });
    res.status(500).json({ error: 'Failed to seed database' });
  }
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

    logger.info('Jobs fetched successfully', { count: jobs.length });
    res.json(jobs);
  } catch (error) {
    logger.error('Error fetching jobs', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Función para conectar a la BD con reintentos
async function connectWithRetry(maxRetries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Attempting database connection (${attempt}/${maxRetries})...`);
      await pool.query('SELECT 1');
      logger.info('Database connection successful');
      return true;
    } catch (err) {
      logger.error(`Database connection failed (attempt ${attempt}/${maxRetries})`, {
        error: err.message,
        code: err.code,
        host: err.address || 'unknown',
        port: err.port || 'unknown'
      });

      if (attempt < maxRetries) {
        const waitTime = delayMs * attempt;
        logger.info(`Retrying in ${waitTime / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  return false;
}

// Solo iniciar el servidor si el archivo se ejecuta directamente (no cuando se importa para tests)
if (require.main === module) {
  connectWithRetry()
    .then((connected) => {
      if (connected) {
        app.listen(PORT, () => {
          logger.info(`Server running on port ${PORT}`);
        });
      } else {
        logger.error('Failed to connect to database after all retries. Exiting...');
        process.exit(1);
      }
    });
}

// Exportar la app para testing
module.exports = app;
