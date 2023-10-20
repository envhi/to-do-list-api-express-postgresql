import * as Yup from "yup";
import { parseISO } from "date-fns";
import { Op } from "sequelize";
import User from "../models/User";
import ToDo from "../models/ToDo";

class UsersController {
  async read(req, res) {
    const {
      name,
      email,
      createdBefore,
      createdAfter,
      updatedBefore,
      updatedAfter,
      sort,
    } = req.query;

    const page = req.query.page || 1;
    const limit = req.query.limit || 25;
    let order = [];

    let where = {};

    if (name) {
      where = {
        ...where,
        name: {
          [Op.iLike]: name,
        },
      };
    }
    if (email) {
      where = {
        ...where,
        email: {
          [Op.iLike]: email,
        },
      };
    }
    if (createdBefore) {
      where = {
        ...where,
        createdBefore: {
          [Op.gte]: parseISO(createdBefore),
        },
      };
    }
    if (createdAfter) {
      where = {
        ...where,
        createdAfter: {
          [Op.lte]: parseISO(createdAfter),
        },
      };
    }

    if (updatedBefore) {
      where = {
        ...where,
        updatedAt: {
          [Op.gte]: parseISO(updatedBefore),
        },
      };
    }
    if (updatedAfter) {
      where = {
        ...where,
        updatedAt: {
          [Op.lte]: parseISO(updatedAfter),
        },
      };
    }

    if (sort) {
      order = sort.split(",").map((item) => item.split(":"));
    }

    const data = await User.findAll({
      attributes: { exclude: ["password", "password_hash"] },
      where,
      include: [
        {
          model: ToDo,
          attributes: ["id"],
        },
      ],
      order,
      limit,
      offset: limit * page - limit,
    });

    return res.json(data);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(8),
      passwordConfirmation: Yup.string().when(
        "password",
        (password, field) =>
          password ? field.required().oneOf([Yup.ref("password")]) : field // field = passwordConfirmation
      ),
    });

    if (!(await schema.isValid(req.body))) {
      console.log(req.body);
      return res.status(400).json({ error: "error on schema" });
    }

    try {
      const { id, name, email, createdAt, updatedAt } = await User.create(
        req.body
      );
      return res.status(201).json({ id, name, email, createdAt, updatedAt });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(8),
      password: Yup.string()
        .min(8)
        .when(
          "oldPasword",
          (oldPassword, field) => (oldPassword ? field.required() : field) // field = oldPassword
        ),
      passwordConfirmation: Yup.string().when(
        "password",
        (password, field) =>
          password ? field.required().oneOf([Yup.ref("password")]) : field // field = passwordConfirmation
      ),
    });

    if (!(await schema.isValid(req.body))) {
      console.log(req.body);
      return res.status(400).json({ error: "error on schema" });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json();
    }

    const { oldPassword } = req.body;

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: "User password does not match" });
    }

    const { id, name, email, createdAt, updatedAt } = await user.update(
      req.body
    );

    return res.status(201).json({ id, name, email, createdAt, updatedAt });
  }

  async delete(req, res) {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      res.status(404).json();
    }

    await user.destroy();

    return res.json();
  }
}

export default new UsersController();
