<script setup lang="js">
import axios from 'axios'

defineOptions({
  name: 'FlightsTracker',
})
// const { t } = useI18n()
const date = new Date()
const date_string = date.toString() // .replace(/T/, ':').replace(/\.\w*/, '')
const year = date.getFullYear().toString()
const month = `0${date.getMonth() + 1}`.slice(-2)
const day = `0${date.getDate().toString()}`.slice(-2)
const date_formated = `${year}-${month}-${day}`
const user = useUserStore()
user.savedKey = localStorage.getItem('access_key')
let filtered_flight = ''
if (localStorage.getItem('tracked_flights'))
  user.trackedFlights = user.trackedFlights.concat(localStorage.getItem('tracked_flights').split(',').filter(item => !user.trackedFlights.includes(item)))

const router = useRouter()
function arr_time() {
  if (filtered_flight[0].time.other.eta)
    return new Date(filtered_flight[0].time.other.eta * 1000).toLocaleString()
  else return 'Scheduled'
}
async function go() {
  user.trackedFlights.forEach(async (item) => {
    const options = {
      method: 'GET',
      url: 'https://flight-radar1.p.rapidapi.com/flights/get-more-info',
      params: {
        query: item,
        fetchBy: 'flight',
        page: '1',
        limit: '100',
      },
      headers: {
        'X-RapidAPI-Key': user.savedKey,
        'X-RapidAPI-Host': 'flight-radar1.p.rapidapi.com',
      },
    }

    try {
      // console.log(item)
      const response = await axios.request(options)
      filtered_flight = await response.data.result.response.data.filter(item => (`0${new Date((item.time.scheduled.arrival) * 1000).getDate().toString()}`).slice(-2) === day)
      // console.log(filtered_flight)
      if (filtered_flight[0]) {
        await user.listedFlights.push({
          flight: filtered_flight[0].identification.number.default,
          arr_time: arr_time(),
          // arr_time: filtered_flight[0].time.other.eta,
          status: filtered_flight[0].status.text,
        })
      }
    }
    catch (error) {
      console.error(error)
    }
  })

  // const flight = {}
  // user.trackedFlights.forEach((element) => {
  //   // send  requst to api to get respond respond_1 and  2 are examples
  // })
  // return this.respond_1.data.find(
  //   'flight_date', '2024-04-14')
}
function del(index) {
  user.trackedFlights.splice(index, 1)
  localStorage.setItem('tracked_flights', user.trackedFlights)
}
function save() {
  user.savedKey = user.inputKey
  localStorage.setItem('access_key', user.inputKey)
  user.inputKey = ''
}
function addFlight() {
  user.trackedFlights.push(user.inputFlight)
  localStorage.setItem('tracked_flights', user.trackedFlights)
  user.inputFlight = ''
}
user.listedFlights = []

function go_home() {
  router.push('/')
}
// `0${date.getDate().toString()}`.slice(-2)
// const filtered_flight = new Date(respond_1.result.response.data[1].time.scheduled.arrival * 1000).getDate()
// const filtered_flight = respond_1.result.response.data[1].time.scheduled.arrival
// const filtered_flight = '' respond_1.result.response.data.filter(item => (`0${new Date(item.time.scheduled.arrival * 1000).getDate().toString()}`).slice(-2) === day)
// const filtered_flight = respond_1.result.response.data.filter(item => console.log(Date(item.time.scheduled.arrival * 1000)))
// const test = respond_1.data.find(({ flight_date }) => flight_date === date_formated)
// arr_time: new Date(filtered_flight[0].time.estimated.arrival * 1000).toLocaleString()
// arr_time: `${new Date(filtered_flight[0].time.estimated.arrival * 1000).getHours()}:${new Date(filtered_flight[0].time.estimated.arrival * 1000).getMinutes()}`,
</script>

<template>
  <div>
    <div text-4xl>
      <div i-skill-icons:devto-dark inline-block />
    </div>
    <p />
    <!-- <h1> {{ date_string }} </h1> -->
    {{ date_formated }}
    <p> flight tracking page</p>
    <p>
      Page's under construction
      <!-- <em text-sm opacity-75>{{ t('intro.desc') }}</em> -->
    </p>
    <!-- <div py-4 /> -->
    <!-- {{ typeof day }} -->

    <div>
      <table class="m-auto max-w-5xl rounded shadow-md">
        <thead>
          <tr>
            <th class="w-1/3 border border-r-0 border-gray-300 bg-gray-100 p-4 font-normal sm:w-1/4">
              Flight
            </th>
            <th class="w-1/3 border border-r-0 border-gray-300 bg-gray-100 p-4 font-normal sm:w-1/4">
              ETA
            </th>
            <th class="w-1/3 border border-r-0 border-gray-300 bg-gray-100 p-4 font-normal sm:w-1/4">
              Status
            </th>
          </tr>
        </thead>
        <!-- use the filtered list -->
        <tbody v-for="flight in user.listedFlights" :key="flight._id">
          <tr>
            <td class="w-1/3 border border-r-0 border-gray-300 bg-white p-4 font-normal sm:w-1/4">
              {{ flight.flight }}
            </td>
            <td class="w-1/3 border border-r-0 border-gray-300 bg-white p-4 font-normal sm:w-1/4">
              {{ flight.arr_time }}
            </td>
            <td class="w-1/3 border border-r-0 border-gray-300 bg-white p-4 font-normal sm:w-1/4">
              {{ flight.status }}
            </td>
          </tr>
        </tbody>
      </table>
      <!-- {{ filtered_flight }} -->
      <button
        m-3 text-sm btn
        @click="go"
      >
        Go
      </button>
    </div>
    <div py-4 />
    <TheInput
      id="input"
      v-model="user.inputKey"
      placeholder="enter aviationStack access key "
      autocomplete="true"
      @keydown.enter="save"
    />
    <button
      m-3 text-sm btn
      @click="save"
    >
      Save
    </button>
    <p>
      <TheInput
        id="input2"
        v-model="user.inputFlight"
        placeholder=" example EK211 "
        autocomplete="true"
        @keydown.enter="addFlight"
      />
      <button
        m-3 text-sm btn
        @click="addFlight"
      >
        Add
      </button>
    </p>
    <!-- <div py-4 /> -->
    <p id="message">
      user.savedKey :  {{ user.savedKey }}
    </p>
    <p id="message">
      user.trackedFlights :
    </p>
    <button
      v-for="flight in user.trackedFlights" :key="flight._id" m-1 bg-red
      @click="del(user.trackedFlights.indexOf(flight))"
    >
      {{ flight }}
    </button>
    <div>
      <button
        m-3 text-sm btn
        @click="go_home"
      >
        Home
      </button>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
