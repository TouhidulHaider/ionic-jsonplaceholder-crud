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
import { PostsService } from '../../services/posts/post.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.page.html',
  styleUrls: ['./posts.page.scss'],
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
export class PostsPage implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly toastController = inject(ToastController);

  readonly posts$ = this.postsService.posts$;
  readonly isLoading$ = this.postsService.isLoading$;
  readonly error$ = this.postsService.error$;

  constructor() {
    addIcons({ checkmarkCircleOutline, eyeOutline, trashOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  async deletePost(id: number): Promise<void> {
    try {
      await this.postsService.deletePost(id);
      await this.presentToast('Post deleted.');
    } catch {
      await this.presentToast('Unable to delete this post. Please try again.');
    }
  }

  async reload(): Promise<void> {
    await this.loadPosts();
  }

  private async loadPosts(): Promise<void> {
    try {
      await this.postsService.loadPosts();
    } catch {
      await this.presentToast('Unable to load posts. Please try again.');
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
