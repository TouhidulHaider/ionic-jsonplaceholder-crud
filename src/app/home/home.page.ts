import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { filter, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import {
  IonContent,
  IonHeader, 
  IonLabel, 
  IonRouterOutlet,
  IonSegment, 
  IonSegmentButton, 
  IonToolbar
} from '@ionic/angular/standalone';
import { PostsService } from '../services/posts/post.service';
import { TodosService } from '../services/todos/todo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    AsyncPipe,
    IonContent,
    IonHeader, 
    IonLabel, 
    IonRouterOutlet,
    IonSegment, 
    IonSegmentButton, 
    IonToolbar
  ],
})

export class HomePage implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly todosService = inject(TodosService);
  private readonly postsService = inject(PostsService);

  readonly todoCount$ = this.todosService.todos$.pipe(map((todos) => todos.length));
  readonly postCount$ = this.postsService.posts$.pipe(map((posts) => posts.length));

  activeSection: 'todos' | 'posts' = 'todos';
  showSectionHeader = true;

  ngOnInit(): void {
    // Preload both lists so segment counts are available immediately.
    void this.todosService.loadTodos().catch(() => undefined);
    void this.postsService.loadPosts().catch(() => undefined);

    this.syncSegmentWithRoute(this.router.url);
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const navigation = event as NavigationEnd;
        this.syncSegmentWithRoute(navigation.urlAfterRedirects);
      });
  }

  onSectionChange(section: string | null): void {
    const value = section === 'posts' ? 'posts' : 'todos';
    this.router.navigate(['/', value]);
  }

  private syncSegmentWithRoute(url: string): void {
    this.activeSection = url.includes('/posts') ? 'posts' : 'todos';
    // Hide section header when on todo details page
    this.showSectionHeader = !/\/todos\/\d+/.test(url);
    // Hide section header when on post details page
    this.showSectionHeader = this.showSectionHeader && !/\/posts\/\d+/.test(url);
  }
}
