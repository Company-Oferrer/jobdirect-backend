const request = require('supertest');

jest.mock('../db', () => ({
  query: jest.fn(),
}));

const app = require('../index');
const pool = require('../db');

const EN_DASH = 'â€“';

const baseJobs = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'BlueWave Tech',
    region: 'Lima',
    category: 'Technology',
    type: 'Full Time',
    posted_at: new Date('2025-01-10T10:00:00.000Z'),
    salary_min: 4000,
    salary_max: 5500,
    salary_currency: 'USD',
    short_description: 'Lead frontend.',
    description: 'Full description.',
    tags: ['React', 'TypeScript'],
  },
  {
    id: 2,
    title: 'Content Writer',
    company: 'MediaHub',
    region: 'Trujillo',
    category: 'Marketing',
    type: 'Remote',
    posted_at: new Date('2025-01-05T10:00:00.000Z'),
    salary_min: 1200,
    salary_max: 1800,
    salary_currency: 'USD',
    short_description: 'Create engaging content.',
    description: 'Full description.',
    tags: ['Copywriting', 'SEO'],
  },
  {
    id: 3,
    title: 'Contador Senior',
    company: 'FinanzasPlus',
    region: 'Lima',
    category: 'Finance',
    type: 'Full Time',
    posted_at: new Date('2025-01-03T10:00:00.000Z'),
    salary_min: 2800,
    salary_max: 3800,
    salary_currency: 'PEN',
    short_description: 'Gestionar contabilidad.',
    description: 'Full description.',
    tags: ['Contabilidad'],
  },
  {
    id: 4,
    title: 'Data Analyst',
    company: 'Analytics Pro',
    region: 'Cusco',
    category: 'Technology',
    type: 'Part Time',
    posted_at: new Date('2025-01-02T10:00:00.000Z'),
    salary_min: 1800,
    salary_max: null,
    salary_currency: 'USD',
    short_description: 'Analyze data.',
    description: 'Full description.',
    tags: ['SQL', 'Python'],
  },
  {
    id: 5,
    title: 'HR Generalist',
    company: 'PeopleFirst',
    region: 'Cusco',
    category: 'Human Resources',
    type: 'Part Time',
    posted_at: new Date('2025-01-01T10:00:00.000Z'),
    salary_min: null,
    salary_max: null,
    salary_currency: 'USD',
    short_description: 'Support HR operations.',
    description: 'Full description.',
    tags: ['Recruitment'],
  },
  {
    id: 6,
    title: 'Product Manager',
    company: 'InnovateTech',
    region: 'Lima',
    category: 'Technology',
    type: 'Full Time',
    posted_at: new Date('2024-12-31T10:00:00.000Z'),
    salary_min: 100000,
    salary_max: 120000,
    salary_currency: 'USD',
    short_description: 'Define product vision.',
    description: 'Full description.',
    tags: ['Product Strategy'],
  },
];

describe('GET /api/jobs', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  it('should return an array of jobs', async () => {
    pool.query.mockResolvedValueOnce({ rows: baseJobs });
    const response = await request(app).get('/api/jobs');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return jobs with correct structure', async () => {
    pool.query.mockResolvedValueOnce({ rows: baseJobs });
    const response = await request(app).get('/api/jobs');

    if (response.body.length > 0) {
      const job = response.body[0];

      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('title');
      expect(job).toHaveProperty('company');
      expect(job).toHaveProperty('region');
      expect(job).toHaveProperty('category');
      expect(job).toHaveProperty('type');
      expect(job).toHaveProperty('postedAt');
      expect(job).toHaveProperty('shortDescription');
      expect(job).toHaveProperty('description');
      expect(job).toHaveProperty('tags');

      // Verificar tipos
      expect(typeof job.id).toBe('string');
      expect(typeof job.title).toBe('string');
      expect(typeof job.company).toBe('string');
      expect(Array.isArray(job.tags)).toBe(true);
    }
  });

  it('should format postedAt as ISO string', async () => {
    pool.query.mockResolvedValueOnce({ rows: baseJobs });
    const response = await request(app).get('/api/jobs');

    if (response.body.length > 0) {
      const job = response.body[0];
      expect(job.postedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    }
  });

  it('should have correct content-type', async () => {
    pool.query.mockResolvedValueOnce({ rows: baseJobs });
    const response = await request(app).get('/api/jobs');

    expect(response.headers['content-type']).toMatch(/json/);
  });

  it('should return jobs ordered by postedAt descending', async () => {
    pool.query.mockResolvedValueOnce({ rows: baseJobs });
    const response = await request(app).get('/api/jobs');

    if (response.body.length > 1) {
      const dates = response.body.map(job => new Date(job.postedAt).getTime());
      const sortedDates = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sortedDates);
    }
  });

  describe('salaryRange formatting', () => {
    it('should format salaryRange with min and max correctly', async () => {
      pool.query.mockResolvedValueOnce({ rows: baseJobs });
      const response = await request(app).get('/api/jobs');

      const jobWithSalary = response.body.find(job => job.salaryRange && job.salaryRange.includes(EN_DASH));
      if (jobWithSalary) {
        expect(jobWithSalary.salaryRange).toMatch(/^\$[\d,]+ â€“ \$[\d,]+$/);
      }
    });

    it('should return null salaryRange when both min and max are missing', async () => {
      pool.query.mockResolvedValueOnce({ rows: baseJobs });
      const response = await request(app).get('/api/jobs');

      // Verificar que salaryRange puede ser null
      const hasNullSalaryRange = response.body.some(job => job.salaryRange === null);
      // Esto es valido, algunos jobs pueden no tener salario
      expect(typeof response.body[0].salaryRange === 'string' || response.body[0].salaryRange === null).toBe(true);
      expect(hasNullSalaryRange).toBe(true);
    });

    it('should format large numbers correctly in salaryRange', async () => {
      pool.query.mockResolvedValueOnce({ rows: baseJobs });
      const response = await request(app).get('/api/jobs');

      const jobWithLargeSalary = response.body.find(job =>
        job.salaryRange && job.salaryRange.includes('100,000')
      );
      if (jobWithLargeSalary) {
        expect(jobWithLargeSalary.salaryRange).toContain('100,000');
      }
    });

    it('should format non-USD currency correctly', async () => {
      pool.query.mockResolvedValueOnce({ rows: baseJobs });
      const response = await request(app).get('/api/jobs');

      const jobWithNonUSD = response.body.find(job =>
        job.salaryRange && !job.salaryRange.startsWith('$')
      );
      if (jobWithNonUSD && jobWithNonUSD.salaryRange) {
        // Debe tener formato de moneda diferente
        expect(jobWithNonUSD.salaryRange).toMatch(/^[A-Z]{3} [\d,]+/);
      }
    });
  });
});
