const { APIError, STATUS_CODES } = require("../utils/appError");
const { Post, User, Category, Sequelize } = require("../models");
const { Op, literal } = Sequelize;

class PostService {
  constructor() {
    this.PostModel = Post;
    this.UserModel = User;
    this.CategoryModel = Category;
  }

  async GetAllPosts(postParams) {
    try {
      const { page, perPage, sortBy, orderBy, searchBy, userId } = postParams;

      const offset = (page - 1) * perPage;
      const limit = perPage;
      const postFilter = {};

      if (userId) {
        postFilter.userId = userId;
      }

      if (searchBy) {
        postFilter[Op.or] = [
          { title: { [Op.like]: `%${searchBy}%` } },
          { "$category.name$": { [Op.like]: `%${searchBy}%` } },
        ];
      }

      const includeModels = [
        {
          model: this.UserModel,
          as: "creator",
          attributes: [
            "id",
            [literal('CONCAT("firstName", \' \', "lastName")'), "name"],
            "profileThumbnail",
          ],
        },
        {
          model: this.CategoryModel,
          as: "category",
          attributes: ["id", "name"],
        },
      ];

      const {
        count: totalCount,
        rows: data,
      } = await this.PostModel.findAndCountAll({
        where: postFilter,
        offset: offset,
        limit: limit,
        order: [[sortBy, orderBy]],
        attributes: {
          exclude: ["coverImage", "userId", "categoryId"],
        },
        include: includeModels,
      });

      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.ceil(offset / limit) + 1;

      return {
        data,
        metaData: {
          totalCount,
          totalPages: totalPages,
          currentPage: currentPage,
        },
      };
    } catch (err) {
      throw new APIError(`POSTS API ERROR : ${err.message}`, err.statusCode);
    }
  }

  async GetAPost(postId) {
    try {
      const includeModels = [
        {
          model: User,
          as: "creator",
          attributes: [
            "id",
            [literal('CONCAT("firstName", \' \', "lastName")'), "name"],
            "profileThumbnail",
          ],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ];
      const post = await this.PostModel.findOne({
        where: { id: postId },
        attributes: {
          exclude: ["coverThumbnail", "userId", "categoryId"],
        },
        include: includeModels,
      });

      return post;
    } catch (err) {
      throw new APIError(`POSTS API ERROR : ${err.message}`, err.statusCode);
    }
  }

  async CreateAPost(newPost) {
    try {
      const post = await this.PostModel.create(newPost);
      return post;
    } catch (err) {
      throw new APIError(`POSTS API ERROR : ${err.message}`, err.statusCode);
    }
  }

  async UpdateAPost(updateFields, postId) {
    try {
      const post = await this.PostModel.findByPk(postId);
      if (!post) {
        throw new APIError("Post Not Found.", STATUS_CODES.NOT_FOUND);
      }
      const updatedPost = await post.update(updateFields);
      return updatedPost;
    } catch (err) {
      throw new APIError(`POSTS API ERROR : ${err.message}`, err.statusCode);
    }
  }

  async DeleteAPost(postId) {
    try {
      const post = await this.PostModel.findByPk(postId);
      if (!post) {
        throw new APIError("Post Not Found.", STATUS_CODES.NOT_FOUND);
      }
      await post.destroy();
    } catch (err) {
      throw new APIError(`POSTS API ERROR : ${err.message}`, err.statusCode);
    }
  }
}

module.exports = PostService;