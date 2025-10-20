import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aoknqmjavdiwfxceehvs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFva25xbWphdmRpd2Z4Y2VlaHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjY4MDksImV4cCI6MjA3NjAwMjgwOX0.vABbF0FdtoqREoOAxIsxEp0358u57ItH6SwBlLguU4c";

export const supabase = createClient(supabaseUrl, supabaseKey);

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