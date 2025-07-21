/*
  # Rename foto_ktp column to foto_rontgen

  1. Changes
    - Rename column `foto_ktp` to `foto_rontgen` in patients table
    - Update column to better reflect its purpose for storing X-ray/rontgen images

  2. Notes
    - This is a safe operation that preserves existing data
    - Column type and constraints remain the same
*/

-- Rename the column from foto_ktp to foto_rontgen
ALTER TABLE patients 
RENAME COLUMN foto_ktp TO foto_rontgen;

-- Update the column comment to reflect the new purpose
COMMENT ON COLUMN patients.foto_rontgen IS 'URL or path to patient X-ray/rontgen image';