import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import {
  IonContent,
  IonHeader, 
  IonLabel, 
  IonRouterOutlet,
  IonSegment, 
  IonSegmentButton, 
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
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

  activeSection: 'todos' | 'posts' = 'todos';
  showSectionHeader = true;

  ngOnInit(): void {
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
    this.router.navigate(['/home', value]);
  }

  private syncSegmentWithRoute(url: string): void {
    this.activeSection = url.includes('/posts') ? 'posts' : 'todos';
    this.showSectionHeader = !/\/todos\/\d+/.test(url);
  }
}
