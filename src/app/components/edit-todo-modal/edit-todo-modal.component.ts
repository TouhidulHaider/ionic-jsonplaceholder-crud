import { Component, OnInit, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { Todo, TodoUpdate } from '../../models/models';

@Component({
  selector: 'app-edit-todo-modal',
  standalone: true,
  templateUrl: './edit-todo-modal.component.html',
  styleUrls: ['./edit-todo-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonTitle,
    IonToolbar,
  ],
})
export class EditTodoModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly modalController = inject(ModalController);

  readonly todo = input.required<Todo>();

  readonly form = this.fb.nonNullable.group({
    userId: [1, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.minLength(1)]],
    completed: [false],
  });

  ngOnInit(): void {
    const currentTodo = this.todo();
    this.form.patchValue({
      userId: currentTodo.userId,
      title: currentTodo.title,
      completed: currentTodo.completed,
    });
  }

  cancel(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: Partial<TodoUpdate> = {
      userId: formValue.userId,
      completed: formValue.completed,
    };

    if (formValue.title.trim()) {
      payload.title = formValue.title;
    }

    this.modalController.dismiss(payload, 'confirm');
  }
}
