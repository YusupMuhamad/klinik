/*
  # Create Clinic Management System Schema

  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `rekam_medik` (text, unique, auto-generated)
      - `nama_lengkap` (text, required)
      - `jenis_identitas` (text, required)
      - `nomor_identitas` (text, required)
      - `tempat_lahir` (text, required)
      - `tanggal_lahir` (date, required)
      - `jenis_kelamin` (text, required)
      - `golongan_darah` (text)
      - `status_perkawinan` (text)
      - `nama_suami` (text)
      - `nama_ibu` (text, required)
      - `pendidikan` (text)
      - `pekerjaan` (text)
      - `kewarganegaraan` (text)
      - `agama` (text)
      - `suku` (text)
      - `bahasa` (text)
      - `alamat` (text, required)
      - `rt` (text)
      - `rw` (text)
      - `provinsi` (text)
      - `kabupaten` (text)
      - `kecamatan` (text)
      - `kelurahan` (text)
      - `kode_pos` (text)
      - `telepon` (text, required)
      - `hubungan_penanggung_jawab` (text, required)
      - `nama_penanggung_jawab` (text, required)
      - `telepon_penanggung_jawab` (text, required)
      - `foto_ktp` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `registrations`
      - `id` (uuid, primary key)
      - `id_pendaftaran` (text, unique, auto-generated)
      - `no_antrian` (integer, auto-increment)
      - `tanggal` (date, required)
      - `patient_id` (uuid, foreign key to patients)
      - `status` (text, default 'Dalam Antrian')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their clinic data
    - Add policies for public read access where appropriate

  3. Functions
    - Auto-generate rekam_medik with 6-digit format
    - Auto-generate id_pendaftaran with RJYYYYMMDDXXX format
    - Auto-increment no_antrian per day
*/

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rekam_medik text UNIQUE NOT NULL,
  nama_lengkap text NOT NULL,
  jenis_identitas text NOT NULL,
  nomor_identitas text NOT NULL,
  tempat_lahir text NOT NULL,
  tanggal_lahir date NOT NULL,
  jenis_kelamin text NOT NULL,
  golongan_darah text DEFAULT '',
  status_perkawinan text DEFAULT '',
  nama_suami text DEFAULT '',
  nama_ibu text NOT NULL,
  pendidikan text DEFAULT '',
  pekerjaan text DEFAULT '',
  kewarganegaraan text DEFAULT '',
  agama text DEFAULT '',
  suku text DEFAULT '',
  bahasa text DEFAULT '',
  alamat text NOT NULL,
  rt text DEFAULT '',
  rw text DEFAULT '',
  provinsi text DEFAULT '',
  kabupaten text DEFAULT '',
  kecamatan text DEFAULT '',
  kelurahan text DEFAULT '',
  kode_pos text DEFAULT '',
  telepon text NOT NULL,
  hubungan_penanggung_jawab text NOT NULL,
  nama_penanggung_jawab text NOT NULL,
  telepon_penanggung_jawab text NOT NULL,
  foto_ktp text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pendaftaran text UNIQUE NOT NULL,
  no_antrian integer NOT NULL,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Dalam Antrian',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Allow all operations on patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for registrations table
CREATE POLICY "Allow all operations on registrations"
  ON registrations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to generate rekam_medik
CREATE OR REPLACE FUNCTION generate_rekam_medik()
RETURNS text AS $$
DECLARE
  next_number integer;
  rekam_medik_result text;
BEGIN
  -- Get the next number by counting existing patients + 1
  SELECT COALESCE(MAX(CAST(rekam_medik AS integer)), 0) + 1
  INTO next_number
  FROM patients
  WHERE rekam_medik ~ '^[0-9]+$';
  
  -- Format as 6-digit string
  rekam_medik_result := LPAD(next_number::text, 6, '0');
  
  RETURN rekam_medik_result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate id_pendaftaran
CREATE OR REPLACE FUNCTION generate_id_pendaftaran()
RETURNS text AS $$
DECLARE
  current_date_str text;
  next_number integer;
  id_pendaftaran_result text;
BEGIN
  -- Get current date in YYYYMMDD format
  current_date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  -- Get the next number for today
  SELECT COALESCE(MAX(CAST(RIGHT(id_pendaftaran, 3) AS integer)), 0) + 1
  INTO next_number
  FROM registrations
  WHERE id_pendaftaran LIKE 'RJ' || current_date_str || '%';
  
  -- Format as RJ + date + 3-digit number
  id_pendaftaran_result := 'RJ' || current_date_str || LPAD(next_number::text, 3, '0');
  
  RETURN id_pendaftaran_result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate no_antrian
CREATE OR REPLACE FUNCTION generate_no_antrian()
RETURNS integer AS $$
DECLARE
  next_antrian integer;
BEGIN
  -- Get the next antrian number for today
  SELECT COALESCE(MAX(no_antrian), 0) + 1
  INTO next_antrian
  FROM registrations
  WHERE tanggal = CURRENT_DATE;
  
  RETURN next_antrian;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_rekam_medik ON patients(rekam_medik);
CREATE INDEX IF NOT EXISTS idx_patients_nama_lengkap ON patients(nama_lengkap);
CREATE INDEX IF NOT EXISTS idx_registrations_id_pendaftaran ON registrations(id_pendaftaran);
CREATE INDEX IF NOT EXISTS idx_registrations_tanggal ON registrations(tanggal);
CREATE INDEX IF NOT EXISTS idx_registrations_patient_id ON registrations(patient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();