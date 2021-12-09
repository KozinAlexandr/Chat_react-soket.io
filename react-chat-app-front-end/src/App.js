import "./App.css";
import { io } from "socket.io-client";
import logo from "./assets/chat.png";
import { useEffect, useRef, useState } from "react";

import CreateUser from "./components/CreateUser";
import OnlineUsers from "./components/OnlineUsers";
import MessagesControl from "./components/MessagesControl";

const socket = io(`http://localhost:9999`);
/*Хуки — это функции, с помощью которых вы можете «подцепиться» к состоянию и методам жизненного цикла 
React из функциональных компонентов. 
Хуки не работают внутри классов — они дают вам возможность использовать React без классов.

Хук состояния(useState) - через него мы управляем состоянием функционального компонента React.
1-я переменная хранит состояние, а 2 переменная функция в которой мы можем изменять само состояние.

Хук эффекта(useEffect) - Когда вы вызываете useEffect, React получает указание запустить вашу функцию с «эффектом» после того,
 как он отправил изменения в DOM. 
Поскольку эффекты объявляются внутри компонента, у них есть доступ к его пропсам и состоянию.

Хук useRef - useRef возвращает изменяемый ref-объект, свойство .current которого инициализируется переданным аргументом (null). 
Возвращённый объект будет сохраняться в течение всего времени жизни компонента.
По сути, useRef похож на «коробку», которая может содержать изменяемое значение в своём свойстве .current.*/
function App() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [receiver, setReceiver] = useState("");
  const [avatar, setAvatar] = useState("");
  const [media, setMedia] = useState(null);
  const [users, setUsers] = useState({});
  const [message, setMessage] = useState("");
  const [groupMessage, setGroupMessage] = useState({});
  const receiverRef = useRef(null);

  const sortNames = (username1, username2) => {
    return [username1, username2].sort().join("-");
  };

  const gotoBottom = () => {
    const el = document.querySelector(".message-area ul");
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const onCreateUser = () => {
    console.log(username);

    // отправить текущему сокету сформировавшему запрос (туда откуда пришла)
    socket.emit("new_user", username);
    const a = parseInt(Math.floor(Math.random() * 8) + 1) + ".png";
    setAvatar(a);

    setStep((prevStep) => prevStep + 1);
  };

  const onUserSelect = (username) => {
    setReceiver(username);
    receiverRef.current = username;
    setStep((prevStep) => prevStep + 1);
  };

  const onChatClose = () => {
    setStep(1);
    receiverRef.current = null;
  };

  const sendMessage = (e) => {
    e.preventDefault();

    const data = {
      sender: username,
      receiver,
      message,
      media,
      avatar,
      view: false,
    };

    // здесь мы отправляем
    socket.emit("send_message", data);

    const key = sortNames(username, receiver);
    const tempGroupMessage = { ...groupMessage };
    if (key in tempGroupMessage) {
      tempGroupMessage[key] = [
        ...tempGroupMessage[key],
        { ...data, view: true },
      ];
    } else {
      tempGroupMessage[key] = [{ ...data, view: true }];
    }

    setGroupMessage({ ...tempGroupMessage });

    if (media !== null) {
      setMedia(null);
    }

    setMessage("");

    // alex, ana [alex-ana] => [m1, m2, m3], ana-alex
    // alex, john [alex-john] => [m1, m2, m3]
    //ana, john [ana-john] => [m1, m2, m3]
  };

  const checkUnseenMessages = (receiver) => {
    const key = sortNames(username, receiver);
    let unseenMessages = [];
    if (key in groupMessage) {
      unseenMessages = groupMessage[key].filter((msg) => !msg.view);
    }

    return unseenMessages.length;
  };

  useEffect(() => {
    // Навешиваем обработчик на входящее сообщение
    socket.on("all_users", (users) => {
      console.log({ users });
      setUsers(users);
    });

    socket.on("new_message", (data) => {
      console.log(data);

      console.log({ rec: receiverRef.current, data }, "asfedfee");

      setGroupMessage((prevGroupMessage) => {
        const messages = { ...prevGroupMessage };
        const key = sortNames(data.sender, data.receiver);

        if (receiverRef.current === data.sender) {
          data.view = true;
        }

        if (key in messages) {
          messages[key] = [...messages[key], data];
        } else {
          messages[key] = [data];
        }

        return { ...messages };
      });
    });
  }, []);

  useEffect(() => {
    // здесь мы собираемся обновить количество просмотров выбранного пользователя = получателя
    updateMessageView();
  }, [receiver]);

  const updateMessageView = () => {
    const key = sortNames(username, receiver);
    if (key in groupMessage) {
      const messages = groupMessage[key].map((msg) =>
        !msg.view ? { ...msg, view: true } : msg
      );

      groupMessage[key] = [...messages];

      setGroupMessage({ ...groupMessage });
    }
  };

  useEffect(() => {
    const key = sortNames(username, receiver);
    if (key in groupMessage) {
      if (groupMessage[key].length > 0) {
        gotoBottom();
      }
    }
  }, [groupMessage]);

  console.log(groupMessage);

  return (
    <div className="App">
      <header className="app-header">
        <img src={logo} alt="" />
        <div className="app-name b-500 primaryColor">Simple Chat</div>
      </header>

      <div className="chat-system">
        <div className="chat-box">
          {/*Шаг 1: спросите имя пользователя*/}
          {step === 0 ? (
            <CreateUser
              onCreateUser={onCreateUser}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : null}
          {/* Шаг 2: показать всех доступных пользователей */}
          {step === 1 ? (
            <OnlineUsers
              onUserSelect={onUserSelect}
              users={users}
              username={username}
              checkUnseenMessages={checkUnseenMessages}
            />
          ) : null}
          {/* Шаг 3: выберите пользователя и перейдите в окно чата */}
          {step === 2 ? (
            <MessagesControl
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sendMessage={sendMessage}
              groupMessage={groupMessage}
              sortNames={sortNames}
              username={username}
              receiver={receiver}
              setMedia={setMedia}
              onChatClose={onChatClose}
              media={media}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
