import React from "react";

/**
 * @author
 * @function OnlineUsers
 **/

/*Во многом компоненты ведут себя как обычные функции JavaScript. 
Они принимают произвольные входные данные (так называемые «пропсы») и возвращают React-элементы, описывающие, что мы хотим увидеть на экране. */
const OnlineUsers = (props) => {
  const { onUserSelect, users, username, checkUnseenMessages } = props;

  return (
    <div>
      <div className="online-users-header">
        <div style={{ margin: "0 10px" }}>Пользователи в сети</div>
      </div>
      <ul className="users-list">
        {users &&
          Object.keys(users).map((user, index) => (
            <>
              {user !== username ? (
                <li key={user} onClick={() => onUserSelect(user)}>
                  <span style={{ textTransform: "capitalize" }}>{user}</span>
                  {checkUnseenMessages(user) !== 0 ? (
                    <span className="new-message-count">
                      {checkUnseenMessages(user)}
                    </span>
                  ) : null}
                </li>
              ) : null}
            </>
          ))}
      </ul>
    </div>
  );
};
/*Эта функция — компонент, потому что она получает данные в одном объекте («пропсы») в качестве параметра и возвращает React-элемент. 
Мы будем называть такие компоненты «функциональными», так как они буквально являются функциями. */
export default OnlineUsers;
