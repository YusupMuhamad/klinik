import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          rekam_medik: string;
          nama_lengkap: string;
          jenis_identitas: string;
          nomor_identitas: string;
          tempat_lahir: string;
          tanggal_lahir: string;
          jenis_kelamin: string;
          golongan_darah: string;
          status_perkawinan: string;
          nama_suami: string;
          nama_ibu: string;
          pendidikan: string;
          pekerjaan: string;
          kewarganegaraan: string;
          agama: string;
          suku: string;
          bahasa: string;
          alamat: string;
          rt: string;
          rw: string;
          provinsi: string;
          kabupaten: string;
          kecamatan: string;
          kelurahan: string;
          kode_pos: string;
          telepon: string;
          hubungan_penanggung_jawab: string;
          nama_penanggung_jawab: string;
          telepon_penanggung_jawab: string;
          foto_rontgen: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rekam_medik?: string;
          nama_lengkap: string;
          jenis_identitas: string;
          nomor_identitas: string;
          tempat_lahir: string;
          tanggal_lahir: string;
          jenis_kelamin: string;
          golongan_darah?: string;
          status_perkawinan?: string;
          nama_suami?: string;
          nama_ibu: string;
          pendidikan?: string;
          pekerjaan?: string;
          kewarganegaraan?: string;
          agama?: string;
          suku?: string;
          bahasa?: string;
          alamat: string;
          rt?: string;
          rw?: string;
          provinsi?: string;
          kabupaten?: string;
          kecamatan?: string;
          kelurahan?: string;
          kode_pos?: string;
          telepon: string;
          hubungan_penanggung_jawab: string;
          nama_penanggung_jawab: string;
          telepon_penanggung_jawab: string;
          foto_rontgen?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rekam_medik?: string;
          nama_lengkap?: string;
          jenis_identitas?: string;
          nomor_identitas?: string;
          tempat_lahir?: string;
          tanggal_lahir?: string;
          jenis_kelamin?: string;
          golongan_darah?: string;
          status_perkawinan?: string;
          nama_suami?: string;
          nama_ibu?: string;
          pendidikan?: string;
          pekerjaan?: string;
          kewarganegaraan?: string;
          agama?: string;
          suku?: string;
          bahasa?: string;
          alamat?: string;
          rt?: string;
          rw?: string;
          provinsi?: string;
          kabupaten?: string;
          kecamatan?: string;
          kelurahan?: string;
          kode_pos?: string;
          telepon?: string;
          hubungan_penanggung_jawab?: string;
          nama_penanggung_jawab?: string;
          telepon_penanggung_jawab?: string;
          foto_rontgen?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          id_pendaftaran: string;
          no_antrian: number;
          tanggal: string;
          patient_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          id_pendaftaran?: string;
          no_antrian?: number;
          tanggal?: string;
          patient_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          id_pendaftaran?: string;
          no_antrian?: number;
          tanggal?: string;
          patient_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      generate_rekam_medik: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_id_pendaftaran: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_no_antrian: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
  };
}