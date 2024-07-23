const UserRepository = require("../repositories/userRepository");
const {
  APIError,
  STATUS_CODES,
} = require("../utils/appError");

class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  async FindUser({userId}) {
    try {
      const user = await this.repository.FindUserById(userId);
      if (!user) {
        throw new APIError("User Not Found", STATUS_CODES.NOT_FOUND);
      }
      return user;
    } catch (err) {
      throw new APIError(`USERS API ERROR : ${err.message}`, err.statusCode);
    }
  }

  async UpdateUser(user) {
    try {
      const { name, userId } = user;
      const updatedUser = await this.repository.UpdateUser({ name }, userId);
      return updatedUser;
    } catch (err) {
      throw new APIError(`USERS API ERROR : ${err.message}`, err.statusCode);
    }
  }
}

module.exports = UserService;