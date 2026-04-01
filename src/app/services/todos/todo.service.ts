import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Todo, TodoUpdate } from '../../models/models';
import { HttpApiService } from '../http/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private readonly httpApi = inject(HttpApiService);
  private readonly locallyUpdatedTodos = new Map<number, Todo>();
  private readonly locallyDeletedTodoIds = new Set<number>();

  private readonly todosSubject = new BehaviorSubject<Todo[]>([]);
  private readonly selectedTodoSubject = new BehaviorSubject<Todo | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly todos$ = this.todosSubject.asObservable();
  readonly selectedTodo$ = this.selectedTodoSubject.asObservable();
  readonly isLoading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  async loadTodos(): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    try {
      const todos = await firstValueFrom(this.httpApi.get<Todo[]>('/todos'));
      this.todosSubject.next(this.applyLocalMutations(todos));
    } catch (error) {
      this.handleError(error, 'Unable to load todos. Please try again.');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loadTodoById(id: number): Promise<void> {
    const localTodo = this.locallyUpdatedTodos.get(id);
    if (localTodo) {
      this.errorSubject.next(null);
      this.selectedTodoSubject.next(localTodo);
      this.patchTodoInList(localTodo);
      return;
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    try {
      const todo = await firstValueFrom(this.httpApi.get<Todo>(`/todos/${id}`));
      this.selectedTodoSubject.next(todo);
      this.patchTodoInList(todo);
    } catch (error) {
      this.selectedTodoSubject.next(null);
      this.handleError(error, 'Unable to load this todo.');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateTodo(id: number, payload: TodoUpdate): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    try {
      const updated = await firstValueFrom(this.httpApi.put<Todo>(`/todos/${id}`, { id, ...payload }));
      this.locallyUpdatedTodos.set(updated.id, updated);
      this.locallyDeletedTodoIds.delete(updated.id);
      this.selectedTodoSubject.next(updated);
      this.patchTodoInList(updated);
    } catch (error) {
      this.handleError(error, 'Unable to update todo.');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteTodo(id: number): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    try {
      await firstValueFrom(this.httpApi.delete<{}>(`/todos/${id}`));
      this.locallyUpdatedTodos.delete(id);
      this.locallyDeletedTodoIds.add(id);
      const next = this.todosSubject.value.filter((todo) => todo.id !== id);
      this.todosSubject.next(next);
      if (this.selectedTodoSubject.value?.id === id) {
        this.selectedTodoSubject.next(null);
      }
    } catch (error) {
      this.handleError(error, 'Unable to delete todo.');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private patchTodoInList(updatedTodo: Todo): void {
    const current = this.todosSubject.value;
    if (current.length === 0) {
      return;
    }

    const index = current.findIndex((todo) => todo.id === updatedTodo.id);
    if (index === -1) {
      return;
    }

    const next = [...current];
    next[index] = updatedTodo;
    this.todosSubject.next(next);
  }

  private handleError(error: unknown, message: string): void {
    console.error(error);
    this.errorSubject.next(message);
  }

  private applyLocalMutations(todos: Todo[]): Todo[] {
    const merged = todos
      .filter((todo) => !this.locallyDeletedTodoIds.has(todo.id))
      .map((todo) => this.locallyUpdatedTodos.get(todo.id) ?? todo);

    // Keep locally edited todos even if a refetch payload misses them.
    for (const [id, todo] of this.locallyUpdatedTodos) {
      if (this.locallyDeletedTodoIds.has(id)) {
        continue;
      }

      if (!merged.some((item) => item.id === id)) {
        merged.push(todo);
      }
    }

    return merged;
  }
}
