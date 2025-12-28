import Favorite from "../../models/favorite/favorite.js";

export default new class FavoriteService {
    async getByUser(userId) {
        return Favorite.findOne({ user: userId }).populate("products");
    }

    async isFavorited(userId, productId) {
        const favorite = await Favorite.findOne({ user: userId });

        if (!favorite) return false;

        return favorite.products.includes(productId);
    }

    async toggle(userId, productId) {
        let favorite = await Favorite.findOne({ user: userId });

        if (!favorite) {
            favorite = await Favorite.create({
                user: userId,
                products: [productId],
            });
            return favorite;
        }

        const exists = favorite.products.includes(productId);

        if (exists) {
            favorite.products.pull(productId);
        } else {
            favorite.products.push(productId);
        }

        return favorite.save();
    }

    async remove(userId, productId) {
        return Favorite.findOneAndUpdate(
            { user: userId },
            { $pull: { products: productId } },
            { new: true }
        );
    }
};
