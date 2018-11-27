<template>
  <div class="container">
    <div class="row">
      <div class="col-md-12">
        <form class="well">
          <div class="form-group">
            <input
              type="text"
              class="form-control"
              placeholder="Enter GitHub Username..."
              v-model="username"
              name="username"
              @keyup="searchUser();"
            />
          </div>
        </form>
      </div>
    </div>

    <div class="row recommend-user-list">
      <div class="col-md-12">
        <button
          type="button"
          :disabled="isLoading"
          class="btn btn-primary btn-sm"
          v-for="userName of userList"
          :key="userName"
          @click="setUserName(userName);"
        >{{ userName }}</button>
      </div>
    </div>

    <div v-if="user">
      <div class="card">
        <div class="card-header">
          <h4>{{ user.name }}</h4>
        </div>
        <div class="card-block">
          <div class="row">
            <div class="col-md-3">
              <img class="card-img-top" :src="user.avatar_url" />
              <a
                class="btn btn-primary btn-block view-profile"
                target="_blank"
                :href="user.html_url"
                >View Profile</a>
            </div>
            <div class="col-md-9">
              <div class="stats">
                <a target="_blank" :href="user.html_url + '?tab=repositories'">
                  <button type="button" class="btn btn-primary">
                    Public Repos
                    <span class="badge badge-light">{{
                      user.public_repos
                    }}</span>
                  </button>
                </a>
                <button type="button" class="btn btn-info">
                  Public Gists
                  <span class="badge badge-light">{{ user.public_gists }}</span>
                </button>
                <a target="_blank" :href="user.html_url + '?tab=followers'">
                  <button type="button" class="btn btn-success">
                    Followers
                    <span class="badge badge-light">{{ user.followers }}</span>
                  </button>
                </a>
                <a target="_blank" :href="user.html_url + '?tab=following'">
                  <button type="button" class="btn btn-dark">
                    Following
                    <span class="badge badge-light">{{ user.following }}</span>
                  </button>
                </a>
              </div>

              <ul class="list-group">
                <li class="list-group-item">
                  <strong>Username</strong> {{ user.login }}
                </li>
                <li class="list-group-item">
                  <strong>Location</strong> {{ user.location }}
                </li>
                <li class="list-group-item">
                  <strong>Email</strong> {{ user.email }}
                </li>
                <li class="list-group-item">
                  <strong>Blog</strong
                  ><a target="_blank" :href="user.blog"> {{ user.blog }}</a>
                </li>
                <li class="list-group-item">
                  <strong>Member Since</strong> {{ user.created_at }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          User Repositories ({{ user.public_repos }})
        </div>
        <div class="card-body">
          <div
            class="alert alert-secondary"
            v-for="(repo, idx) of repos"
            :key="repo.html_url"
          >
            <div class="row">
              <div class="col-md-8">
                <a target="_blank" :href="repo.html_url" :title="repo.full_name">
                  <h4>{{ idx + 1 }}. {{ repo.name }}</h4>
                </a>
                <p>{{ repo.description }}</p>
              </div>
              <div class="col-md-4 op-btn-list">
                <a
                  target="_blank"
                  :href="repo.html_url + '/stargazers'"
                  title="Stars"
                >
                  <button type="button" class="btn btn-success btn-sm">
                    Stars
                    <span class="badge badge-light">{{
                      repo.stargazers_count
                    }}</span>
                  </button>
                </a>

                <a
                  target="_blank"
                  :href="repo.html_url + '/network/members'"
                  title="Fork"
                >
                  <button type="button" class="btn btn-info btn-sm">
                    Forks
                    <span class="badge badge-light">{{ repo.forks }}</span>
                  </button>
                </a>

                <a
                  target="_blank"
                  :href="repo.html_url + '/issues'"
                  title="Open Issues"
                >
                  <button type="button" class="btn btn-danger btn-sm">
                    Issues
                    <span class="badge badge-light">{{
                      repo.open_issues
                    }}</span>
                  </button>
                </a>
              </div>
            </div>
          </div>

          <div
            class="btn-toolbar pagination"
            role="toolbar"
            aria-label="Toolbar with button groups"
          >
            <div class="page-size">
              <select
                class="form-control form-control-sm"
                v-model="pager.pageSize"
                @change="getReoByPage(1);"
              >
                <option>10</option>
                <option>30</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
            <div class="btn-group" role="group" aria-label="First group">
              <button
                type="button"
                v-for="i of pageList"
                :key="i"
                :class="{ 'btn-success': pager.curPage === i + 1 }"
                class="btn btn-secondary"
                :disabled="isLoading"
                @click="getReoByPage(i + 1);"
              >{{ i + 1 }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tips-container" v-if="msgTip">
      <b-alert :show="!!msgTip" :variant="tipType">
        {{ msgTip }}
        <button type="button" class="close" @click="msgTip = '';">
          <span aria-hidden="true">&times;</span>
        </button>
      </b-alert>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { GithubService } from "../services/github.service";

@Component
export default class Profile extends Vue {
  @Prop() private msg!: string;

  user: any;
  username = 'lzwme';
  preUserName = '';
  repos: any[] = [];
  userList = [
    "lzwme",
    "renxia",
    "fex-team",
    "vuejs",
    "angular",
    "reactjs",
    "facebook",
    "microsoft",
    "google",
    "tencent",
    "alibaba",
    "baidu"
  ];

  isLoading = false;
  timeout = 10000;

  pager = {
    curPage: 0,
    pageSize: 50
  };

  tipTimer;
  tipType;
  msgTip = "";

  get pageList() {
    const page: number[] = [];

    if (!this.user) {
      return page;
    }

    const totalPage = Math.ceil(this.user.public_repos / this.pager.pageSize);

    for (let i = 0; i < totalPage; i++) {
      page.push(i);
    }

    return page;
  }

  githubService = new GithubService();

  constructor() {
    super();

    this.user = false;
    this.searchUser();
    window["profileComp"] = this;
  }

  searchUserTimer;
  searchUser() {
    const username = String(this.username).trim();

    if (this.isLoading || !username || username === this.preUserName) {
      return;
    }

    this.preUserName = username;
    clearTimeout(this.searchUserTimer);
    this.searchUserTimer = setTimeout(() => {
      this.githubService
        .updateUser(this.username)
        .getUser()
        .then(
          user => {
            this.user = user;
          },
          error => {
            console.log(error);
            this.showTips(
              `[getUser][${username}][${error.status}] ` + error.statusText,
              "danger"
            );
          }
        );

      this.getReoByPage(1);
    }, 300);
  }

  setUserName(name) {
    this.username = name;
    this.searchUser();
  }

  getReoByPage(page) {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.pager.curPage = page;

    // 最长多少 s 取消 loading
    setTimeout(() => (this.isLoading = false), this.timeout);

    const username = this.username;
    this.githubService.getRepositories(this.pager).then(
      repos => {
        this.isLoading = false;
        if (Array.isArray(repos)) {
          this.repos = repos;
          this.showTips("done!");
        }
      },
      error => {
        console.log(error);
        this.isLoading = false;
        this.showTips(
          `[getRepositories][${username}][${error.status}] ` + error.statusText,
          "danger"
        );
      }
    );
  }

  showTips(err, type: "success" | "warning" | "danger" | "info" = "success") {
    this.msgTip = err || "";
    this.tipType = type;

    clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => (this.msgTip = ""), 4500);
  }
}
</script>

<style scoped lang="less">
.card {
  margin-bottom: 1rem;
}

.recommend-user-list {
  margin-bottom: 0.625rem;

  button {
    margin-right: 5px;
    margin-bottom: 3px;
  }
}

.view-profile {
  margin-top: 0.625rem;
}

.stats {
  margin-bottom: 0.9375rem;

  button {
    margin-right: 3px;
  }
}

.op-btn-list {
  text-align: right;

  button {
    margin-right: 3px;
    margin-bottom: 2px;
  }
}

/**
 * pagination
 */
.pagination {
  text-align: center;
  justify-content: center;

  .btn-group {
    flex-wrap: wrap;
    margin-bottom: 3px;
  }

  .page-size {
    margin-bottom: 3px;
    margin-right: 8px;
    display: flex;
    align-items: center;
  }
}

/**
 * tips
 */
.tips-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  .alert {
    margin: 0;
    text-align: center;
  }
}
</style>
