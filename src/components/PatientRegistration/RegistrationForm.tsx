import React, { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { Patient, Room, Doctor, PaymentMethod, Guarantor, PatientVisit } from '../../types';
import Breadcrumb from '../Layout/Breadcrumb';
import { patientService } from '../../services/patientService';
import { visitService } from '../../services/visitService';

interface RegistrationFormProps {
  selectedPatient?: Patient;
  onNavigateToDashboard: () => void;
  onNavigateToRegistration: () => void;
  onNavigateToPatientSelection: () => void;
  onSubmit: (visitData: Omit<PatientVisit, 'id' | 'idPendaftaran' | 'noAntrian' | 'createdAt'>) => void;
  onCancel: () => void;
  onShowNotification?: (type: 'success' | 'error', message: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  selectedPatient,
  onNavigateToDashboard,
  onNavigateToRegistration,
  onNavigateToPatientSelection,
  onSubmit,
  onCancel,
  onShowNotification
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPatientId, setSelectedPatientId] = useState(selectedPatient?.id || '');
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(selectedPatient || null);
  const [quota, setQuota] = useState({ remaining: 0, total: 0 });
  
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    roomId: '',
    doctorId: '',
    paymentMethodId: '',
    guarantorId: '',
    pengantarPasien: '',
    teleponPengantar: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      const patient = patients.find(p => p.id === selectedPatientId);
      setSelectedPatientData(patient || null);
    }
  }, [selectedPatientId, patients]);

  useEffect(() => {
    if (formData.roomId) {
      loadDoctorsByRoom(formData.roomId);
      updateQuota();
    }
  }, [formData.roomId, formData.tanggal]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [patientsData, roomsData, paymentMethodsData, guarantorsData] = await Promise.all([
        patientService.getAllPatients(),
        visitService.getRooms(),
        visitService.getPaymentMethods(),
        visitService.getGuarantors()
      ]);

      setPatients(patientsData);
      setRooms(roomsData);
      setPaymentMethods(paymentMethodsData);
      setGuarantors(guarantorsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      onShowNotification?.('error', 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorsByRoom = async (roomId: string) => {
    try {
      const doctorsData = await visitService.getDoctorsByRoom(roomId);
      setDoctors(doctorsData);
      
      // Reset doctor selection if current doctor is not in the new room
      if (formData.doctorId && !doctorsData.find(d => d.id === formData.doctorId)) {
        setFormData(prev => ({ ...prev, doctorId: '' }));
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      onShowNotification?.('error', 'Gagal memuat data dokter');
    }
  };

  const updateQuota = async () => {
    if (formData.roomId && formData.tanggal) {
      try {
        const quotaData = await visitService.getRemainingQuota(formData.roomId, formData.tanggal);
        setQuota(quotaData);
      } catch (error) {
        console.error('Error updating quota:', error);
        setQuota({ remaining: 0, total: 0 });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedPatientId) newErrors.patient = 'Pasien wajib dipilih';
    if (!formData.roomId) newErrors.roomId = 'Ruangan wajib dipilih';
    if (!formData.doctorId) newErrors.doctorId = 'Dokter wajib dipilih';
    if (!formData.paymentMethodId) newErrors.paymentMethodId = 'Cara bayar wajib dipilih';
    if (!formData.guarantorId) newErrors.guarantorId = 'Penjamin wajib dipilih';
    if (!formData.pengantarPasien.trim()) newErrors.pengantarPasien = 'Pengantar pasien wajib diisi';
    if (!formData.teleponPengantar.trim()) newErrors.teleponPengantar = 'Telepon pengantar wajib diisi';

    if (quota.remaining <= 0) {
      newErrors.quota = 'Kuota untuk ruangan ini sudah habis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        tanggal: formData.tanggal,
        patientId: selectedPatientId,
        roomId: formData.roomId,
        doctorId: formData.doctorId,
        paymentMethodId: formData.paymentMethodId,
        guarantorId: formData.guarantorId,
        pengantarPasien: formData.pengantarPasien,
        teleponPengantar: formData.teleponPengantar,
        status: 'Dalam Antrian'
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateToDashboard },
          { label: 'Pendaftaran Pasien', onClick: onNavigateToRegistration },
          { label: 'Buat Pendaftaran Pasien', active: true }
        ]}
      />
      
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Pendaftaran Pasien</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Data Pribadi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Pribadi</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pasien</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.patient ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Pilih Pasien</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.namaLengkap}
                    </option>
                  ))}
                </select>
                {errors.patient && (
                  <p className="mt-1 text-sm text-red-600">{errors.patient}</p>
                )}
              </div>

              {selectedPatientData && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No Rekam Medik</label>
                    <input
                      type="text"
                      value={selectedPatientData.rekamMedik}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Identitas</label>
                    <input
                      type="text"
                      value={selectedPatientData.jenisIdentitas}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                    <input
                      type="text"
                      value={selectedPatientData.nomorIdentitas}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={selectedPatientData.tempatLahir}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={selectedPatientData.tanggalLahir}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                    <input
                      type="text"
                      value={selectedPatientData.jenisKelamin}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
                    <input
                      type="text"
                      value={selectedPatientData.golonganDarah || '-'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
                    <input
                      type="text"
                      value={selectedPatientData.statusPerkawinan || '-'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card Data Kunjungan & Pengantar */}
          <div className="space-y-6">
            {/* Card Data Kunjungan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Kunjungan</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => handleInputChange('tanggal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan (Poliklinik)</label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => handleInputChange('roomId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.roomId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Pilih Ruangan</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                  {errors.roomId && (
                    <p className="mt-1 text-sm text-red-600">{errors.roomId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dokter</label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => handleInputChange('doctorId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.doctorId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                    disabled={!formData.roomId}
                  >
                    <option value="">Pilih Dokter</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                  {errors.doctorId && (
                    <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sisa Kuota</label>
                    <input
                      type="text"
                      value={quota.remaining}
                      readOnly
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600 ${
                        quota.remaining <= 0 ? 'text-red-600 border-red-300' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Kuota</label>
                    <input
                      type="text"
                      value={quota.total}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                {errors.quota && (
                  <p className="text-sm text-red-600">{errors.quota}</p>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cara Bayar</label>
                  <select
                    value={formData.paymentMethodId}
                    onChange={(e) => handleInputChange('paymentMethodId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.paymentMethodId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Pilih Cara Bayar</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  {errors.paymentMethodId && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentMethodId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penjamin</label>
                  <select
                    value={formData.guarantorId}
                    onChange={(e) => handleInputChange('guarantorId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.guarantorId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Pilih Penjamin</option>
                    {guarantors.map((guarantor) => (
                      <option key={guarantor.id} value={guarantor.id}>
                        {guarantor.name} - {guarantor.type}
                      </option>
                    ))}
                  </select>
                  {errors.guarantorId && (
                    <p className="mt-1 text-sm text-red-600">{errors.guarantorId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Card Pengantar Pasien */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengantar Pasien</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengantar Pasien</label>
                  <input
                    type="text"
                    value={formData.pengantarPasien}
                    onChange={(e) => handleInputChange('pengantarPasien', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.pengantarPasien ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nama pengantar pasien"
                    required
                  />
                  {errors.pengantarPasien && (
                    <p className="mt-1 text-sm text-red-600">{errors.pengantarPasien}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon Pengantar</label>
                  <input
                    type="tel"
                    value={formData.teleponPengantar}
                    onChange={(e) => handleInputChange('teleponPengantar', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.teleponPengantar ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nomor telepon pengantar"
                    required
                  />
                  {errors.teleponPengantar && (
                    <p className="mt-1 text-sm text-red-600">{errors.teleponPengantar}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Batal</span>
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;