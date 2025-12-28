import Cart from "../../models/cart/cart.js";

export default new class CartService {
  async getByUser(userId) {
    return Cart.findOne({ user: userId })
      .populate("items.product")
      .populate("items.variation");
  }

  async create(userId) {
    return Cart.create({ user: userId, items: [] });
  }

  /* =====================
   * ➕ ADD ITEM
   * ===================== */
  async addItem(userId, item) {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await this.create(userId);
    }

    const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;

    const itemIndex = cart.items.findIndex(
      (i) =>
        i.product.toString() === item.product &&
        i.variation?.toString() === item.variation
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: item.product,
        variation: item.variation,
        quantity,
      });
    }

    await cart.save();

    return Cart.findById(cart._id)
      .populate("items.product")
      .populate("items.variation");
  }

  /* =====================
   * ✏️ UPDATE ITEM
   * ===================== */
  async updateItem(userId, itemId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    const item = cart.items.id(itemId);
    if (!item) return null;

    item.quantity = Number(quantity) > 0 ? Number(quantity) : 1;

    await cart.save();

    return Cart.findById(cart._id)
      .populate("items.product")
      .populate("items.variation");
  }

  /* =====================
   * ❌ REMOVE ITEM
   * ===================== */
  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    const item = cart.items.id(itemId);
    if (!item) return null;

    item.deleteOne();
    await cart.save();

    return Cart.findById(cart._id)
      .populate("items.product")
      .populate("items.variation");
  }

  /* =====================
   * 🧹 CLEAR CART
   * ===================== */
  async clear(userId) {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] },
      { new: true }
    );

    if (!cart) return null;

    return Cart.findById(cart._id)
      .populate("items.product")
      .populate("items.variation");
  }
};
