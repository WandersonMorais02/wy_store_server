import Variation from "../../models/variation/vatiation.js";
import Product from "../../models/product/product.js";

export default new class VariationService {

  // Buscar variações por produto
  async findByProduct(productId) {
    return Variation.find({ product: productId });
  }

  // Criar variação
  async create(data) {
    const payload = { ...data };

    // Salva apenas 1 imagem
    if (data.file?.filename) {
      payload.image = this.buildImagePath({ file: data.file, folder: data.folder });
    }

    delete payload.file;
    delete payload.folder;

    const variation = await Variation.create(payload);

    // Marca produto como tendo variações
    await Product.findByIdAndUpdate(
      variation.product,
      { hasVariation: true },
      { new: false }
    );

    return variation;
  }

  // Atualizar variação
  async update(id, data) {
    const payload = { ...data };

    // Substitui imagem caso haja nova
    if (data.file?.filename) {
      payload.image = this.buildImagePath({ file: data.file, folder: data.folder });
    }

    delete payload.file;
    delete payload.folder;

    return Variation.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  }

  // Deletar variação
  async delete(id) {
    const variation = await Variation.findByIdAndDelete(id);
    if (!variation) return null;

    // Se não restarem variações, atualiza produto
    const count = await Variation.countDocuments({ product: variation.product });
    if (count === 0) {
      await Product.findByIdAndUpdate(
        variation.product,
        { hasVariation: false },
        { new: false }
      );
    }

    return variation;
  }

  // Construir caminho da imagem
  buildImagePath({ file, folder }) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${folder}/${year}/${month}/${day}/${file.filename}`;
  }

};
