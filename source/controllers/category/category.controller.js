import CategoryService from "../../services/category/category.service.js";

export default new class CategoryController {
    /**
     * GET /categories
     * @param { Request } req 
     * @param { Response } res 
     * @returns { Promise<any> }
     */
    async index(req, res) {
        try {
            const categories = await CategoryService.findAll();
            return res.json(categories);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /categories/:id
     * @param { Request } req 
     * @param { Response } res 
     * @returns { Promise<any> }
     */
    async show(req, res) {
        try {
            const { id } = req.params;
            const category = await CategoryService.findById(id);
            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }
            return res.json(category);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /categories
     * @param { Request } req 
     * @param { Response } res 
     * @returns { Promise<any> }
     */
    async store(req, res) {
        try {
            const { name } = req.body;
            const categoryExists = await CategoryService.findByName(name);
            if (categoryExists) {
                return res.status(400).json({ message: 'Categoria já existe' });
            }
            const category = await CategoryService.create(req.body);
            return res.status(201).json(category);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * PUT /categories/:id
     * @param { Request } req 
     * @param { Response } res 
     * @returns { Promise<any> }
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const category = await CategoryService.update(id, req.body);
            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }
            return res.json(category);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * GET /categories/:id
     * @param { Request } req 
     * @param { Response } res 
     * @returns { Promise<any> }
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const category = await CategoryService.delete(id);
            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /categories/:name
     * @param { Request } req 
     * @param { Response } res 
     * @returns 
     */
    async findByName(req, res)
    {
        try {
            const { name } = req.params;

            const category = await CategoryService.findByName( name );
            if (!category) {
                return res.status(404).json({ message: 'Categoria não encontrada' });
            }

            return res.status(200).json(category);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}