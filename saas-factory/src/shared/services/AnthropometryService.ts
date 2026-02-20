"use server";

import { sql } from '@/shared/lib/neon';

export interface AnthropometricRecord {
  id?: string;
  user_id: number;
  date: string;
  athlete_name?: string;
  birth_date?: string;
  modality?: string;
  id_number?: string;
  gender?: string;
  age?: number;
  training_stage?: string;
  weight_kg: number;
  height_cm: number;
  sitting_height_cm?: number;
  wingspan_cm?: number;
  triceps_mm: number;
  subscapular_mm: number;
  biceps_mm: number;
  bicipital_mm?: number;
  iliac_crest_mm: number;
  supraspinale_mm: number;
  abdominal_mm: number;
  front_thigh_mm: number;
  medial_calf_mm: number;
  peroneal_mm?: number;
  arm_relaxed_cm: number;
  arm_flexed_cm: number;
  waist_cm: number;
  abdomen_cm?: number;
  hip_cm: number;
  thigh_cm?: number;
  thigh_upper_cm?: number;
  thigh_mid_cm?: number;
  calf_cm: number;
  forearm_cm?: number;
  humerus_cm: number;
  femur_cm: number;
  fat_percentage?: number;
  muscle_mass_kg?: number;
  bmi?: number;
  bmi_percentile?: string;
  somatotype?: {
    endo: number;
    meso: number;
    ecto: number;
  };
  created_at?: string;
  updated_at?: string;
}

export async function getAnthropometryRecords(userId: number) {
  const data = await sql`
    SELECT * FROM anthropometric_records 
    WHERE user_id = ${userId} 
    ORDER BY date DESC
  `;
  return data as AnthropometricRecord[];
}

export async function createAnthropometryRecord(record: AnthropometricRecord) {
  const somatotypeJson = record.somatotype ? JSON.stringify(record.somatotype) : null;

  const result = await sql`
    INSERT INTO anthropometric_records (
      user_id, date, athlete_name, birth_date, modality, id_number,
      gender, age, training_stage,
      weight_kg, height_cm, sitting_height_cm, wingspan_cm,
      triceps_mm, subscapular_mm, biceps_mm, bicipital_mm, 
      iliac_crest_mm, supraspinale_mm, abdominal_mm, front_thigh_mm, 
      medial_calf_mm, peroneal_mm, arm_relaxed_cm, arm_flexed_cm, 
      waist_cm, abdomen_cm, hip_cm, thigh_cm, thigh_upper_cm, 
      thigh_mid_cm, calf_cm, forearm_cm, humerus_cm, femur_cm, 
      fat_percentage, muscle_mass_kg, bmi, bmi_percentile, somatotype
    ) VALUES (
      ${record.user_id}, ${record.date}, ${record.athlete_name || null}, ${record.birth_date || null}, ${record.modality || null}, ${record.id_number || null},
      ${record.gender || null}, ${record.age || null}, ${record.training_stage || null},
      ${record.weight_kg}, ${record.height_cm}, ${record.sitting_height_cm || null}, ${record.wingspan_cm || null},
      ${record.triceps_mm}, ${record.subscapular_mm}, ${record.biceps_mm}, ${record.bicipital_mm || null},
      ${record.iliac_crest_mm}, ${record.supraspinale_mm}, ${record.abdominal_mm}, ${record.front_thigh_mm},
      ${record.medial_calf_mm}, ${record.peroneal_mm || null}, ${record.arm_relaxed_cm}, ${record.arm_flexed_cm},
      ${record.waist_cm}, ${record.abdomen_cm || null}, ${record.hip_cm}, ${record.thigh_cm}, ${record.thigh_upper_cm || null},
      ${record.thigh_mid_cm || null}, ${record.calf_cm}, ${record.forearm_cm || null}, ${record.humerus_cm}, ${record.femur_cm},
      ${record.fat_percentage || null}, ${record.muscle_mass_kg || null}, ${record.bmi || null}, ${record.bmi_percentile || null}, 
      ${somatotypeJson}
    )
    RETURNING *
  `;
  return result[0] as AnthropometricRecord;
}

export async function updateAnthropometryRecord(id: string, record: Partial<AnthropometricRecord>) {
  const somatotypeJson = record.somatotype ? JSON.stringify(record.somatotype) : undefined;

  const result = await sql`
    UPDATE anthropometric_records 
    SET 
      weight_kg = COALESCE(${record.weight_kg}, weight_kg),
      fat_percentage = COALESCE(${record.fat_percentage}, fat_percentage),
      muscle_mass_kg = COALESCE(${record.muscle_mass_kg}, muscle_mass_kg),
      somatotype = COALESCE(${somatotypeJson}, somatotype),
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as AnthropometricRecord;
}

export async function deleteAnthropometryRecord(id: string) {
  await sql`
    DELETE FROM anthropometric_records WHERE id = ${id}
  `;
  return true;
}
