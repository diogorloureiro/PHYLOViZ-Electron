<template>
    <nav class='navbar navbar-expand navbar-dark bg-dark' style='position: fixed; width: 100%; left:0; top: 0; height: 50px;'>
        <ul class='navbar-nav mr-auto'>
            <li class='nav-item'>
                <router-link tag='li' to="/">
                    <a class='navbar-brand'>PHYLOViZ</a>
                </router-link>
            </li>
        </ul>
        <div style='float:right' v-if='!this.$store.state.username'>
            <ul class='navbar-nav mr-auto'>
                <li class='nav-item'>
                    <router-link tag='li' to="/register">
                        <a class='nav-link'>Register</a>
                    </router-link>
                    <!--a class='nav-link' href='/register'>Register</a-->
                </li>
                <li class='nav-item'>
                    <router-link tag='li' to="/login">
                        <a class='nav-link'>Login</a>
                    </router-link>
                    <!--a class='nav-link' href='/login'>Login</a-->
                </li>
            </ul>
        </div>
        <div style='float:right' v-else>
            <ul class='navbar-nav mr-auto'>
                <li class='nav-item'>
                    <a class='nav-link' @click='logout'>Logout</a>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
export default {
  methods: {
    logout() {
      fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include"
      }).then(res => {
        this.$store.commit("setUsername", undefined);
        this.$store.commit("setProject", undefined);
        this.$router.push("/");
      });
    }
  }
};
</script>