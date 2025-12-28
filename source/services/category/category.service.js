import Category from "../../models/Category/category.js";

export default new class CategoryService {
    async findAll(skip = 0, limit = 10) {
    return Category.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    async count() {
    return Category.countDocuments();
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