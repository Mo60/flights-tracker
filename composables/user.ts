import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  /**
   * Current named of the user.
   */
  const isSortedBySTA = ref(false)
  const requestSent = ref()
  const listedFlights = ref([])
  const savedKey = ref('')
  const inputKey = ref('')
  const inputFlight = ref('')
  const trackedFlights = ref([])
  const savedName = ref('')
  const previousNames = ref(new Set<string>())

  const usedNames = computed(() => Array.from(previousNames.value))
  const otherNames = computed(() => usedNames.value.filter(name => name !== savedName.value))

  /**
   * Changes the current name of the user and saves the one that was used
   * before.
   *
   * @param name - new name to set
   */
  function setNewName(name: string) {
    if (savedName.value)
      previousNames.value.add(savedName.value)

    savedName.value = name
  }

  return {
    setNewName,
    otherNames,
    savedName,
    savedKey,
    trackedFlights,
    inputKey,
    inputFlight,
    listedFlights,
    requestSent,
    isSortedBySTA,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
