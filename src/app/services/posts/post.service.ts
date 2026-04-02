import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Post, PostUpdate } from '../../models/models';
import { HttpApiService } from '../http/http-api.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpApi = inject(HttpApiService);
  private readonly locallyUpdatedPosts = new Map<number, Post>();
  private readonly locallyDeletedPostIds = new Set<number>();

  private readonly postsSubject = new BehaviorSubject<Post[]>([]);
  private readonly selectedPostSubject = new BehaviorSubject<Post | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly posts$ = this.postsSubject.asObservable();
  readonly selectedPost$ = this.selectedPostSubject.asObservable();
  readonly isLoading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  async loadPosts(): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    try {
      const posts = await firstValueFrom(this.httpApi.get<Post[]>('/posts'));
      const mergedPosts = this.applyLocalMutations(posts);
      this.postsSubject.next(mergedPosts);
    } catch (error) {
      this.handleError(error, 'Unable to load posts. Please try again.');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loadPostById(id: number): Promise<void> {
    const localPost = this.locallyUpdatedPosts.get(id);
    if (localPost) {
      this.errorSubject.next(null);
      this.selectedPostSubject.next(localPost);
      this.patchPostInList(localPost);
      return;
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    try {
      const post = await firstValueFrom(this.httpApi.get<Post>(`/posts/${id}`));
      this.selectedPostSubject.next(post);
      this.patchPostInList(post);
    } catch (error) {
      this.selectedPostSubject.next(null);
      this.handleError(error, 'Unable to load this post.');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updatePost(id: number, payload: Partial<PostUpdate>): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    try {
      const current =
        this.locallyUpdatedPosts.get(id) ??
        this.selectedPostSubject.value ??
        this.postsSubject.value.find((post) => post.id === id);

      if (!current) {
        throw new Error('Post not found locally for update merge.');
      }

      const mergedPayload: PostUpdate = {
        userId: payload.userId ?? current.userId,
        title: payload.title ?? current.title,
        body: payload.body ?? current.body,
      };

      const updated = await firstValueFrom(this.httpApi.put<Post>(`/posts/${id}`, { id, ...mergedPayload }));
      this.locallyUpdatedPosts.set(updated.id, updated);
      this.locallyDeletedPostIds.delete(updated.id);
      this.selectedPostSubject.next(updated);
      this.patchPostInList(updated);
    } catch (error) {
      this.handleError(error, 'Unable to update post.');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deletePost(id: number): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    try {
      await firstValueFrom(this.httpApi.delete<{}>(`/posts/${id}`));
      this.locallyUpdatedPosts.delete(id);
      this.locallyDeletedPostIds.add(id);
      const next = this.postsSubject.value.filter((post) => post.id !== id);
      this.postsSubject.next(next);
      if (this.selectedPostSubject.value?.id === id) {
        this.selectedPostSubject.next(null);
      }
    } catch (error) {
      this.handleError(error, 'Unable to delete post.');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private patchPostInList(updatedPost: Post): void {
    const current = this.postsSubject.value;
    if (current.length === 0) {
      return;
    }

    const index = current.findIndex((post) => post.id === updatedPost.id);
    if (index === -1) {
      return;
    }

    const next = [...current];
    next[index] = updatedPost;
    this.postsSubject.next(next);
  }

  private handleError(error: unknown, message: string): void {
    console.error(error);
    this.errorSubject.next(message);
  }

  private applyLocalMutations(posts: Post[]): Post[] {
    const merged = posts
      .filter((post) => !this.locallyDeletedPostIds.has(post.id))
      .map((post) => this.locallyUpdatedPosts.get(post.id) ?? post);

    // keep the locally updated posts that are not in the original list (e.g. created after the initial load)
    for (const [id, updated] of this.locallyUpdatedPosts) {
      if (this.locallyDeletedPostIds.has(id)) {
        continue;
      }

      if (!posts.some((post) => post.id === id)) {
        merged.push(updated);
      }
    }
    return merged;
  }
}
