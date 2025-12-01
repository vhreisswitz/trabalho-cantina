import * as FileSystem from "expo-file-system";
import { supabase } from "../services/database";
import { Buffer } from "buffer";

export async function uploadFotoPerfil(localUri, userId) {
  try {
    // Nome do arquivo no storage
    const fileName = `profile_${userId}.jpg`;

    // Lê a imagem como base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileBuffer = Buffer.from(base64, "base64");

    // Upload pro Supabase Storage
    const { data, error } = await supabase.storage
      .from("profiles")
      .upload(fileName, fileBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Erro ao enviar imagem:", error);
      return null;
    }

    // Gera URL pública
    const { data: publicUrl } = supabase.storage
      .from("profiles")
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;

  } catch (err) {
    console.error("Erro geral no upload:", err);
    return null;
  }
}
