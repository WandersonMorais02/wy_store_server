import crypto from "crypto";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  /**
   * Upload em memória (SEM RAW NO DISCO)
   */
  upload(folder) {
    return {
      storage: multer.memoryStorage(),

      fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Arquivo enviado não é uma imagem"));
        }
        cb(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB (ajuste se quiser)
      },
    };
  },

  /**
   * 🔥 PROCESSA E SALVA UMA ÚNICA IMAGEM FINAL
   */
  async processImage(req, res, next) {
    console.log("📸 processImage executado", new Date().toISOString());
    if (!req.file) return next();

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const destination = path.resolve(
      __dirname,
      "..",
      "static",
      req.uploadFolder,
      `${year}`,
      month,
      day
    );

    // garante diretório
    fs.mkdirSync(destination, { recursive: true });

    const hash = crypto.randomBytes(6).toString("hex");
    const filename = `${year}-${month}-${day}-${hash}.webp`;
    const finalPath = path.join(destination, filename);

    try {
      let image = sharp(req.file.buffer).rotate();

      if (req.uploadFolder === "perfil_photo") {
        image = image.resize(354, 472);
      } else {
        image = image.resize({ width: 1080 });
      }

      await image.webp({ quality: 80 }).toFile(finalPath);

      // 🔥 simula comportamento do multer
      req.file.filename = filename;
      req.file.path = finalPath;

      next();
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      next(error);
    }
  },
};
