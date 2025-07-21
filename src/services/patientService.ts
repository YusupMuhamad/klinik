import { supabase } from '../lib/supabase';
import { Patient } from '../types';
import { Database } from '../lib/supabase';

type PatientRow = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];

// Convert database row to Patient type
const convertToPatient = (row: PatientRow): Patient => ({
  id: row.id,
  rekamMedik: row.rekam_medik,
  namaLengkap: row.nama_lengkap,
  jenisIdentitas: row.jenis_identitas,
  nomorIdentitas: row.nomor_identitas,
  tempatLahir: row.tempat_lahir,
  tanggalLahir: row.tanggal_lahir,
  jenisKelamin: row.jenis_kelamin,
  golonganDarah: row.golongan_darah,
  statusPerkawinan: row.status_perkawinan,
  namaSuami: row.nama_suami,
  namaIbu: row.nama_ibu,
  pendidikan: row.pendidikan,
  pekerjaan: row.pekerjaan,
  kewarganegaraan: row.kewarganegaraan,
  agama: row.agama,
  suku: row.suku,
  bahasa: row.bahasa,
  alamat: row.alamat,
  rt: row.rt,
  rw: row.rw,
  provinsi: row.provinsi,
  kabupaten: row.kabupaten,
  kecamatan: row.kecamatan,
  kelurahan: row.kelurahan,
  kodePos: row.kode_pos,
  telepon: row.telepon,
  hubunganPenanggungJawab: row.hubungan_penanggung_jawab,
  namaPenanggungJawab: row.nama_penanggung_jawab,
  teleponPenanggungJawab: row.telepon_penanggung_jawab,
  fotoRontgen: row.foto_rontgen,
  createdAt: row.created_at
});

// Convert Patient type to database insert
const convertToInsert = (patient: Omit<Patient, 'id'>): PatientInsert => ({
  rekam_medik: patient.rekamMedik,
  nama_lengkap: patient.namaLengkap,
  jenis_identitas: patient.jenisIdentitas,
  nomor_identitas: patient.nomorIdentitas,
  tempat_lahir: patient.tempatLahir,
  tanggal_lahir: patient.tanggalLahir,
  jenis_kelamin: patient.jenisKelamin,
  golongan_darah: patient.golonganDarah,
  status_perkawinan: patient.statusPerkawinan,
  nama_suami: patient.namaSuami,
  nama_ibu: patient.namaIbu,
  pendidikan: patient.pendidikan,
  pekerjaan: patient.pekerjaan,
  kewarganegaraan: patient.kewarganegaraan,
  agama: patient.agama,
  suku: patient.suku,
  bahasa: patient.bahasa,
  alamat: patient.alamat,
  rt: patient.rt,
  rw: patient.rw,
  provinsi: patient.provinsi,
  kabupaten: patient.kabupaten,
  kecamatan: patient.kecamatan,
  kelurahan: patient.kelurahan,
  kode_pos: patient.kodePos,
  telepon: patient.telepon,
  hubungan_penanggung_jawab: patient.hubunganPenanggungJawab,
  nama_penanggung_jawab: patient.namaPenanggungJawab,
  telepon_penanggung_jawab: patient.teleponPenanggungJawab,
  foto_rontgen: patient.fotoRontgen
});

export const patientService = {
  // Get all patients
  async getAllPatients(): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        throw new Error('Gagal mengambil data pasien');
      }

      return data ? data.map(convertToPatient) : [];
    } catch (error) {
      console.error('Error in getAllPatients:', error);
      throw error;
    }
  },

  // Get patient by ID
  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Patient not found
        }
        console.error('Error fetching patient:', error);
        throw new Error('Gagal mengambil data pasien');
      }

      return data ? convertToPatient(data) : null;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  },

  // Create new patient
  async createPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    try {
      // Generate rekam medik
      const { data: rekamMedikData, error: rekamMedikError } = await supabase
        .rpc('generate_rekam_medik');

      if (rekamMedikError) {
        console.error('Error generating rekam medik:', rekamMedikError);
        throw new Error('Gagal generate nomor rekam medik');
      }

      const insertData = convertToInsert({
        ...patientData,
        rekamMedik: rekamMedikData
      });

      const { data, error } = await supabase
        .from('patients')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        throw new Error('Gagal menyimpan data pasien');
      }

      return convertToPatient(data);
    } catch (error) {
      console.error('Error in createPatient:', error);
      throw error;
    }
  },

  // Update patient
  async updatePatient(id: string, patientData: Partial<Omit<Patient, 'id'>>): Promise<Patient> {
    try {
      const updateData = convertToInsert(patientData as Omit<Patient, 'id'>);

      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating patient:', error);
        throw new Error('Gagal mengupdate data pasien');
      }

      return convertToPatient(data);
    } catch (error) {
      console.error('Error in updatePatient:', error);
      throw error;
    }
  },

  // Delete patient
  async deletePatient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting patient:', error);
        throw new Error('Gagal menghapus data pasien');
      }
    } catch (error) {
      console.error('Error in deletePatient:', error);
      throw error;
    }
  },

  // Search patients
  async searchPatients(searchTerm: string): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`nama_lengkap.ilike.%${searchTerm}%,rekam_medik.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching patients:', error);
        throw new Error('Gagal mencari data pasien');
      }

      return data ? data.map(convertToPatient) : [];
    } catch (error) {
      console.error('Error in searchPatients:', error);
      throw error;
    }
  }
};