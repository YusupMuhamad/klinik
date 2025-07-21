import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import RegistrationTable from './RegistrationTable';
import { Registration } from '../../types';

interface PatientRegistrationProps {
  onNavigateToPatients: () => void;
  onNavigateToNewPatient: () => void;
}

const PatientRegistration: React.FC<PatientRegistrationProps> = ({ 
  onNavigateToPatients, 
  onNavigateToNewPatient 
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([
    // Sample data
    {
      id: '1',
      idPendaftaran: 'RJ20250120001',
      noAntrian: 1,
      tanggal: '2025-01-20',
      noRekamMedik: '000001',
      pasien: 'John Doe',
      status: 'Dalam Antrian',
      createdAt: '2025-01-20T08:00:00Z'
    },
    {
      id: '2',
      idPendaftaran: 'RJ20250120002',
      noAntrian: 2,
      tanggal: '2025-01-20',
      noRekamMedik: '000002',
      pasien: 'Jane Smith',
      status: 'Dalam Pemeriksaan',
      createdAt: '2025-01-20T08:30:00Z'
    }
  ]);

  const handleEdit = (registration: Registration) => {
    console.log('Edit registration:', registration);
  };

  const handleView = (registration: Registration) => {
    console.log('View registration:', registration);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pendaftaran ini?')) {
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pendaftaran Pasien</h1>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={onNavigateToPatients}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Pendaftaran Pasien Lama</span>
          </button>
          
          <button
            onClick={onNavigateToNewPatient}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Pendaftaran Pasien Baru</span>
          </button>
        </div>
      </div>

      <RegistrationTable
        registrations={registrations}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PatientRegistration;