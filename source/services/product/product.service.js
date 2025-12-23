import fs from "fs";
import path from "path";
import Product from "../../models/product/product.js"
import Variation from "../../models/variation/vatiation.js";

export default new class ProductService {

  async findAll() {
    return Product.find().populate("category");
  }

  async findById(id) {
    return Product.findById(id).populate("category");
  }

  async create(data) {
    // 🔒 Evita produto duplicado por nome + categoria
    const exists = await Product.findOne({
      name: data.name,
      category: data.category,
    });

    if (exists) {
      throw new Error("Produto já existe nessa categoria");
    }

    const payload = { ...data };

    if (data.file) {
      payload.banner = this.buildImagePath(data);
    }

    delete payload.file;
    delete payload.folder;

    return Product.create(payload);
  }

  async update(id, data) {
    const payload = { ...data };

    if (data.file) {
      payload.banner = this.buildImagePath(data);
    }

    delete payload.file;
    delete payload.folder;

    return Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    const product = await Product.findById(id);
    if (!product) return null;

    // 🧹 Deleta imagem do produto
    if (product.banner) {
      this.deleteFile(product.banner);
    }

    // 🧹 Deleta variações + imagens
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
