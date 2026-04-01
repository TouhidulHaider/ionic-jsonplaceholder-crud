import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonContent,
  ToastController,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircleOutline, 
  eyeOutline, 
  trashOutline, 
  alertCircleOutline 
} from 'ionicons/icons';
import { TodosService } from '../../services/todos/todo.service';
// import { TruncateWordsPipe } from '../../custom_pipe/truncate-words.pipe';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.page.html',
  styleUrls: ['./todos.page.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonSpinner,
    IonContent
  ],
})

export class TodosPage implements OnInit {
  private readonly todosService = inject(TodosService);
  private readonly toastController = inject(ToastController);

  readonly todos$ = this.todosService.todos$;
  readonly isLoading$ = this.todosService.isLoading$;
  readonly error$ = this.todosService.error$;

  constructor() {
    addIcons({ checkmarkCircleOutline, eyeOutline, trashOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    this.loadTodos();
  }

  async deleteTodo(id: number): Promise<void> {
    try {
      await this.todosService.deleteTodo(id);
      await this.presentToast('Todo deleted.');
    } catch {
      await this.presentToast('Failed to delete todo.');
    }
  }

  async reload(): Promise<void> {
    await this.loadTodos();
  }

  private async loadTodos(): Promise<void> {
    try {
      await this.todosService.loadTodos();
    } catch {
      await this.presentToast('Failed to load todos.');
    }
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      position: 'top',
      color: 'light',
    });
    await toast.present();
  }
}


