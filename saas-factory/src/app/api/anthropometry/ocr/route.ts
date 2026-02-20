import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const runtime = "edge";

const anthroExtractionSchema = z.object({
    athlete_name: z.string().optional(),
    birth_date: z.string().optional(),
    id_number: z.string().optional(),
    modality: z.string().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    weight_kg: z.number().optional(),
    height_cm: z.number().optional(),
    wingspan_cm: z.number().optional(),
    triceps_mm: z.number().optional(),
    subscapular_mm: z.number().optional(),
    biceps_mm: z.number().optional(),
    bicipital_mm: z.number().optional(),
    iliac_crest_mm: z.number().optional(),
    supraspinale_mm: z.number().optional(),
    abdominal_mm: z.number().optional(),
    front_thigh_mm: z.number().optional(),
    medial_calf_mm: z.number().optional(),
    peroneal_mm: z.number().optional(),
    arm_relaxed_cm: z.number().optional(),
    arm_flexed_cm: z.number().optional(),
    waist_cm: z.number().optional(),
    abdomen_cm: z.number().optional(),
    hip_cm: z.number().optional(),
    thigh_cm: z.number().optional(),
    thigh_upper_cm: z.number().optional(),
    thigh_mid_cm: z.number().optional(),
    calf_cm: z.number().optional(),
    forearm_cm: z.number().optional(),
    humerus_cm: z.number().optional(),
    femur_cm: z.number().optional(),
});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new Response("No file provided", { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const base64Image = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        const { object } = await generateObject({
            model: google("gemini-2.0-flash-001"),
            schema: anthroExtractionSchema,
            output: "object",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Extract anthropometric measurements and athlete metadata from this ISAK field sheet image. \n" +
                                "Look for 'Nombre', 'Atleta', 'Deportista' for athlete_name. \n" +
                                "Look for 'Cédula', 'ID', 'Identificación', 'DNI' for id_number. \n" +
                                "Look for 'Modalidad', 'Deporte', 'Especialidad' for modality. \n" +
                                "Look for 'Fecha de Nacimiento' or 'Nacimiento' for birth_date (format YYYY-MM-DD if possible). \n" +
                                "Extract all measurements found. Return only the values. If missing, omit. cm for diameters/girths, mm for skinfolds, kg for weight.",
                        },
                        {
                            type: "image",
                            image: `data:${file.type || "image/jpeg"};base64,${base64Image}`,
                        },
                    ],
                },
            ],
        });

        return Response.json(object);
    } catch (error) {
        console.error("OCR Error:", error);
        return new Response("Error processing image", { status: 500 });
    }
}
