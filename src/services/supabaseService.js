import { supabase } from "../lib/supabase";

export async function getAllUploads() {
  const { data, error } = await supabase.from("uploads").select("*");
  if (error) throw error;
  return data;
}

export async function uploadPDFToSupabase(file) {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("Pdfs")
    .upload(fileName, file);
  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from("Pdfs").getPublicUrl(fileName);

  await supabase.from("uploads").insert({
    file_name: fileName,
    file_url: publicUrlData.publicUrl,
  });

  return publicUrlData.publicUrl;
}
