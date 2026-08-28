import { supabase } from "@/integrations/supabase/client";

const BUCKET = "consignment_photos";

export function extractStoragePath(urlOrPath: string): string {
  if (!urlOrPath) return "";
  if (!urlOrPath.startsWith("http")) return urlOrPath;
  const publicMarker = `/object/public/${BUCKET}/`;
  const publicIdx = urlOrPath.indexOf(publicMarker);
  if (publicIdx !== -1) return urlOrPath.substring(publicIdx + publicMarker.length);
  const objectMarker = `/object/${BUCKET}/`;
  const objectIdx = urlOrPath.indexOf(objectMarker);
  if (objectIdx !== -1) return urlOrPath.substring(objectIdx + objectMarker.length);
  return urlOrPath;
}

export async function getConsignmentPhotoUrl(urlOrPath: string | null, expirySeconds = 60 * 60 * 24 * 7): Promise<string | null> {
  if (!urlOrPath) return null;
  const path = extractStoragePath(urlOrPath);
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expirySeconds);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
