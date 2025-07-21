import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { Patient } from '../../types';
import Breadcrumb from '../Layout/Breadcrumb';
import { patientService } from '../../services/patientService';

interface PatientsDataProps {
  onNavigateToDashboard: () => void;
  onNavigateToNewPatient: () => void;
  onSelectPatient?: (patient: Patient) => void;
  onShowNotification?: (type: 'success' | 'error', message: string) => void;
}

const PatientsData: React.FC<PatientsDataProps> = ({ 
  onNavigateToDashboard, 
  onNavigateToNewPatient, 
  onSelectPatient,
  onShowNotification
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredPatients = patients.filter(patient =>
    patient.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.rekamMedik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePatient = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) {
      try {
        await patientService.deletePatient(id);
        setPatients(prev => prev.filter(p => p.id !== id));
        onShowNotification?.('success', 'Data pasien berhasil dihapus');
      } catch (error) {
        console.error('Error deleting patient:', error);
        onShowNotification?.('error', 'Gagal menghapus data pasien');
      }
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateToDashboard },
          { label: 'Data Pasien', active: true }
        ]}
      />
      
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Data Pasien</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pasien..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={onNavigateToNewPatient}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Pasien Baru</span>
        </button>
      </div>

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
                Jenis Kelamin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Lahir
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telepon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Tidak ada data pasien.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectPatient && handleSelectPatient(patient)}
                >
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
                    {patient.telepon}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit patient functionality
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // View patient details
                        }}
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient.id);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

export default PatientsData;