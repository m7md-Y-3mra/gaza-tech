import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from "@/constants/image-file";
import { z } from "zod";

export const imageFileSchema = z
    .file()
    .min(10_000, "File size must be at least 10KB")
    .max(MAX_UPLOAD_SIZE, `File size must be less than 2MB`)
    .mime(ACCEPTED_FILE_TYPES, "Invalid file type. Only JPG, JPEG, PNG, WEBP and GIF are allowed.");