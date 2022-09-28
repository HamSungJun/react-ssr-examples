import { Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { useTodosQuery } from "../queries";

export default function About() {
  const { data } = useTodosQuery();
  const onClick = () => {
    console.log("click");
  };
  return (
    <>
      <Helmet>
        <title>About</title>
      </Helmet>
      <h1>About</h1>
      <div>
        <button onClick={onClick}>click</button>
        <ul>{JSON.stringify(data)}</ul>
      </div>
    </>
  );
}
