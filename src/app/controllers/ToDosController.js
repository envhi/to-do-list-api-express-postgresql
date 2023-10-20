import * as Yup from "yup";
import { parseISO } from "date-fns";
import { Op } from "sequelize";
import ToDo from "../models/ToDo";

class ToDosController {
  async read(req, res) {
    const {
      title,
      description,
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

    if (title) {
      where = {
        ...where,
        title: {
          [Op.iLike]: title,
        },
      };
    }
    if (description) {
      where = {
        ...where,
        description: {
          [Op.iLike]: description,
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

    try {
      const data = await ToDo.findAll({
        where,
        order,
        limit,
        offset: limit * page - limit,
      });

      return res.json(data);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string(),
      status: Yup.string().uppercase(),
    });

    if (!(await schema.isValid(req.body))) {
      console.log(req.body);
      return res.status(400).json({ error: "error on schema" });
    }

    try {
      const toDo = await ToDo.create({
        user_id: req.params.userId,
        ...req.body,
      });

      return res.status(201).json(toDo);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      status: Yup.string().uppercase(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "caiu no yup" });
    }

    const toDo = await ToDo.findOne({
      where: {
        user_id: req.params.userId,
        id: req.params.id,
      },
    });

    if (!toDo) {
      res.status(400).json();
    }

    try {
      await toDo.update(req.body);

      return res.json(toDo);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async delete(req, res) {
    try {
      const toDo = await ToDo.findOne({
        where: {
          user_id: req.params.userId,
          id: req.params.id,
        },
      });

      if (!toDo) {
        return res.status(400).json();
      }

      await toDo.destroy();

      return res.json();
    } catch (error) {
      return res.json(error);
    }
  }
}

export default new ToDosController();
