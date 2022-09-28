import { useQuery } from "@tanstack/react-query";
import { fetchTodos } from "../apis";

export const useTodosQuery = () => {
  return useQuery(["todos"], fetchTodos, { suspense: true });
};
