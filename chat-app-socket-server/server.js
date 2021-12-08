//s-c без прерывная связь
//когда выходим клиент дает данных на выход серверу
//В отличии от GET(клиент отправляет на сервер, а сервер обрабатывает и отдает обратно информацию)
//запроса socket работают стабильно(всегда) без задержки
//То есть не нужна ждать пока запрос будет доставлен и нам прийдет ответ
//Благодаря express приложение привратиться в веб приложение
const app = require("express")();// помещаем в app express приложение
const httpServer = require("http").createServer(app);//создаем сервер http
const io = require("socket.io")(httpServer, {//создаем сокеты
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const PORT = 9999;//Порт - это всего лишь число, указываемое при запросе на соединение.

// app.get("/", (req, res) => {
//   res.status(200).json({ name: "Server" });
// });

const users = {};

io.on("connection", (socket) => {
  console.log("Кто-то подключился и идентификатор сокета = " + socket.id);

  socket.on("disconnect", () => {
    console.log(`${socket.id} отключился`);

    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
      }
    }

    io.emit("all_users", users);
  });

  socket.on("new_user", (username) => {
    console.log("Server : " + username);
    users[username] = socket.id;

    //Говорим всем остальным пользователям, что кто-то подключен
    io.emit("all_users", users);
  });

  socket.on("send_message", (data) => {
    console.log(data);

    const socketId = users[data.receiver];
    io.to(socketId).emit("new_message", data);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Сервер прослушивает порт: ${PORT}`);
});
