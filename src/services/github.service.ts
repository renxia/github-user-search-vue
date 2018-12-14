/*
 * @Author: renxia
 * @Date: 2018-11-19 16:00:07
 * @LastEditors: gflizhiwen
 * @LastEditTime: 2018-12-14 17:30:25
 * @Description: github api (https://developer.github.com/v3/repos/)
 */

// import { environment } from '../../environments/environment';

const environment = {
  production: process.env.NODE_ENV === 'production',
};

export class GithubService {
  private username: string = '';
  private client_id = '36be6727c9e3eda9bba1';
  private client_secret = 'e89938e1cc176e0ca06712deadda4b44237308a4';
  private baseUrl = environment.production ? 'https://api.github.com/' : '/';

  constructor() {
    this.username = '';
  }

  getUser() {
    const opts = {
      client_id: this.client_id,
      client_secret: this.client_secret,
    };

    const querystring = Object.keys(opts).reduce((qs, key) => {
      qs += key + '=' + opts[key] + '&';
      return qs;
    }, '');

    return fetch(this.baseUrl + 'users/' + this.username + '?' + querystring).then(resp => resp.json());
  }

  /**
   * Github 仓库搜索 API DOC: https://developer.github.com/v3/search/#search-repositories
   * @param params
   */
  searchRepos(params) {
    const opts = {
      client_id: this.client_id,
      client_secret: this.client_secret,
      sort: params.sort || 'updated',
      order: params.direction || 'desc',
      per_page: params.pageSize || 50,
      page: params.curPage || 1,
      q: encodeURIComponent(params.q || ''),
    };

    if (!params.q) {
      return this.getRepositories(params);
    }

    params.fork = true;
    opts.q += `+user:${this.username}+fork:${params.fork}`;

    const querystring = Object.keys(opts).reduce((qs, key) => {
      qs += key + '=' + opts[key] + '&';
      return qs;
    }, '');

    return fetch(this.baseUrl + 'search/repositories?' + querystring).then(resp => resp.json());
  }

  getRepositories(params) {
    const opts = {
      client_id: this.client_id,
      client_secret: this.client_secret,
      sort: params.sort || 'updated',
      direction: params.direction || 'desc',
      type: params.type || 'owner',
      per_page: params.pageSize || 50,
      page: params.curPage || 1,
    };

    const querystring = Object.keys(opts).reduce((qs, key) => {
      qs += key + '=' + opts[key] + '&';
      return qs;
    }, '');

    return fetch(this.baseUrl + 'users/' + this.username + '/repos?' + querystring).then(resp => resp.json());
  }

  updateUser(username) {
    this.username = (username + '').trim();
    return this;
  }
}
