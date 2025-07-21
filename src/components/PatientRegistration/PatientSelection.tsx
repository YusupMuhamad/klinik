import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Patient } from '../../types';
import Breadcrumb from '../Layout/Breadcrumb';
import { patientService } from '../../services/patientService';

interface PatientSelectionProps {
  onNavigateToDashboard: () => void;
  onNavigateToRegistration: () => void;
  onSelectPatient: (patient: Patient) => void;
  onShowNotification?: (type: 'success' | 'error', message: string) => void;
}

const PatientSelection: React.FC<PatientSelectionProps> = ({ 
  onNavigateToDashboard, 
  onNavigateToRegistration,
  onSelectPatient,
  onShowNotification
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    rekamMedik: '',
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: ''
  });

  // Load patients from database
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
      onShowNotification?.('error', 'Gagal memuat data pasien');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    return (
      patient.rekamMedik.toLowerCase().includes(searchFilters.rekamMedik.toLowerCase()) &&
      patient.namaLengkap.toLowerCase().includes(searchFilters.namaLengkap.toLowerCase()) &&
      patient.tempatLahir.toLowerCase().includes(searchFilters.tempatLahir.toLowerCase()) &&
      patient.tanggalLahir.includes(searchFilters.tanggalLahir) &&
      patient.jenisKelamin.toLowerCase().includes(searchFilters.jenisKelamin.toLowerCase())
    );
  });

  const handleFilterChange = (field: keyof typeof searchFilters, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      rekamMedik: '',
      namaLengkap: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenisKelamin: ''
    });
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateToDashboard },
          { label: 'Pendaftaran Pasien', onClick: onNavigateToRegistration },
          { label: 'Pilih Pasien', active: true }
        ]}
      />
      
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pilih Pasien</h1>

      {/* Search Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No Rekam Medik</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchFilters.rekamMedik}
                onChange={(e) => handleFilterChange('rekamMedik', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cari no rekam medik..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchFilters.namaLengkap}
                onChange={(e) => handleFilterChange('namaLengkap', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cari nama lengkap..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchFilters.tempatLahir}
                onChange={(e) => handleFilterChange('tempatLahir', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cari tempat lahir..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
            <input
              type="date"
              value={searchFilters.tanggalLahir}
              onChange={(e) => handleFilterChange('tanggalLahir', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
            <select
              value={searchFilters.jenisKelamin}
              onChange={(e) => handleFilterChange('jenisKelamin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Bersihkan Filter
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat data pasien...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No Rekam Medik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempat Lahir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Lahir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Kelamin
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pilih
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {patients.length === 0 ? 'Tidak ada data pasien.' : 'Tidak ada pasien yang sesuai dengan filter.'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.rekamMedik}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.namaLengkap}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.tempatLahir}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(patient.tanggalLahir).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.jenisKelamin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="inline-flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        title="Pilih pasien ini"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="mt-4 text-sm text-gray-600">
          Menampilkan {filteredPatients.length} dari {patients.length} pasien
        </div>
      )}
    </div>
  );
};

export default PatientSelection;