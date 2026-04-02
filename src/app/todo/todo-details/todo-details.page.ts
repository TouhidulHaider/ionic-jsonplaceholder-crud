import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular/standalone';


import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkCircleOutline, createOutline, trashOutline } from 'ionicons/icons';
import { EditTodoModalComponent } from '../../components/edit-todo-modal/edit-todo-modal.component';
import { Todo, TodoUpdate } from '../../models/models';
import { TodosService } from '../../services/todos/todo.service';

@Component({
  selector: 'app-todo-details',
  templateUrl: './todo-details.page.html',
  styleUrls: ['./todo-details.page.scss'],
  standalone: true,
  // Add these to your existing imports array in todo-details.page.ts
  imports: [
    IonContent, 
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonButton,  
    IonIcon,    
    IonBadge,   
    IonCard,    
    IonCardHeader, 
    IonCardTitle,  
    IonCardContent, 
    IonSpinner, 
    AsyncPipe, 
    RouterLink
  ],
})

  
export class TodoDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly todosService = inject(TodosService);
  private readonly modalController = inject(ModalController);
  private readonly toastController = inject(ToastController);

  readonly todo$ = this.todosService.selectedTodo$;
  readonly isLoading$ = this.todosService.isLoading$;
  readonly error$ = this.todosService.error$;

  private todoId = 0;

  constructor() {
    addIcons({ arrowBackOutline, checkmarkCircleOutline, createOutline, trashOutline });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async (params) => {
      const id = Number(params.get('id'));
      if (Number.isNaN(id)) {
        await this.presentToast('Invalid todo id.');
        await this.router.navigate(['/todos']);
        return;
      }

      this.todoId = id;
      try {
        await this.todosService.loadTodoById(id);
      } catch {
        await this.presentToast('Failed to load todo details.');
        await this.router.navigate(['/todos']);
      }
    });
  }

  async openEditModal(todo: Todo): Promise<void> {
    const modal = await this.modalController.create({
      component: EditTodoModalComponent,
      componentProps: { todo },
      breakpoints: [0, 0.7, 1],
      initialBreakpoint: 0.7,
    });

    await modal.present();
    const result = await modal.onDidDismiss<Partial<TodoUpdate>>();
    if (result.role !== 'confirm' || !result.data) {
      return;
    }

    try {
      await this.todosService.updateTodo(this.todoId, result.data);
      await this.presentToast('Todo updated.');
    } catch {
      await this.presentToast('Failed to update todo.');
    }
  }

  async deleteTodo(): Promise<void> {
    try {
      await this.todosService.deleteTodo(this.todoId);
      await this.presentToast('Todo deleted.');
      await this.router.navigate(['/todos']);
    } catch {
      await this.presentToast('Failed to delete todo.');
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
