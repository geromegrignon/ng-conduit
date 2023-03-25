import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  ComponentStore,
  OnStoreInit,
  tapResponse,
} from '@ngrx/component-store';
import { exhaustMap, pipe, withLatestFrom } from 'rxjs';
import { ApiClient, NewArticle } from '../shared/data-access/api';
import { AuthStore } from '../shared/data-access/auth.store';

@Injectable()
export class NewArticleStore extends ComponentStore<{}> implements OnStoreInit {
  private readonly apiClient = inject(ApiClient);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  ngrxOnStoreInit() {
    this.setState({});
  }

  readonly createArticle = this.effect<NewArticle>(
    pipe(
      withLatestFrom(this.authStore.auth$),
      exhaustMap(([article, { user }]) =>
        this.apiClient.createArticle({ article }).pipe(
          tapResponse(
            (response) => {
              if (response && response.article) {
                void this.router.navigate(['/article', response.article.slug]);
              } else {
                void this.router.navigate(['/profile', user?.username]);
              }
            },
            (error) => {
              console.error('error creating article: ', error);
            }
          )
        )
      )
    )
  );
}
