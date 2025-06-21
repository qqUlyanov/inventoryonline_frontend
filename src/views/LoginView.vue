<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <h2 class="text-2xl font-bold text-center">Вход в систему</h2>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            class="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Пароль</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            class="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div v-if="errorMessage" class="text-red-500 text-sm">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-300"
        >
          Войти
        </button>
        <ul v-if="validationErrors.email" class="mt-4 text-red-500">
          <li v-for="(err, index) in validationErrors.email" :key="index">{{ err }}</li>
        </ul>
      </form>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
export default {
  data() {
    console.log('LoginView data() инициализирован')
    return {
      formData: {
        email: '',
        password: '',
      },
      validationErrors: {},
    }
  },
  mounted() {
    console.log('LoginView mounted')
  },
  methods: {
    submitForm() {
      console.log('CSRF cookie URL:', 'https://api.inventoryonline.ru/sanctum/csrf-cookie')
      this.$axios
        .get('https://api.inventoryonline.ru/sanctum/csrf-cookie')
        .then(() => {
          const token = Cookies.get('XSRF-TOKEN')
          console.log('Login URL:', 'https://api.inventoryonline.ru/login')
          this.$axios
            .post(
              'https://api.inventoryonline.ru/login',
              {
                email: this.formData.email,
                password: this.formData.password,
              },
              {
                headers: {
                  'X-XSRF-TOKEN': decodeURIComponent(token),
                },
              },
            )
            .then((response) => {
              localStorage.setItem('sanctum_token', response.data.token)
              this.$router.push('/')
            })
            .catch((error) => {
              this.validationErrors = error.response.data.errors
              console.log(error)
            })
        })
        .catch((error) => {
          console.log(error)
        })
    },
  },
}
</script>
