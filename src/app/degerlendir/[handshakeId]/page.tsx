export const runtime = 'edge';

import { use } from "react";
import ReviewClient from "./ReviewClient";

export default function ReviewPage({ params }: { params: Promise<{ handshakeId: string }> }) {
  const { handshakeId } = use(params);
  
  return <ReviewClient handshakeId={handshakeId} />;
}
