<script setup lang="ts">
defineOptions({
  name: 'IndexPage',
})
// const user = useUserStore()
// const name = ref(user.savedName)

const router = useRouter()
// function go() {
//   if (name.value)
//     router.push(`/hi/${encodeURIComponent(name.value)}`)
// }
function go_to_flight_tracker() {
  router.push('/flightTracker')
}

// const { t } = useI18n()
</script>

<template>
  <div>
    <div text-4xl>
      <div i-skill-icons:devto-dark inline-block />
    </div>
    <!-- <p>
      <a rel="noreferrer" href="https://github.com/Mo60" target="_blank">
        <h1 text-4xl>Mo Khalil</h1>
      </a>
    </p> -->
    <h1 text-4xl>
      Mo Khalil
    </h1>
    <p>
      Page's under construction
      <!-- <em text-sm opacity-75>{{ t('intro.desc') }}</em> -->
    </p>
    <div>
      <button
        m-3 text-sm btn
        @click="go_to_flight_tracker"
      >
        Flights Tracker
      </button>
    </div>
    <div py-4 />

    <div py-4 />
    <dic>
      <a m-3 text-sm btn href="https://main--cool-churros-29a255.netlify.app/"> Go to netlify App</a>
    </dic>
    <div>
      <a m-3 text-sm btn href="https://mo60.github.io/School_MS-frontend/"> Go to vite project example</a>
    </div>
    <!-- <TheInput
      v-model="name"
      :placeholder="t('intro.whats-your-name')"
      autocomplete="false"
      @keydown.enter="go"
    /> -->
    <!-- <label class="hidden" for="input">{{ t('intro.whats-your-name') }}</label> -->

    <!-- <div>
      <button
        m-3 text-sm btn
        :disabled="!name"
        @click="go"
      >
        {{ t('button.go') }}
      </button>
    </div> -->
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
