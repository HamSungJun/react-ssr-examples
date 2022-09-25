import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";

interface ITodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const fetchTodos = async (): Promise<ITodo[]> => {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos");
  return await response.json();
};

export default function About() {
  const [todos, setTodos] = useState<ITodo[]>([]);

  useEffect(() => {
    fetchTodos().then((todos) => {
      setTodos(todos);
    });
  }, []);
  return (
    <>
      <Helmet>
        <title>About</title>
      </Helmet>
      <h1>About</h1>
      <div>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
