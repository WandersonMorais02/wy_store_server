import Category from "../../models/Category/category.js";

export default new class CategoryService {
    async findAll() {
        return Category.find();
    }
    async findById(id) {
        return Category.findById(id);
    }
    async create(data) {
        return Category.create(data);
    }
    async update(id, data) {
        return Category.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    async delete(id) {
        return Category.findByIdAndDelete(id);
    }
    async findByName(name) {
        return Category.findOne({ name });
    }
}