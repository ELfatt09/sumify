import { supabase } from "../lib/supabase";

export async function getAllUploads() {
  try { 
    const { data, error } = await supabase.from("uploads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
  } catch (error) { 
    throw error
  }
  
}

export async function uploadPDFToSupabase(file) {
  const fileName = `${Date.now()}-${file.name}`;
  const fileTitle = file.name.split(".")[0];
  const { data, error } = await supabase.storage
    .from("Pdfs")
    .upload(fileName, file);
  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from("Pdfs").getPublicUrl(fileName);

  await supabase.from("uploads").insert({
    file_name: fileName,
    file_url: publicUrlData.publicUrl,
    title: fileTitle,
  });

  return publicUrlData.publicUrl;
}

export async function deletePDFFromSupabase(uploadId) {
  try {
    const { data, error } = await supabase.functions.invoke("delete-upload", { body: { uploadId } });
    if (error) throw error;
    return null;
  } catch (error) {
    throw error.error;
  }
  
}
