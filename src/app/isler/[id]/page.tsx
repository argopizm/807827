export const runtime = 'edge';

import { use } from "react";
import JobDetailClient from "./JobDetailClient";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return <JobDetailClient id={id} />;
}
