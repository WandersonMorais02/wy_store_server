import FavoriteService from "../../services/favorite/favorite.service.js";

export default new class FavoriteController {
    async show(req, res) {
        try {
            const favorites = await FavoriteService.getByUser(req.user.id);
            return res.json(favorites);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async check(req, res) {
        try {
            const { productId } = req.params;

            const favorited = await FavoriteService.isFavorited(
                req.user.id,
                productId
            );

            return res.json({ favorited });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    async toggle(req, res) {
        try {
            const { productId } = req.params;
            const favorites = await FavoriteService.toggle(
                req.user.id,
                productId
            );
            return res.json(favorites);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async remove(req, res) {
        try {
            const { productId } = req.params;
            const favorites = await FavoriteService.remove(
                req.user.id,
                productId
            );
            return res.json(favorites);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};
