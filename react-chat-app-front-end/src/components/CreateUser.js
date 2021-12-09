/**
 * @author
 * @function CreateUser
 **/
/*Во многом компоненты ведут себя как обычные функции JavaScript. 
Они принимают произвольные входные данные (так называемые «пропсы») и возвращают React-элементы, описывающие, 
что мы хотим увидеть на экране. */
const CreateUser = (props) => {
  const { onCreateUser, value, onChange } = props;

  return (
    <div className="username-container">
      <form onSubmit={onCreateUser} style={{ display: "inline-block" }}>
        <h4 className="username-label">Введите имя</h4>
        <input className="input" value={value} onChange={onChange} />
      </form>
    </div>
  );
};
/*Эта функция — компонент, потому что она получает данные в одном объекте («пропсы») в качестве параметра 
и возвращает React-элемент. 
Мы будем называть такие компоненты «функциональными», так как они буквально являются функциями. */
export default CreateUser;
