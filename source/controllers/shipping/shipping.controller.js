import { calculateShipping } from "../../services/shipping/shipping.service.js";
import Product from "../../models/product/product.js";

export async function calculate(req, res) {
  const { cepDestino, productId } = req.body;

  if (!cepDestino) {
    return res.status(400).json({ error: "CEP de destino obrigatório" });
  }

  if (!productId) {
    return res.status(400).json({ error: "ID do produto obrigatório" });
  }

  try {
    // 🔎 Busca produto
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // 📦 Dados logísticos do produto
    const logistics = {
      weight: product.weight,
      height: product.height,
      width: product.width,
      length: product.length,
    };

    // 🚚 Cálculo do frete
    const result = await calculateShipping(cepDestino, logistics);

    return res.json(result);
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    return res.status(400).json({ error: error.message });
  }
}
