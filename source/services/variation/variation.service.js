import Variation from "../../models/variation/vatiation.js";
import Product from "../../models/product/product.js";

export default new class VariationService {

  async findByProduct(productId) {
    return Variation.find({
      product: productId,
      active: true,
    });
  }

  async findById(id) {
    return Variation.findById(id).populate("product");
  }

  async create(data) {
    const payload = { ...data };

    if (data.file) {
      payload.image = this.buildImagePath(data);
    }

    delete payload.file;
    delete payload.folder;

    const variation = await Variation.create(payload);

    // 🔥 ATUALIZA O PRODUTO
    await Product.findByIdAndUpdate(
      variation.product,
      { hasVariation: true },
      { new: false }
    );

    return variation;
  }

  async update(id, data) {
    const payload = { ...data };

    if (data.file) {
      payload.image = this.buildImagePath(data);
    }

    delete payload.file;
    delete payload.folder;

    return Variation.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    const variation = await Variation.findByIdAndDelete(id);

    if (!variation) return null;

    // 🔍 Verifica se ainda existem variações desse produto
    const count = await Variation.countDocuments({
      product: variation.product,
    });

    if (count === 0) {
      await Product.findByIdAndUpdate(
        variation.product,
        { hasVariation: false },
        { new: false }
      );
    }

    return variation;
  }

  buildImagePath({ file, folder }) {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${folder}/${year}/${month}/${day}/${file.filename}`;
  }
};
