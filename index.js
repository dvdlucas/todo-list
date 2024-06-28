const express = require("express");
const exphbs = require("express-handlebars");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

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

  const sql = `INSERT INTO tasks(title, description, priority, finish) VALUES(?, ?, ?, ?)`;

  db.run(sql, [title, description, priority, finish], function (err) {
    if (err) {
      console.error(err.message);
    }
    res.redirect("/tasks");
  });
});

app.get("/tasks", (req, res) => {
  const sql = "SELECT * FROM tasks WHERE finish = 0";

  db.all(sql, [], (err, tasks) => {
    if (err) {
      console.error(err.message);
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
  db.all(sql, [], (err, tasks) => {
    if (err) {
      console.error(err.message);
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

    res.render("finish", { tasks });
  });
});

app.post("/tasks/finish/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE tasks SET finish = 1 WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      console.error(err.message);
      return;
    }
    res.json({ success: true });
  });
});

app.post("/tasks/refactor/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE tasks SET finish = 0 WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      console.error(err.message);
      return;
    }
    res.json({ success: true });
  });
});

app.get("/task/:id", (req, res) => {
  const id = req.params.id;

  const sql = `SELECT * FROM tasks WHERE id = ?`;

  db.get(sql, [id], (err, task) => {
    if (err) {
      console.error(err.message);
      return;
    }
    res.render("task", { task });
  });
});

app.delete("/task/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM tasks WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erro ao excluir a tarefa");
      return;
    }
    res.status(200).send("Tarefa excluída com sucesso");
  });
});

app.get("/tasks/edit/:id", (req, res) => {
  const id = req.params.id;

  const sql = `SELECT * FROM tasks WHERE id = ?`;

  db.get(sql, [id], (err, task) => {
    if (err) {
      console.error(err.message);
      return;
    }
    res.render("edittask", { task });
  });
});

app.post("/tasks/updatetask", (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const description = req.body.description;
  const priority = req.body.priority;

  const sql = `UPDATE tasks SET title = ?, description = ?, priority = ? WHERE id = ?`;

  db.run(sql, [title, description, priority, id], function (err) {
    if (err) {
      console.error(err.message);
    }
    res.redirect("/tasks");
  });
});

const db = new sqlite3.Database(path.join(__dirname, "tasks.db"), (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Conectado ao banco de dados SQLite.");

  db.run(
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL,
      finish INTEGER
    )`,
    (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Tabela "tasks" criada com sucesso');
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor iniciado na porta 3000");
});
