const express = require("express");
const exphbs = require("express-handlebars");
const mysql = require("mysql");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    helpers: {
      eq: (a, b) => a === b,
      priorityClass: (priority) => {
        switch (priority) {
          case "leve":
            return "priority-leve";
          case "medio":
            return "priority-medio";
          case "urgente":
            return "priority-urgente";
          default:
            return "";
        }
      },
    },
  })
);
app.set("view engine", "handlebars");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/tasks/inserttask", (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const priority = req.body.priority;
  const finish = false;

  const sql = `INSERT INTO tasks(title, description, priority, finish) VALUES('${title}', '${description}', '${priority}', '${finish}')`;

  conn.query(sql, function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/tasks");
  });
});

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tasklist",
});

app.get("/tasks", (req, res) => {
  const sql = "SELECT * FROM tasks WHERE finish = 0";

  conn.query(sql, (err, tasks) => {
    if (err) {
      console.log(err);
      return;
    }

    tasks.sort((a, b) => {
      const priorityOrder = {
        urgente: 1,
        medio: 2,
        leve: 3,
      };

      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    res.render("tasks", { tasks });
  });
});

app.get("/tasks/finish", (req, res) => {
  const sql = `SELECT * FROM tasks WHERE finish = 1`;
  conn.query(sql, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    const tasks = data;
    tasks.sort((a, b) => {
      const priorityOrder = {
        urgente: 1,
        medio: 2,
        leve: 3,
      };

      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    res.render("finish", { tasks });
  });
});

app.post("/tasks/finish/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE tasks SET finish = 1 WHERE id = ${id}`;
  conn.query(sql, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.json({ success: true });
  });
});

app.post("/tasks/refactor/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE tasks SET finish = 0 WHERE id = ${id}`;
  conn.query(sql, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.json({ success: true });
  });
});

app.get("/task/:id", (req, res) => {
  const id = req.params.id;

  const sql = `SELECT * FROM tasks WHERE id = ${id}`;
  conn.query(sql, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    const task = data[0];
    res.render("task", { task });
  });
});

app.delete("/task/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM tasks WHERE id = ${id}`;

  conn.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao excluir a tarefa");
      return;
    }
    res.status(200).send("Tarefa excluída com sucesso");
  });
});

app.get("/tasks/edit/:id", (req, res) => {
  const id = req.params.id;

  const sql = `SELECT * FROM tasks WHERE id = ${id}`;
  conn.query(sql, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    const task = data[0];
    res.render("edittask", { task });
  });
});

app.post("/tasks/updatetask", (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const description = req.body.description;
  const priority = req.body.priority;

  const sql = `UPDATE tasks SET title='${title}', description='${description}', priority='${priority}' WHERE id = ${id}`;

  conn.query(sql, function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/tasks");
  });
});

conn.connect(function (err) {
  if (err) {
    console.log(err);
  }
  console.log("Conectou ao MySQL");
  app.listen(3000);
});
