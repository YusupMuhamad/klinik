export interface Patient {
  id: string;
  rekamMedik: string;
  namaLengkap: string;
  jenisIdentitas: string;
  nomorIdentitas: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  golonganDarah: string;
  statusPerkawinan: string;
  namaSuami?: string;
  namaIbu: string;
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
  kodePos: string;
  telepon: string;
  hubunganPenanggungJawab: string;
  namaPenanggungJawab: string;
  teleponPenanggungJawab: string;
  fotoRontgen?: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  idPendaftaran: string;
  noAntrian: number;
  tanggal: string;
  noRekamMedik: string;
  pasien: string;
  status: 'Dalam Antrian' | 'Dalam Pemeriksaan' | 'Selesai';
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  quota: number;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  roomId: string;
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Guarantor {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export interface PatientVisit {
  id: string;
  idPendaftaran: string;
  noAntrian: number;
  tanggal: string;
  patientId: string;
  roomId: string;
  doctorId: string;
  paymentMethodId: string;
  guarantorId: string;
  pengantarPasien: string;
  teleponPengantar: string;
  status: 'Dalam Antrian' | 'Dalam Pemeriksaan' | 'Selesai';
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  role: 'administrasi' | 'dokter';
  name: string;
  email: string;
}