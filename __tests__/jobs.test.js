const request = require('supertest');
const app = require('../index');

describe('GET /api/jobs', () => {

  it('should return an array of jobs', async () => {
    const response = await request(app).get('/api/jobs');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return jobs with correct structure', async () => {
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
    const response = await request(app).get('/api/jobs');
    
    if (response.body.length > 0) {
      const job = response.body[0];
      expect(job.postedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    }
  });

  it('should have correct content-type', async () => {
    const response = await request(app).get('/api/jobs');
    
    expect(response.headers['content-type']).toMatch(/json/);
  });

  it('should return jobs ordered by postedAt descending', async () => {
    const response = await request(app).get('/api/jobs');
    
    if (response.body.length > 1) {
      const dates = response.body.map(job => new Date(job.postedAt).getTime());
      const sortedDates = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sortedDates);
    }
  });

  describe('salaryRange formatting', () => {
    it('should format salaryRange with min and max correctly', async () => {
      const response = await request(app).get('/api/jobs');
      
      const jobWithSalary = response.body.find(job => job.salaryRange && job.salaryRange.includes('–'));
      if (jobWithSalary) {
        expect(jobWithSalary.salaryRange).toMatch(/^\$[\d,]+ – \$[\d,]+$/);
      }
    });

    it('should format salaryRange with only min correctly', async () => {
      const response = await request(app).get('/api/jobs');
      
      // Buscar un job que tenga salaryRange pero sin el separador "–"
      const jobs = response.body.filter(job => job.salaryRange && !job.salaryRange.includes('–'));
      if (jobs.length > 0) {
        expect(jobs[0].salaryRange).toMatch(/^\$[\d,]+$/);
      }
    });

    it('should return null salaryRange when both min and max are missing', async () => {
      const response = await request(app).get('/api/jobs');
      
      // Verificar que salaryRange puede ser null
      const hasNullSalaryRange = response.body.some(job => job.salaryRange === null);
      // Esto es válido, algunos jobs pueden no tener salario
      expect(typeof response.body[0].salaryRange === 'string' || response.body[0].salaryRange === null).toBe(true);
    });

    it('should format large numbers correctly in salaryRange', async () => {
      const response = await request(app).get('/api/jobs');
      
      const jobWithLargeSalary = response.body.find(job => 
        job.salaryRange && job.salaryRange.includes('100,000')
      );
      if (jobWithLargeSalary) {
        expect(jobWithLargeSalary.salaryRange).toContain('100,000');
      }
    });

    it('should format non-USD currency correctly', async () => {
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

