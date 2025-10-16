import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aokmqmjavidwfxceehvs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFva21xbWphdmlkd2Z4Y2VlaHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2ODU1MjMsImV4cCI6MjA0OTI2MTUyM30.8A6eQ0bXw1Y4X6e7Q2Q5Xw7Z8X9Y0Z1A2B3C4D5E6F7G8H9I0J";

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Teste de conexão (opcional)
export const testarConexao = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);
    
    return { data, error };
  } catch (error) {
    return { error };
  }
};