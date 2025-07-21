import { supabase } from '../lib/supabase';
import { PatientVisit, Room, Doctor, PaymentMethod, Guarantor } from '../types';

export const visitService = {
  // Get all rooms
  async getRooms(): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching rooms:', error);
        throw new Error('Gagal mengambil data ruangan');
      }

      return data ? data.map(room => ({
        id: room.id,
        name: room.name,
        type: room.type,
        quota: room.quota,
        isActive: room.is_active
      })) : [];
    } catch (error) {
      console.error('Error in getRooms:', error);
      throw error;
    }
  },

  // Get doctors by room
  async getDoctorsByRoom(roomId: string): Promise<Doctor[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching doctors:', error);
        throw new Error('Gagal mengambil data dokter');
      }

      return data ? data.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        roomId: doctor.room_id,
        isActive: doctor.is_active
      })) : [];
    } catch (error) {
      console.error('Error in getDoctorsByRoom:', error);
      throw error;
    }
  },

  // Get all doctors
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching doctors:', error);
        throw new Error('Gagal mengambil data dokter');
      }

      return data ? data.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        roomId: doctor.room_id,
        isActive: doctor.is_active
      })) : [];
    } catch (error) {
      console.error('Error in getAllDoctors:', error);
      throw error;
    }
  },

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching payment methods:', error);
        throw new Error('Gagal mengambil data cara bayar');
      }

      return data ? data.map(method => ({
        id: method.id,
        name: method.name,
        isActive: method.is_active
      })) : [];
    } catch (error) {
      console.error('Error in getPaymentMethods:', error);
      throw error;
    }
  },

  // Get guarantors
  async getGuarantors(): Promise<Guarantor[]> {
    try {
      const { data, error } = await supabase
        .from('guarantors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching guarantors:', error);
        throw new Error('Gagal mengambil data penjamin');
      }

      return data ? data.map(guarantor => ({
        id: guarantor.id,
        name: guarantor.name,
        type: guarantor.type,
        isActive: guarantor.is_active
      })) : [];
    } catch (error) {
      console.error('Error in getGuarantors:', error);
      throw error;
    }
  },

  // Get remaining quota for room and date
  async getRemainingQuota(roomId: string, date: string): Promise<{ remaining: number; total: number }> {
    try {
      const { data: remainingData, error: remainingError } = await supabase
        .rpc('get_remaining_quota', { 
          room_id_param: roomId, 
          date_param: date 
        });

      if (remainingError) {
        console.error('Error getting remaining quota:', remainingError);
        throw new Error('Gagal mengambil sisa kuota');
      }

      // Get total quota from room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('quota')
        .eq('id', roomId)
        .single();

      if (roomError) {
        console.error('Error getting room quota:', roomError);
        throw new Error('Gagal mengambil kuota ruangan');
      }

      return {
        remaining: remainingData || 0,
        total: roomData?.quota || 0
      };
    } catch (error) {
      console.error('Error in getRemainingQuota:', error);
      throw error;
    }
  },

  // Create patient visit
  async createPatientVisit(visitData: Omit<PatientVisit, 'id' | 'idPendaftaran' | 'noAntrian' | 'createdAt'>): Promise<PatientVisit> {
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

      const insertData = {
        id_pendaftaran: idPendaftaranData,
        no_antrian: noAntrianData,
        tanggal: visitData.tanggal,
        patient_id: visitData.patientId,
        room_id: visitData.roomId,
        doctor_id: visitData.doctorId,
        payment_method_id: visitData.paymentMethodId,
        guarantor_id: visitData.guarantorId,
        pengantar_pasien: visitData.pengantarPasien,
        telepon_pengantar: visitData.teleponPengantar,
        status: visitData.status
      };

      const { data, error } = await supabase
        .from('patient_visits')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating patient visit:', error);
        throw new Error('Gagal menyimpan data kunjungan');
      }

      return {
        id: data.id,
        idPendaftaran: data.id_pendaftaran,
        noAntrian: data.no_antrian,
        tanggal: data.tanggal,
        patientId: data.patient_id,
        roomId: data.room_id,
        doctorId: data.doctor_id,
        paymentMethodId: data.payment_method_id,
        guarantorId: data.guarantor_id,
        pengantarPasien: data.pengantar_pasien,
        teleponPengantar: data.telepon_pengantar,
        status: data.status,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error in createPatientVisit:', error);
      throw error;
    }
  }
};