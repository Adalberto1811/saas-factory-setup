export interface Somatotype {
    endo: number;
    meso: number;
    ecto: number;
}

export interface BodyComposition {
    fat_percentage_slaughter: number;
    fat_percentage_boileau: number;
    muscle_mass_kg: number;
    residual_mass_kg: number;
    bone_mass_kg: number;
}

export function calculateSomatotype(data: {
    height_cm: number;
    weight_kg: number;
    triceps_mm: number;
    subscapular_mm: number;
    supraspinale_mm: number;
    humerus_cm: number;
    femur_cm: number;
    arm_flexed_cm: number;
    calf_cm: number;
    triceps_skinfold_mm: number;
    calf_skinfold_mm: number;
}): Somatotype {
    const { height_cm, weight_kg, triceps_mm, subscapular_mm, supraspinale_mm, humerus_cm, femur_cm, arm_flexed_cm, calf_cm } = data;

    // 1. ENDOMORPHY (Corrected for height)
    const sum3 = (triceps_mm + subscapular_mm + supraspinale_mm) * (170.18 / height_cm);
    const endo = -0.7182 + 0.1451 * sum3 - 0.00068 * Math.pow(sum3, 2) + 0.0000014 * Math.pow(sum3, 3);

    // 2. MESOMORPHY (Corrected for skinfolds)
    const armCorrected = arm_flexed_cm - (data.triceps_skinfold_mm / 10);
    const calfCorrected = calf_cm - (data.calf_skinfold_mm / 10);
    const meso = (0.858 * humerus_cm) + (0.601 * femur_cm) + (0.188 * armCorrected) + (0.161 * calfCorrected) - (0.131 * height_cm) + 4.5;

    // 3. ECTOMORPHY
    const hwr = height_cm / Math.pow(weight_kg, 1 / 3);
    let ecto = 0;
    if (hwr >= 40.75) {
        ecto = hwr * 0.732 - 28.58;
    } else if (hwr > 38.25 && hwr < 40.75) {
        ecto = hwr * 0.463 - 17.63;
    } else {
        ecto = 0.1;
    }

    return {
        endo: Number(endo.toFixed(2)),
        meso: Number(meso.toFixed(2)),
        ecto: Number(ecto.toFixed(2)),
    };
}

export function calculateBMI(weight: number, heightCm: number) {
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);

    // Heuristic for BMI Percentile (simplified for 5-19 years)
    let percentile = "NORMAL";
    if (bmi < 14) percentile = "BAJO PESO";
    if (bmi > 22 && bmi < 26) percentile = "SOBREPESO";
    if (bmi >= 26) percentile = "OBESIDAD";
    if (bmi >= 14 && bmi <= 22) percentile = "BUENO";

    return {
        value: Number(bmi.toFixed(1)),
        percentile
    };
}

export function calculateSlaughterLohman(triceps: number, subscapular: number, gender: 'male' | 'female'): number {
    const sum = triceps + subscapular;
    if (gender === 'male') {
        if (sum < 35) return (1.21 * sum) - (0.008 * Math.pow(sum, 2)) - 1.7;
        return (0.783 * sum) + 1.6;
    } else {
        if (sum < 35) return (1.33 * sum) - (0.013 * Math.pow(sum, 2)) - 2.5;
        return (0.546 * sum) + 9.7;
    }
}

export function calculateBoileau(triceps: number, subscapular: number): number {
    return (1.35 * (triceps + subscapular)) - (0.012 * Math.pow(triceps + subscapular, 2)) - 4.4;
}

export function calculatePonderalIndex(heightCm: number, weightKg: number): number {
    return heightCm / Math.pow(weightKg, 1 / 3);
}

export function calculateLorenzIdealWeight(heightCm: number, gender: 'male' | 'female'): number {
    if (gender === 'male') {
        return heightCm - 100 - (heightCm - 150) / 4;
    }
    return heightCm - 100 - (heightCm - 150) / 2;
}

export interface NutritionRecommendation {
    protein_gr: number;
    carbs_gr: number;
    carbs_min_gr?: number;
    carbs_max_gr?: number;
    context: string;
}

export function calculateNutrition(weightKg: number, modality: string, bmi: number): NutritionRecommendation {
    const isEndurance = /natación|triatlón|aguas abiertas|endurance/i.test(modality);
    const isLowWeight = bmi < 18.5;

    const protein = weightKg * 1.5;
    let carbs = weightKg * 1.2;
    let context = "Recomendación estándar para deportistas.";

    if (isEndurance && isLowWeight) {
        return {
            protein_gr: Number(protein.toFixed(1)),
            carbs_gr: Number((weightKg * 1.75).toFixed(1)),
            carbs_min_gr: Number((weightKg * 1.5).toFixed(1)),
            carbs_max_gr: Number((weightKg * 2.0).toFixed(1)),
            context: "Protocolo de alta carga para resistencia con bajo peso."
        };
    }

    if (isEndurance) {
        carbs = weightKg * 1.5;
        context = "Protocolo de carga moderada para deportes de fondo.";
    }

    return {
        protein_gr: Number(protein.toFixed(1)),
        carbs_gr: Number(carbs.toFixed(1)),
        context
    };
}

export function calculateCorrectedWeight(weight: number, fatPercentage: number): number {
    // Ideal weight calculation based on 15% body fat reference for athletes
    const fatFreeMass = weight * (1 - (fatPercentage / 100));
    return fatFreeMass / (1 - 0.15);
}

export function calculateDetailedComposition(weight: number, fatPercentage: number, heightCm: number, gender: 'male' | 'female') {
    const kgGrasa = weight * (fatPercentage / 100);
    const kgMasaMagra = weight - kgGrasa;
    const pesoIdeal = calculateLorenzIdealWeight(heightCm, gender);
    const pesoCorregido = calculateCorrectedWeight(weight, fatPercentage);

    return {
        kgGrasa: Number(kgGrasa.toFixed(2)),
        kgMasaMagra: Number(kgMasaMagra.toFixed(2)),
        pesoIdeal: Number(pesoIdeal.toFixed(2)),
        pesoCorregido: Number(pesoCorregido.toFixed(2)),
        diferenciaPesoKg: Number((weight - pesoCorregido).toFixed(2)),
        diferenciaGrasaKg: Number((kgGrasa - (pesoCorregido * 0.15)).toFixed(2)), // assuming 15% target
        diferenciaMasaMagraKg: Number((pesoCorregido * 0.85 - kgMasaMagra).toFixed(2))
    };
}
