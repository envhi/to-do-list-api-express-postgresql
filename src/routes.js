import { Router } from "express";
import users from "./app/controllers/UsersController";
import todos from "./app/controllers/ToDosController";

const routes = new Router();

// users
routes.post("/users", users.create);
routes.get("/users", users.read);
routes.put("/users/:id", users.update);
routes.delete("/users/:id", users.delete);

// to dos
routes.post("/users/:userId/todos", todos.create);
routes.get("/users/:userId/todos", todos.read);
routes.put("/users/:userId/todos/:id", todos.update);
routes.delete("/users/:userId/todos/:id", todos.delete);

export default routes;
