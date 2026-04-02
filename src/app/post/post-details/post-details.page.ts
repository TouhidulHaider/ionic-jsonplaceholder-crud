import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {  
  IonButton, 
  IonButtons, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle, 
  IonContent, 
  IonHeader, 
  IonIcon, 
  IonSpinner, 
  IonTitle, 
  IonToolbar, 
  ModalController, 
  ToastController 
} from '@ionic/angular/standalone';


import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkCircleOutline, createOutline, trashOutline } from 'ionicons/icons';
import { EditPostModalComponent } from '../../components/edit-post-modal/edit-post-modal.component';
import { Post, PostUpdate } from '../../models/models';
import { PostsService } from '../../services/posts/post.service';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.page.html',
  styleUrls: ['./post-details.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonButton,  
    IonIcon,       
    IonCard,    
    IonCardHeader, 
    IonCardTitle,  
    IonCardContent, 
    IonSpinner, 
    AsyncPipe, 
    RouterLink
  ],
})
export class PostDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly postsService = inject(PostsService);
  private readonly modalController = inject(ModalController);
  private readonly toastController = inject(ToastController);

  readonly post$ = this.postsService.selectedPost$;
  readonly isLoading$ = this.postsService.isLoading$;
  readonly error$ = this.postsService.error$;

  private postId = 0;

  constructor() { 
    addIcons({ arrowBackOutline, checkmarkCircleOutline, createOutline, trashOutline });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async (params) => {
      const id = Number(params.get('id'));
      if (Number.isNaN(id)) {
        await this.presentToast('Invalid post id.');
        await this.router.navigate(['/posts']);
        return;
      }

      this.postId = id;
      try {
        await this.postsService.loadPostById(id);
      } catch {
        await this.presentToast('Failed to load post details.');
        await this.router.navigate(['/posts']);
      }
    });
  }

  async openEditModal(post: Post): Promise<void> {
    const modal = await this.modalController.create({
      component: EditPostModalComponent,
      componentProps: { post },
      breakpoints: [0, 0.7, 1],
      initialBreakpoint: 0.7,
    });

    await modal.present();
    const result = await modal.onDidDismiss<Partial<PostUpdate>>();
    if (result.role !== 'confirm' || !result.data) {
      return;
    }

    try {
      await this.postsService.updatePost(this.postId, result.data);
      await this.presentToast('Post updated.');
    } catch {
      await this.presentToast('Failed to update post.');
    }
  }

  async deletePost(): Promise<void> {
    try {
      await this.postsService.deletePost(this.postId);
      await this.presentToast('Post deleted.');
      await this.router.navigate(['/posts']);
    } catch {
      await this.presentToast('Failed to delete this post. Please try again.');
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
