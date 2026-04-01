import { Component, OnInit, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { Post, PostUpdate } from '../../models/models';

@Component({
  selector: 'app-edit-post-modal',
  standalone: true,
  templateUrl: './edit-post-modal.component.html',
  styleUrls: ['./edit-post-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class EditPostModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly modalController = inject(ModalController);

  readonly post = input.required<Post>();

  readonly form = this.fb.nonNullable.group({
    userId: [1, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required, Validators.minLength(3)]],
    body: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    const currentPost = this.post();
    this.form.patchValue({
      userId: currentPost.userId,
      title: currentPost.title,
      body: currentPost.body,
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

    const payload: PostUpdate = this.form.getRawValue();
    this.modalController.dismiss(payload, 'confirm');
  }
}
