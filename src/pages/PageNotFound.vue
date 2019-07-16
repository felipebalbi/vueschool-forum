<template>
<div class="col-full">
  <h1>Not Found</h1>
  
  <p>
    Oops, we couldn't find what you are looking for. Why don't you
    <router-link :to="{name: 'Home'}">
      go Home instead
    </router-link>
  </p>
</div>
</template>

<script>
  export default {}
</script>

<style scoped>
  h1 {
      font-size: 100px;
  }

  p {
      font-size: 50px;
      font-weight: 100;
  }

  div {
      text-align: center;
  }
</style>

