import { getJobById } from '@/lib/airtable';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CompanyLogo from '@/components/CompanyLogo';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface JobDetailPageProps {
  params: { id: string };
}

function getDomain(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return null;
  }
}

function decodeHtml(html: string): string {
  return html
      // Handle double-escaped entities first (e.g., &amp;lt; -> &lt; -> <)
  const temp = document.createElement('div');
  temp.innerHTML = html;
  let decoded = temp.textContent || temp.innerText || '';
  
  // Decode again in case of double-escaping
  temp.innerHTML = decoded;
  decoded = temp.textContent || temp.innerText || '';
  
  return decoded;
  
