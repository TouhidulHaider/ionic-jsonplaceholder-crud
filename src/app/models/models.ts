export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export type PostUpdate = Omit<Post, 'id'>;
export type TodoUpdate = Omit<Todo, 'id'>;

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}
