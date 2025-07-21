import React, { useState } from 'react';
import { useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import PatientRegistration from './components/PatientRegistration/PatientRegistration';
import PatientsData from './components/Patients/PatientsData';
import PatientForm from './components/Patients/PatientForm';
import PatientSelection from './components/PatientRegistration/PatientSelection';
import RegistrationForm from './components/PatientRegistration/RegistrationForm';
import Notification from './components/Notification';
import { User, Patient, PatientVisit } from './types';
import { patientService } from './services/patientService';
import { authService } from './lib/supabase';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('pendaftaran-pasien');
  const [currentView, setCurrentView] = useState<'dashboard' | 'pendaftaran-pasien' | 'pasien' | 'laporan' | 'new-patient' | 'patient-selection'>('pendaftaran-pasien');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    // Demo mode - no persistent login
    setIsLoading(false);
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    setUser(null);
    setCurrentView('pendaftaran-pasien');
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setCurrentView(menu as any);
  };

  const handleNavigateToPatients = () => {
    setCurrentView('patient-selection');
    setActiveMenu('pasien');
  };

  const handleNavigateToNewPatient = () => {
    setCurrentView('new-patient');
    setActiveMenu('pasien');
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('pendaftaran-pasien');
    setActiveMenu('pendaftaran-pasien');
  };

  const handleNavigateToRegistration = () => {
    setCurrentView('pendaftaran-pasien');
    setActiveMenu('pendaftaran-pasien');
  };

  const handleAddPatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
      const newPatient = await patientService.createPatient(patientData);
      setPatients(prev => [...prev, newPatient]);
      showNotification('success', 'Data pasien berhasil disimpan');
      // Navigate back to patients list
      setCurrentView('pasien');
      setActiveMenu('pasien');
    } catch (error) {
      console.error('Error adding patient:', error);
      showNotification('error', 'Gagal menyimpan data pasien');
    }
  };

  const handleSelectPatientForRegistration = (patient: Patient) => {
    console.log('Selected patient for registration:', patient);
    // TODO: Navigate to registration form with selected patient
    // For now, just go back to registration list
    setCurrentView('pendaftaran-pasien');
    setActiveMenu('pendaftaran-pasien');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Selamat datang di Sistem Klinik</p>
          </div>
        );
      case 'pendaftaran-pasien':
        return (
          <PatientRegistration 
            onNavigateToPatients={handleNavigateToPatients}
            onNavigateToNewPatient={handleNavigateToNewPatient}
          />
        );
      case 'patient-selection':
        return (
          <PatientSelection
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToRegistration={handleNavigateToRegistration}
            onSelectPatient={handleSelectPatientForRegistration}
            onShowNotification={showNotification}
          />
        );
      case 'pasien':
        return (
          <PatientsData 
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToNewPatient={handleNavigateToNewPatient}
            onShowNotification={showNotification}
            onSelectPatient={(patient) => {
              console.log('Selected patient:', patient);
              // Handle patient selection for registration
              setCurrentView('pendaftaran-pasien');
              setActiveMenu('pendaftaran-pasien');
            }}
          />
        );
      case 'new-patient':
        return (
          <PatientForm
            onSubmit={handleAddPatient}
            onCancel={() => setCurrentView('pasien')}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToPatients={() => setCurrentView('pasien')}
          />
        );
      case 'laporan':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Laporan Kunjungan</h1>
            <p className="text-gray-600 mt-2">Fitur laporan kunjungan akan segera tersedia</p>
          </div>
        );
      default:
        return (
          <PatientRegistration 
            onNavigateToPatients={handleNavigateToPatients}
            onNavigateToNewPatient={handleNavigateToNewPatient}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;