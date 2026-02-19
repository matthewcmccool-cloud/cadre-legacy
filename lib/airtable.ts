import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types

export interface Job {
  id: string;
  title: string;
  company: string;
  company_slug: string;
  company_website: string;
  company_logo_url: string;
  company_stage: string;
  investors: string[];
  function: string;
  department: string;
  location: string;
  job_url: string;
  posted_at: string;
  industry: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  website: string;
  logo_url: string;
  stage: string;
  hq_location: string;
  about: string;
  linkedin_url: string;
  twitter_url: string;
  ats_platform: string;
  total_raised: number;
  headcount_range: string;
  industries: string[];
  investors: string[];
  open_roles_count: number;
}

export interface Investor {
  id: string;
  name: string;
  slug: string;
  website: string;
  logo_url: string;
  bio: string;
  location: string;
  type: string;
  portfolio: string[];
  portfolio_count: number;
}

export interface JobFilters {
  search?: string;
  functions?: string[];
  industries?: string[];
  locations?: string[];
  remote?: boolean;
}

// Jobs

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id, title, location, function, ats_url, posted_at, first_seen_at, is_active,
      companies (
        name, slug, website, logo_url, stage,
        company_industries ( industries ( name ) ),
        company_investors ( investors ( name ) )
      )
    `)
    .eq('is_active', true)
    .order('posted_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('fetchJobs error', error);
    return [];
  }

  return (data || []).map((job: any) => ({
    id: job.id,
    title: job.title,
    company: job.companies?.name || '',
    company_slug: job.companies?.slug || '',
    company_website: job.companies?.website || '',
    company_logo_url: job.companies?.logo_url || '',
    company_stage: job.companies?.stage || '',
    investors: job.companies?.company_investors?.map((ci: any) => ci.investors?.name).filter(Boolean) || [],
    function: job.function || '',
    department: job.function || '',
    location: job.location || '',
    job_url: job.ats_url || '',
    posted_at: job.posted_at || job.first_seen_at || '',
    industry: job.companies?.company_industries?.[0]?.industries?.name || '',
  }));
}

export async function fetchFilteredJobs(filters: JobFilters): Promise<Job[]> {
  let query = supabase
    .from('jobs')
    .select(`
      id, title, location, function, ats_url, posted_at, first_seen_at, is_active,
      companies (
        name, slug, website, logo_url, stage,
        company_industries ( industries ( name ) ),
        company_investors ( investors ( name ) )
      )
    `)
    .eq('is_active', true)
    .order('posted_at', { ascending: false });

  // server-side filters
  if (filters.functions?.length) {
    query = query.in('function', filters.functions);
  }
  if (filters.remote) {
    query = query.ilike('location', '%remote%');
  }
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query.limit(1000);

  if (error) {
    console.error('fetchFilteredJobs error', error);
    return [];
  }

  let jobs = (data || []).map((job: any) => ({
    id: job.id,
    title: job.title,
    company: job.companies?.name || '',
    company_slug: job.companies?.slug || '',
    company_website: job.companies?.website || '',
    company_logo_url: job.companies?.logo_url || '',
    company_stage: job.companies?.stage || '',
    investors: job.companies?.company_investors?.map((ci: any) => ci.investors?.name).filter(Boolean) || [],
    function: job.function || '',
    department: job.function || '',
    location: job.location || '',
    job_url: job.ats_url || '',
    posted_at: job.posted_at || job.first_seen_at || '',
    industry: job.companies?.company_industries?.[0]?.industries?.name || '',
  }));

  // client-side filters that need relational data
  if (filters.industries?.length) {
    jobs = jobs.filter((j) => filters.industries!.includes(j.industry));
  }
  if (filters.locations?.length) {
    jobs = jobs.filter((j) =>
      filters.locations!.some((l) => j.location.toLowerCase().includes(l.toLowerCase()))
    );
  }

  return jobs;
}

// Companies

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      id, name, slug, website, logo_url, stage, hq_location, about,
      linkedin_url, twitter_url, ats_platform, total_raised, headcount_range,
      company_industries ( industries ( name ) ),
      company_investors ( investors ( name ) ),
      jobs ( id, is_active )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('fetchCompanies error', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    website: c.website || '',
    logo_url: c.logo_url || '',
    stage: c.stage || '',
    hq_location: c.hq_location || '',
    about: c.about || '',
    linkedin_url: c.linkedin_url || '',
    twitter_url: c.twitter_url || '',
    ats_platform: c.ats_platform || '',
    total_raised: c.total_raised || 0,
    headcount_range: c.headcount_range || '',
    industries: c.company_industries?.map((ci: any) => ci.industries?.name).filter(Boolean) || [],
    investors: c.company_investors?.map((ci: any) => ci.investors?.name).filter(Boolean) || [],
    open_roles_count: c.jobs?.filter((j: any) => j.is_active).length || 0,
  }));
}

// Investors

export async function fetchInvestors(): Promise<Investor[]> {
  const { data, error } = await supabase
    .from('investors')
    .select(`
      id, name, slug, website, logo_url, bio, location, type,
      company_investors ( companies ( name, slug ) )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('fetchInvestors error', error);
    return [];
  }

  return (data || []).map((inv: any) => ({
    id: inv.id,
    name: inv.name,
    slug: inv.slug,
    website: inv.website || '',
    logo_url: inv.logo_url || '',
    bio: inv.bio || '',
    location: inv.location || '',
    type: inv.type || 'VC',
    portfolio: inv.company_investors?.map((ci: any) => ci.companies?.name).filter(Boolean) || [],
    portfolio_count: inv.company_investors?.length || 0,
  }));
}
