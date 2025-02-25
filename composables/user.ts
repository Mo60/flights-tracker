import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  /**
   * Current named of the user.
   */
  const newFlight = ref({
    flight: '',
  })
  const savedListedFlights = ref([])
  const autoRefresh = ref(false)
  const trackedFlightsSet = ref([])
  const listedFlightsSet = ref([])
  const int_in_flight_api = ref([])
  const indexOfClock = ref('')
  const arrivingFlights = ref([])
  const clock_txt = ref('')
  const selectedDate = ref(new Date())
  const selectedDay = ref('')
  const showVersionMessage = ref(false)
  const message = ref('')
  const isSortedByETA = ref(false)
  const isSortedBySTA = ref(false)
  const requestSent = ref()
  const listedFlights = ref([])
  const savedKey = ref('af71d22738msh8540153c65ab160p1cce13jsn49331bf8ebf5')
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
    message,
    savedKey,
    trackedFlights,
    inputKey,
    inputFlight,
    listedFlights,
    requestSent,
    isSortedBySTA,
    isSortedByETA,
    showVersionMessage,
    selectedDate,
    selectedDay,
    clock_txt,
    arrivingFlights,
    indexOfClock,
    int_in_flight_api,
    trackedFlightsSet,
    listedFlightsSet,
    autoRefresh,
    savedListedFlights,
    newFlight,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
