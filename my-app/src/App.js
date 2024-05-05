import { useState } from 'react'
import ToDoForm from './ToDoForm'
import ToDo from './Todo'

function App() {
  const [toDos, setToDos] = useState([])

  const addTask = (userInput) => {
    if (userInput) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        task: userInput,
        complete: false
      }
      setToDos([...toDos, newItem])
    }

  }
  const removeTask = (id) => {
    setToDos([...toDos.filter((toDo) => toDo.id !== id)])
 }
  const handleToggle = (id) => {
    setToDos(
      toDos.map((toDo) =>
        toDo.id === id ? { ...toDo, complete: !toDo.complete } : { ...toDo }
      )
    )

  }

  return (
    <div className="App">
      <header>
        <h1>Список задач: {toDos.length}</h1>
      </header>
    <ToDoForm addTask={addTask} />
    {toDos.map((toDo) => (
      <ToDo
        todo={toDo}
        key={toDo.id}
        toggleTask={handleToggle}
        removeTask={removeTask}

      />
    ))}
    </div>
  );
}

export default App;
