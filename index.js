const http = require("http");
const url = require("url");
const fs = require("fs");
const querystring = require("querystring");
const data = fs.readFileSync("./projets.data.json");
let projects = JSON.parse(data);
let lastIndex = projects.length === 0 ? 0 : projects[projects.length - 1].id;
const server = http.createServer((req, res) => {
  const urlParse = url.parse(req.url, true);

  if (urlParse.pathname == "/projects" && req.method == "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(projects, null, 2));
  }
  if (urlParse.pathname == "/projects" && req.method == "POST") {
    req.on("data", (data) => {
      const jsonData = JSON.parse(data);
      const title = jsonData.title;
      if (title) {
        projects.push({ id: ++lastIndex, title, tasks: [] });
        fs.writeFile("./projets.data.json", JSON.stringify(projects), (err) => {
          if (err) {
            const message = { message: "could not persist data!" };
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify(message, null, 2));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(projects, null, 2));
          }
        });
      } else {
        const message = { message: "no title in body request!" };
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify(message, null, 2));
      }
    });
  }
  if (urlParse.pathname == "/projects/tasks" && req.method == "POST") {
    req.on("data", (data) => {
      const search = urlParse.search;
      if (search) {
        const [, query] = search.split("?");
        const id = querystring.parse(query).id;
        if (id) {
          const jsonData = JSON.parse(data);
          const task = jsonData.task;
          if (!task) {
            const message = { message: "no task found in body request" };
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify(message, null, 2));
          } else {
            projects.forEach((project, index) => {
              if (project.id == id) {
                projects[index].tasks.push(task);
              }
            });
            fs.writeFile("./data.json", projects, (err) => {
              if (err) {
                const message = "could not persist data !";
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify(message, null, 2));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(projects, null, 2));
              }
            });
          }
        } else {
          const message = { message: "no id parameter !" };
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify(message, null, 2));
        }
      } else {
        const message = { message: "no query parameter!" };

        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify(message, null, 2));
      }
    });
  }

  if (urlParse.pathname == "/projects" && req.method == "PUT") {
    req.on("data", (data) => {
      const search = urlParse.search;
      if (search) {
        const [, query] = urlParse.search.split("?");
        const id = querystring.parse(query).id;
        if (id) {
          const jsonData = JSON.parse(data);
          const title = jsonData.title;
          if (!title) {
            const message = { message: "no title found in body request" };
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify(message, null, 2));
          } else {
            projects.forEach((project, index) => {
              if (project.id == id) {
                projects[index].title = title;
              }
            });
            fs.writeFile("./data.json", projects, (err) => {
              if (err) {
                const message = { message: "could not persist data!" };
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify(message, null, 2));
              } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(projects, null, 2));
              }
            });
          }
        } else {
          const message = { message: "no id parameter!" };
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify(message, null, 2));
        }
      } else {
        const message = { message: "no query parameter!" };

        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify(message, null, 2));
      }
    });
  }

  if (urlParse.pathname == "/projects" && req.method == "DELETE") {
    const search = urlParse.search;
    if (search) {
      const [, query] = search.split("?");
      const id = querystring.parse(query).id;
      if (id) {
        projects = projects.filter((project) => project.id != id);
        fs.writeFile("./data.json", projects, (err) => {
          if (err) {
            const message = { message: "could not persist data!" };
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify(message, null, 2));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(projects, null, 2));
          }
        });
      }
    } else {
      const message = { message: "no query parameter!" };
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify(message, null, 2));
    }
  }
});

server.listen(8000);
