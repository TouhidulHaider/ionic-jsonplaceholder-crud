import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    children: [
      {
        path: 'todos',
        loadComponent: () => import('./todo/todos/todos.page').then((m) => m.TodosPage),
      },
      {
        path: 'todos/:id',
        loadComponent: () => import('./todo/todo-details/todo-details.page').then((m) => m.TodoDetailsPage),
      },
      {
        path: 'posts',
        loadComponent: () => import('./post/posts/posts.page').then((m) => m.PostsPage),
      },
      {
        path: 'posts/:id',
        loadComponent: () => import('./post/post-details/post-details.page').then((m) => m.PostDetailsPage),
      },
      {
        path: '',
        redirectTo: 'todos',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'todos',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'todos',
    pathMatch: 'full',
  },
  {
    path: 'todo-details',
    loadComponent: () => import('./todo/todo-details/todo-details.page').then( m => m.TodoDetailsPage)
  },
  {
    path: 'posts',
    loadComponent: () => import('./post/posts/posts.page').then( m => m.PostsPage)
  },
  {
    path: 'post-details',
    loadComponent: () => import('./post/post-details/post-details.page').then( m => m.PostDetailsPage)
  },
];
