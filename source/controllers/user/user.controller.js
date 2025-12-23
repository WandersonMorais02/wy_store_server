import UserService from "../../services/user/user.service.js";

class UserController {
  async index(req, res) {
    try {
      const result = await UserService.list(req.user, req.query);
      return res.json(result);
    } catch (e) {
      return res.status(500).json({ message: "Failed to list users" });
    }
  }

  async create(req, res) {
    try {
      const user = await UserService.create(req.body);
      return res.status(201).json(user);
    } catch (e) {
      if (e.message === "USER_EXISTS")
        return res.status(409).json({ message: "User already exists" });

      if (e.message === "MISSING_FIELDS")
        return res.status(400).json({ message: "Name, email and password are required" });

      return res.status(500).json({ message: "Failed to create user" });
    }
  }

  async show(req, res) {
    try {
      const user = await UserService.getById(req.user, req.params.id);
      return res.json(user);
    } catch (e) {
      return this.handleError(res, e);
    }
  }

  async me(req, res) {
    try {
      const user = await UserService.me(req.user.id);
      return res.json(user);
    } catch {
      return res.status(404).json({ message: "User not found" });
    }
  }

  async auth(req, res) {
    try {
      const result = await UserService.auth(req.body);
      return res.json(result);
    } catch {
      return res.status(401).json({ message: "Email or password invalid" });
    }
  }

  async update(req, res) {
    try {
      const user = await UserService.update(req.user, req.params.id, req.body);
      return res.json(user);
    } catch (e) {
      return this.handleError(res, e);
    }
  }

  async updatePassword(req, res) {
    try {
      await UserService.updatePassword(req.user, req.params.id, req.body.password);
      return res.json({ message: "Password updated successfully" });
    } catch (e) {
      return this.handleError(res, e);
    }
  }

  async delete(req, res) {
    try {
      await UserService.delete(req.user, req.params.id);
      return res.status(204).send();
    } catch (e) {
      return this.handleError(res, e);
    }
  }

  handleError(res, e) {
    const map = {
      INVALID_ID: [400, "Invalid user id"],
      NOT_FOUND: [404, "User not found"],
      ACCESS_DENIED: [403, "Access denied"],
      ADMIN_ONLY: [403, "Only ADMIN can change role or status"],
      SELF_DELETE: [403, "You cannot delete your own account"],
      INVALID_PASSWORD: [400, "Password must be at least 6 characters"],
    };

    const [status, message] = map[e.message] || [500, "Internal server error"];
    return res.status(status).json({ message });
  }
}

export default new UserController();
