const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const startAndRunDataBase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running: http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

startAndRunDataBase();

// Invalid Errors

const InvalidResponse = (response, cause) => {
  response.status(400);
  response.send(`Invalid ${cause}`);
};

// API GET

app.get("/todos/", async (request, response) => {
  let addToQuery = ``;
  let counter = 0;
  for (key in request.query) {
    if (counter > 0) {
      addToQuery += " AND ";
    }
    let keyHolder;
    if (key === "search_q") {
      keyHolder = "todo";
    } else {
      keyHolder = key;
    }

    addToQuery += `${keyHolder} LIKE '%${request.query[key]}%'`;
    counter += 1;
  }

  addToQuery += ";";
  //   console.log(addToQuery);
  const getTodoQuery =
    `SELECT
   id, todo, priority, status, category, due_date AS dueDate 
   FROM todo WHERE ` + addToQuery;
  //   console.log(getTodoQuery);
  let todoDetails = await db.all(getTodoQuery);
  response.send(todoDetails);
});

// API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  //   console.log(todoId);
  const getQueryById = `
  SELECT 
    id, todo, priority, status, category, due_date AS dueDate
    FROM todo 
    WHERE id = ${todoId};`;

  let detais = await db.get(getQueryById);
  response.send(detais);
});

// API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  const getAgendaQuery = `
  SELECT 
    id, todo, priority, status, category, due_date AS dueDate
    FROM todo
  WHERE 
    due_date = '${date}';`;
  console.log(getAgendaQuery);
  let agendaObj = await db.all(getAgendaQuery);
  console.log(agendaObj);
  response.send(agendaObj);
});

module.exports = app;
