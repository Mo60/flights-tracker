<script setup lang="js">
import axios from 'axios'

defineOptions({
  name: 'FlightsTracker',
})
// const { t } = useI18n()
// let message =  JSON.parse(localStorage.getItem("listed_flights"))[0]
const date = new Date()
// const date_string = date.toString() // .replace(/T/, ':').replace(/\.\w*/, '')
const year = date.getFullYear().toString()
const month = `0${date.getMonth() + 1}`.slice(-2)
const day = `0${date.getDate().toString()}`.slice(-2)
const date_formated = `${year}-${month}-${day}`
const user = useUserStore()
user.savedKey = localStorage.getItem('access_key')
let filtered_flight = []
// console.log(localStorage.getItem('tracked_flights'))
if (localStorage.getItem('tracked_flights'))
  user.trackedFlights = user.trackedFlights.concat(localStorage.getItem('tracked_flights').split(',').filter(item => !user.trackedFlights.includes(item)))
if (localStorage.getItem('listed_flights')) {
  JSON.parse(localStorage.getItem('listed_flights')).forEach((item) => {
    user.listedFlights.push(item)
  })
  user.savedName = localStorage.getItem('last_updated')
}
// if (localStorage.getItem('listed_flights'))
// user.listedFlights = JSON.parse( localStorage.getItem('listed_flights'))
const router = useRouter()
function arr_time() {
  if (filtered_flight[0].time.other.eta)
    return new Date(filtered_flight[0].time.other.eta * 1000).toLocaleTimeString()
  else return new Date(filtered_flight[0].time.scheduled.arrival * 1000).toLocaleTimeString()
}
function STA_time () {
  return new Date(filtered_flight[0].time.scheduled.arrival * 1000).toLocaleString();
}
async function go() {
  user.isSortedBySTA = false
  user.listedFlights = []
  user.savedName = `last updated :${date.toLocaleString()}`
  localStorage.setItem('last_updated', user.savedName)
    user.trackedFlights.forEach(async (item) => {
    const options = {
      method: 'GET',
      url: 'https://flight-radar1.p.rapidapi.com/flights/get-more-info',
      params: {
        query:  item,
        fetchBy: 'flight',
        page: '1',
        limit: '100',
      },
      headers: {
        'X-RapidAPI-Key': user.savedKey,
        'X-RapidAPI-Host': 'flight-radar1.p.rapidapi.com',
      },
    }
    // console.log(user.trackedFlights.indexOf(item))
    await new Promise( ()=> setTimeout(async () => {
      // console.log("wait "+ user.trackedFlights.indexOf(item) +" sec")
    try {
      user.requestSent = 0
      // console.log(item)
      const response = await axios.request(options).then(console.log(item))
      filtered_flight = await response.data.result.response.data.filter(item => (`0${new Date((item.time.scheduled.arrival) * 1000).getDate().toString()}`).slice(-2) === day)
      // console.log(filtered_flight)
      if (filtered_flight[0]) {
        await new Promise( async () => { user.listedFlights.push({
          flight: filtered_flight[0].identification.number.default,
          arr_time:  arr_time(),
          // arr_time: filtered_flight[0].time.other.eta,
          status: filtered_flight[0].status.text,
          sta:  STA_time(),
          sta_unix: filtered_flight[0].time.scheduled.arrival,
          aircraft: filtered_flight[0].aircraft.model.text,
        })
        // console.log(filtered_flight)
        localStorage.setItem('listed_flights', JSON.stringify(user.listedFlights))
        user.requestSent++
        // await new Promise( setTimeout(() => {console.log("wait 2 sec")}, 2000))
        })
        
      }
      // if (user.requestSent == 5 || user.requestSent == 10) {
      //     //wait 2 sec
      //    await new Promise( setTimeout(() => {console.log("wait 1 sec")}, 1000))
      //    await new Promise( setTimeout(() => {console.log("wait 1 sec")}, 1000))
      //   }  
    }
    catch (error) {
      console.error(error)
    }

    }, user.trackedFlights.indexOf(item) * 1000))
    
  })

  // message = ''
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
  if (user.inputFlight.length > 3) {
  user.trackedFlights.push(user.inputFlight)
  localStorage.setItem('tracked_flights', (user.trackedFlights))
  user.inputFlight = ''
  }
}
function sortBySTA() {
  // console.log('sortBYSTA pressed')
      if (!user.isSortedBySTA) {
        user.listedFlights.sort((a, b) => {
          if (a.sta_unix < b.sta_unix) {
            return -1;
          }
          if (a.sta_unix > b.sta_unix) {
            return 1;
          }
        })
      } else {
        user.listedFlights.sort().reverse();
      }
      user.isSortedBySTA = !user.isSortedBySTA
    }
    
// user.listedFlights = []

// function go_home() {
//   router.push('/')
// }
// function test() {
//   message = user.listedFlights
//   console.log(message)
// }
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
    <p>
    <!-- <h1> {{ date_string }} </h1> -->
    listed flight length : {{ user.listedFlights.length }}
    </p>
    <p>
    i = {{ user.requestSent }}
    </p>
    <p>
    {{ date_formated }}
  </p>
    <p> flight tracking page</p>
    <p>
      Page's under construction
      <!-- <em text-sm opacity-75>{{ t('intro.desc') }}</em> -->
    </p>
    <!-- <div py-4 /> -->
    <!-- {{ typeof day }} -->

    <div >
      <table class="m-auto  rounded shadow-md">
        <thead>
          <tr>
            <th class="w-1/3 border border-r-0 border-gray-300 bg-gray p-4 font-normal sm:w-1/4">
              Flight
            </th>
            <th  @click="sortBySTA"  class="w-1/3 border border-r-0 border-gray-300 bg-gray p-4 font-normal sm:w-1/4">
              STA <p btn i-carbon-arrow-down v-if="user.isSortedBySTA"/><p  btn i-carbon-dot-mark v-else/>
            </th>         
            <th class="w-1/3 border border-r-0 border-gray-300 bg-gray p-4 font-normal sm:w-1/4">
              ETA
            </th>
            <th class="w-1/3 border border-r-0 border-gray-300 bg-gray p-4 font-normal sm:w-1/4">
              Status
            </th>
            <th class="w-1/3 border border-r-0 border-gray-300 bg-gray p-4 font-normal sm:w-1/4">
              Aircraft
            </th>
          </tr>
        </thead>
        <!-- use the filtered list -->
        <tbody v-for="flight in user.listedFlights" :key="flight._id">
          <tr>
            <td class="w-1/3 border border-r-0 border-gray-300  p-4 font-normal sm:w-1/4">
              {{ flight.flight }}
            </td>
            <td class="w-1/3 border border-r-0 border-gray-300  p-4 font-normal sm:w-1/4">
              {{ flight.sta }}
            </td>
            <td class="w-1/3 border border-r-0 border-gray-300  p-4 font-normal sm:w-1/4">
              {{ flight.arr_time }}
            </td>
            <td class="w-1/3 border border-r-0 border-gray-300  p-4 font-normal sm:w-1/4">
              {{ flight.status }}
            </td>
            <td class="w-1/3 border border-r-0 border-gray-300  p-4 font-normal sm:w-1/4">
              {{ flight.aircraft }}
            </td>
          </tr>
        </tbody>
      </table>
      <!-- {{ user.listedFlights }} -->
      <!-- {{ filtered_flight }} -->
      {{ user.savedName }}
      <button
        m-3 text-sm btn
        @click="go"
      >
        Go
      </button>
    </div>
    <div py-4 />

    <p>
      Add flight to check status
      <input
        id="input2"
        v-model="user.inputFlight"
        placeholder=" example EK211 "
        autocomplete="true"
        type="text"
        v-bind="$attrs"
        p="x-4 y-2"
        w="250px"
        text="center"
        bg="transparent"
        border="~ rounded gray-200 dark:gray-700"
        outline="none active:none"
        @keydown.enter="addFlight"
      />
      <button
        m-3 text-sm btn
        @click="addFlight"
      >
        Add
      </button>
    </p>
    <p>
      <input
        id="input"
        v-model="user.inputKey"
        placeholder="enter X-RapidAPI-Key"
        autocomplete="true"
        type="text"
        v-bind="$attrs"
        p="x-4 y-2"
        w="250px"
        text="center"
        bg="transparent"
        border="~ rounded gray-200 dark:gray-700"
        outline="none active:none"
        @keydown.enter="save"
      />
      <button
        m-3 text-sm btn
        @click="save"
      >
        Save
      </button>
      <!-- <button
        m-3 text-sm btn
        @click="test"
      >
        Test
      </button> -->
    </p>
    <!-- <div py-4 /> -->
    <p id="message">
      user.savedKey :  {{ user.savedKey }}
    </p>
    <p id="message">
      user.trackedFlights : click to delete
    </p>
    <button
      v-for="flight in user.trackedFlights" :key="flight._id" m-1 bg-red
      @click="del(user.trackedFlights.indexOf(flight))"
    >
      {{ flight }}
    </button>
    <div>
      <!-- <button
        m-3 text-sm btn
        @click="go_home"
      >
        Home
      </button> -->
    </div>
  </div>
</template>
