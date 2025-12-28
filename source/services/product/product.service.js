import fs from "fs";
import path from "path";
import Product from "../../models/product/product.js";
import Variation from "../../models/variation/vatiation.js";

export default new class ProductService {

  async findAll({ search = "", page = 1, limit = 10 }) {
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),

      Product.countDocuments(query)
    ]);

    return {
      products,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findById(id) {
    return Product.findById(id).populate("category");
  }

  async create(data) {
    const exists = await Product.findOne({
      name: data.name,
      category: data.category,
    });

    if (exists) {
      throw new Error("Produto já existe nessa categoria");
    }

    const payload = this.normalizePayload(data);

    return Product.create(payload);
  }

  async update(id, data) {
    const payload = this.normalizePayload(data);

    return Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    const product = await Product.findById(id);
    if (!product) return null;

    if (product.banner) {
      this.deleteFile(product.banner);
    }

    const variations = await Variation.find({ product: id });

    for (const variation of variations) {
      for (const img of variation.images) {
        this.deleteFile(img);
      }
    }

    await Variation.deleteMany({ product: id });
    await product.deleteOne();

    return true;
  }

  async updateStock(id, stock) {
    return Product.findByIdAndUpdate(id, { stock }, { new: true });
  }

  /**
   * 🔥 Normaliza payload e valida shipping
   */
  normalizePayload(data) {
    const payload = { ...data };

    if (data.file) {
      payload.banner = this.buildImagePath(data);
    }

    // 🔎 Validação mínima de frete
    if (payload.shipping?.enabled) {
      const { weightKg, dimensionsCm } = payload.shipping;

      if (!weightKg || weightKg <= 0) {
        throw new Error("Peso do produto é obrigatório para envio");
      }

      if (
        !dimensionsCm?.height ||
        !dimensionsCm?.width ||
        !dimensionsCm?.length
      ) {
        throw new Error("Dimensões do produto são obrigatórias");
      }
    }

    delete payload.file;
    delete payload.folder;

    return payload;
  }

  buildImagePath({ file, folder }) {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${folder}/${year}/${month}/${day}/${file.filename}`;
  }

  deleteFile(relativePath) {
    const fullPath = path.resolve("source/static", relativePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};
