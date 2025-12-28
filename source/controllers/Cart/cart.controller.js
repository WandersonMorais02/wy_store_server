import CartService from "../../services/cart/cart.service.js";

export default new class CartController {
    async show(req, res) {
        try {
            const cart = await CartService.getByUser(req.user.id);
            return res.json(cart);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async add(req, res) {
        try {
            const { product, quantity, variation } = req.body;

            if (!product) {
                return res.status(400).json({ message: "Produto obrigatório" });
            }

            const cart = await CartService.addItem(req.user.id, {
                product,
                quantity,
                variation,
            });

            return res.status(201).json(cart);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;

            const cart = await CartService.updateItem(
                req.user.id,
                itemId,
                quantity
            );

            if (!cart) {
                return res.status(404).json({ message: "Item não encontrado" });
            }

            return res.json(cart);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async remove(req, res) {
        try {
            const { itemId } = req.params;
            const cart = await CartService.removeItem(req.user.id, itemId);

            if (!cart) {
                return res.status(404).json({ message: "Item não encontrado" });
            }

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async clear(req, res) {
        try {
            const cart = await CartService.clear(req.user.id);
            return res.json(cart);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};
