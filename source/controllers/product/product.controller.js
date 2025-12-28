import ProductService from "../../services/product/product.service.js";

export default new class ProductController {

  async index(req, res) {
    try {
      const { search = "", page = 1, limit = 10 } = req.query;

      const result = await ProductService.findAll({
        search,
        page,
        limit,
      });

      return res.json({
        data: result.products,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /products
   */
  async store(req, res) {
    try {
      const product = await ProductService.create({
        ...req.body,
        file: req.file,
        folder: "banner",
      });

      return res.status(201).json(product);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * PUT /products/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const product = await ProductService.update(id, {
        ...req.body,
        file: req.file,
        folder: "banner",
      });

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      return res.json(product);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.delete(id);

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const products = await ProductService.findByCategory(categoryId);
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      const product = await ProductService.updateStock(id, stock);

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      return res.json(product);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
};
