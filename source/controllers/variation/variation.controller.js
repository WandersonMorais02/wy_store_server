import VariationService from "../../services/variation/variation.service.js";

export default new class VariationController {

  async indexByProduct(req, res) {
    try {
      const { productId } = req.params;
      const variations = await VariationService.findByProduct(productId);
      return res.json(variations);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const variation = await VariationService.findById(id);

      if (!variation) {
        return res.status(404).json({ message: "Variação não encontrada" });
      }

      return res.json(variation);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async store(req, res) {
    try {
      const variation = await VariationService.create({
        ...req.body,
        product: req.body.product,
        file: req.file,
        folder: "variations",
      });

      return res.status(201).json(variation);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      const variation = await VariationService.update(id, {
        ...req.body,
        file: req.file,
        folder: "variations",
      });

      if (!variation) {
        return res.status(404).json({ message: "Variação não encontrada" });
      }

      return res.json(variation);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const variation = await VariationService.delete(id);

      if (!variation) {
        return res.status(404).json({ message: "Variação não encontrada" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
