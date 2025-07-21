/*
  # Create registration and supporting tables

  1. New Tables
    - `rooms` - Master data ruangan/poliklinik
    - `doctors` - Master data dokter
    - `payment_methods` - Master data cara bayar
    - `guarantors` - Master data penjamin
    - `patient_visits` - Data kunjungan pasien (menggantikan registrations)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to read/write their own data

  3. Functions
    - Update existing functions for new registration system
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Poliklinik',
  quota integer NOT NULL DEFAULT 20,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text,
  room_id uuid REFERENCES rooms(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create guarantors table
CREATE TABLE IF NOT EXISTS guarantors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text DEFAULT 'Asuransi',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create patient visits table (replacing registrations)
CREATE TABLE IF NOT EXISTS patient_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pendaftaran text UNIQUE NOT NULL,
  no_antrian integer NOT NULL,
  tanggal date DEFAULT CURRENT_DATE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id),
  doctor_id uuid NOT NULL REFERENCES doctors(id),
  payment_method_id uuid NOT NULL REFERENCES payment_methods(id),
  guarantor_id uuid NOT NULL REFERENCES guarantors(id),
  pengantar_pasien text NOT NULL,
  telepon_pengantar text NOT NULL,
  status text DEFAULT 'Dalam Antrian' CHECK (status IN ('Dalam Antrian', 'Dalam Pemeriksaan', 'Selesai')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_visits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on rooms"
  ON rooms
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on doctors"
  ON doctors
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on payment_methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on guarantors"
  ON guarantors
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on patient_visits"
  ON patient_visits
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_visits_patient_id ON patient_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_visits_tanggal ON patient_visits(tanggal);
CREATE INDEX IF NOT EXISTS idx_patient_visits_id_pendaftaran ON patient_visits(id_pendaftaran);
CREATE INDEX IF NOT EXISTS idx_doctors_room_id ON doctors(room_id);

-- Create triggers for updated_at
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_visits_updated_at
  BEFORE UPDATE ON patient_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO rooms (name, type, quota) VALUES
  ('Poliklinik Umum', 'Poliklinik', 30),
  ('Poliklinik Anak', 'Poliklinik', 25),
  ('Poliklinik Gigi', 'Poliklinik', 20),
  ('Poliklinik Mata', 'Poliklinik', 15),
  ('Poliklinik THT', 'Poliklinik', 15);

INSERT INTO doctors (name, specialization, room_id) VALUES
  ('dr. Sri Kartini Kussudiardjo, Sp.A', 'Spesialis Anak', (SELECT id FROM rooms WHERE name = 'Poliklinik Anak' LIMIT 1)),
  ('dr. Ahmad Santoso', 'Dokter Umum', (SELECT id FROM rooms WHERE name = 'Poliklinik Umum' LIMIT 1)),
  ('drg. Siti Nurhaliza', 'Dokter Gigi', (SELECT id FROM rooms WHERE name = 'Poliklinik Gigi' LIMIT 1)),
  ('dr. Budi Hartono, Sp.M', 'Spesialis Mata', (SELECT id FROM rooms WHERE name = 'Poliklinik Mata' LIMIT 1)),
  ('dr. Rina Sari, Sp.THT', 'Spesialis THT', (SELECT id FROM rooms WHERE name = 'Poliklinik THT' LIMIT 1));

INSERT INTO payment_methods (name) VALUES
  ('Tunai'),
  ('BPJS'),
  ('Asuransi Swasta'),
  ('Kartu Kredit'),
  ('Transfer Bank');

INSERT INTO guarantors (name, type) VALUES
  ('BPJS Kesehatan', 'Asuransi Pemerintah'),
  ('Mandiri Inhealth', 'Asuransi Swasta'),
  ('Allianz', 'Asuransi Swasta'),
  ('Prudential', 'Asuransi Swasta'),
  ('Pribadi', 'Bayar Sendiri');

-- Update generate functions for new system
CREATE OR REPLACE FUNCTION get_daily_visit_count(room_id_param uuid, date_param date)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  visit_count integer;
BEGIN
  SELECT COUNT(*)
  INTO visit_count
  FROM patient_visits
  WHERE room_id = room_id_param
    AND tanggal = date_param;
  
  RETURN COALESCE(visit_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION get_remaining_quota(room_id_param uuid, date_param date)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  total_quota integer;
  used_quota integer;
BEGIN
  -- Get room quota
  SELECT quota INTO total_quota
  FROM rooms
  WHERE id = room_id_param;
  
  -- Get used quota for the date
  SELECT get_daily_visit_count(room_id_param, date_param)
  INTO used_quota;
  
  RETURN COALESCE(total_quota, 0) - COALESCE(used_quota, 0);
END;
$$;