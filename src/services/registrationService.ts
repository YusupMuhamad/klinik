import { supabase } from '../lib/supabase';
import { Registration } from '../types';
import { Database } from '../lib/supabase';

type RegistrationRow = Database['public']['Tables']['registrations']['Row'];
type RegistrationInsert = Database['public']['Tables']['registrations']['Insert'];

// Convert database row to Registration type
const convertToRegistration = (row: RegistrationRow & { patients?: any }): Registration => ({
  id: row.id,
  idPendaftaran: row.id_pendaftaran,
  noAntrian: row.no_antrian,
  tanggal: row.tanggal,
  noRekamMedik: row.patients?.rekam_medik || '',
  pasien: row.patients?.nama_lengkap || '',
  status: row.status as 'Dalam Antrian' | 'Dalam Pemeriksaan' | 'Selesai',
  createdAt: row.created_at
});

export const registrationService = {
  // Get all registrations with patient data
  async getAllRegistrations(): Promise<Registration[]> {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          patients (
            rekam_medik,
            nama_lengkap
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching registrations:', error);
        throw new Error('Gagal mengambil data pendaftaran');
      }

      return data ? data.map(convertToRegistration) : [];
    } catch (error) {
      console.error('Error in getAllRegistrations:', error);
      throw error;
    }
  },

  // Create new registration
  async createRegistration(patientId: string): Promise<Registration> {
    try {
      // Generate ID pendaftaran
      const { data: idPendaftaranData, error: idError } = await supabase
        .rpc('generate_id_pendaftaran');

      if (idError) {
        console.error('Error generating ID pendaftaran:', idError);
        throw new Error('Gagal generate ID pendaftaran');
      }

      // Generate nomor antrian
      const { data: noAntrianData, error: antrianError } = await supabase
        .rpc('generate_no_antrian');

      if (antrianError) {
        console.error('Error generating nomor antrian:', antrianError);
        throw new Error('Gagal generate nomor antrian');
      }

      const insertData: RegistrationInsert = {
        id_pendaftaran: idPendaftaranData,
        no_antrian: noAntrianData,
        patient_id: patientId,
        status: 'Dalam Antrian'
      };

      const { data, error } = await supabase
        .from('registrations')
        .insert([insertData])
        .select(`
          *,
          patients (
            rekam_medik,
            nama_lengkap
          )
        `)
        .single();

      if (error) {
        console.error('Error creating registration:', error);
        throw new Error('Gagal menyimpan data pendaftaran');
      }

      return convertToRegistration(data);
    } catch (error) {
      console.error('Error in createRegistration:', error);
      throw error;
    }
  },

  // Update registration status
  async updateRegistrationStatus(id: string, status: 'Dalam Antrian' | 'Dalam Pemeriksaan' | 'Selesai'): Promise<Registration> {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          patients (
            rekam_medik,
            nama_lengkap
          )
        `)
        .single();

      if (error) {
        console.error('Error updating registration status:', error);
        throw new Error('Gagal mengupdate status pendaftaran');
      }

      return convertToRegistration(data);
    } catch (error) {
      console.error('Error in updateRegistrationStatus:', error);
      throw error;
    }
  },

  // Delete registration
  async deleteRegistration(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting registration:', error);
        throw new Error('Gagal menghapus data pendaftaran');
      }
    } catch (error) {
      console.error('Error in deleteRegistration:', error);
      throw error;
    }
  },

  // Get registrations by date range
  async getRegistrationsByDateRange(startDate: string, endDate: string): Promise<Registration[]> {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          patients (
            rekam_medik,
            nama_lengkap
          )
        `)
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching registrations by date:', error);
        throw new Error('Gagal mengambil data pendaftaran');
      }

      return data ? data.map(convertToRegistration) : [];
    } catch (error) {
      console.error('Error in getRegistrationsByDateRange:', error);
      throw error;
    }
  }
};