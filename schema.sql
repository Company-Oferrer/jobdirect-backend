-- Crea la tabla jobs
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
);

-- Inserta un ejemplo de oferta
INSERT INTO jobs (
  title, company, region, category, type,
  posted_at, salary_min, salary_max, salary_currency,
  short_description, description, tags
) VALUES (
  'Senior Frontend Engineer',
  'BlueWave Tech',
  'Lima',
  'Technology',
  'Full Time',
  '2025-11-10T09:00:00.000Z',
  4000,
  5500,
  'USD',
  'Lead the frontend of our SaaS analytics platform using React and TypeScript.',
  'We are looking for a Senior Frontend Engineer to own the user interface of our analytics platform. You will work closely with designers and backend engineers to ship high-quality, performant experiences. Responsibilities include building reusable components, ensuring accessibility, and collaborating on architectural decisions.',
  ARRAY['React','TypeScript','SaaS','Leadership']
);
