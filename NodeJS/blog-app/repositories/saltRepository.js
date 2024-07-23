const { Salt } = require("../models");
const { APIError, STATUS_CODES } = require("../utils/appError");

class SaltRepository {
  constructor() {
    this.Model = Salt;
  }

  async CreateSalt({ userId, salt }) {
    try {
      const newSalt = await this.Model.create({
        userID: userId,
        salt,
      });
      return newSalt;
    } catch (err) {
      throw new APIError(
        "Unable to Create Password Salt",
        STATUS_CODES.INTERNAL_ERROR
      );
    }
  }

  async FindSaltByUserId(userId) {
    try {
      const salt = await this.Model.findOne({
        where: { userID: userId },
      });
      return salt;
    } catch (err) {
      throw new APIError(
        "Unable to Find Password Salt",
        STATUS_CODES.INTERNAL_ERROR
      );
    }
  }

}

module.exports = SaltRepository;