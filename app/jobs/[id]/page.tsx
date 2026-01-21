import Link from 'next/link';
import { notFound } from 'next/navigation';

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');

async function getJob(id: string) {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/jobs/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function JobPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);
  if (!job) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#1a1a1a] px-6 py-4">
        <Link href="/" className="text-xl font-bold">Portco.Jobs</Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/" className="text-[#888] hover:text-white mb-6 inline-block">Back to jobs</Link>
        <div className="bg-[#111] border border-[#222] rounded-lg p-8 mt-4">
          <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
          <Link href={`/companies/${slugify(job.company)}`} className="text-[#888] hover:text-white">{job.company}</Link>
          <div className="flex gap-4 my-4 text-sm text-[#888]">
            <span>{job.location}</span>
            <span>{job.datePosted}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href={`/companies/${slugify(job.company)}`} className="px-3 py-1 bg-[#2D4A3E] text-[#6EE7B7] rounded-md text-sm">{job.company}</Link>
            {job.industry && <Link href={`/industry/${slugify(job.industry)}`} className="px-3 py-1 bg-[#3D2D4A] text-[#C4B5FD] rounded-md text-sm">{job.industry}</Link>}
            {job.investors?.slice(0,3).map((inv: string) => <Link key={inv} href={`/investors/${slugify(inv)}`} className="px-3 py-1 bg-[#4A3D2D] text-[#FCD34D] rounded-md text-sm">{inv}</Link>)}
          </div>
          <a href={job.applyUrl || job.jobUrl} target="_blank" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Apply</a>
        </div>
      </main>
    </div>
  );
}
