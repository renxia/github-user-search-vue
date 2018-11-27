<template>
  <div id="app">
    <nav class="navbar navbar-expand-md navbar-light bg-light">
      <a
        class="header-logo-invertocat"
        href="https://github.com/renxia/github-user-search-vue"
        target="_balnk"
        title="Github Repo Home Page"
      >
        <svg
          height="32"
          class="octicon octicon-mark-github"
          viewBox="0 0 16 16"
          version="1.1"
          width="32"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          ></path>
        </svg>
      </a>

      <b-navbar-brand class="nav-title">GitHub User Search</b-navbar-brand>
      <b-navbar-toggle target="navbarsExampleDefault"></b-navbar-toggle>

      <b-collapse
        is-nav
        class="collapse navbar-collapse"
        id="navbarsExampleDefault"
      >
        <b-navbar-nav>
          <router-link class="navbar-brand" to="/">Home</router-link>
          <router-link class="navbar-brand" to="/about">About</router-link>
        </b-navbar-nav>
      </b-collapse>
    </nav>

    <router-view />
  </div>
</template>

<style lang="less">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.navbar {
  .nav-title {
    margin-left: 5px;
  }

  a {
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;

      &:active,
      &:hover {
        color: #42b983;
      }
    }
  }
}
</style>
