<script setup lang="js">
import axios from 'axios'

defineOptions({
  name: 'FlightsTracker',
})
// const { t } = useI18n()
// let message =  JSON.parse(localStorage.getItem("listed_flights"))[0]
let today_date = new Date()
// const date_string = date.toString() // .replace(/T/, ':').replace(/\.\w*/, '')
const year = today_date.getFullYear().toString()
const month = `0${today_date.getMonth() + 1}`.slice(-2)
const day = `0${today_date.getDate().toString()}`.slice(-2)
const day_number = today_date.getDate()
const date_formated = `${year}-${month}-${day}`
const user = useUserStore()
user.selectedDate = new Date(year, month - 1, day_number)
user.savedKey = localStorage.getItem('access_key')

let filtered_flight = []
// console.log(localStorage.getItem('tracked_flights'))
if (localStorage.getItem('tracked_flights'))
  user.trackedFlights = user.trackedFlights.concat(localStorage.getItem('tracked_flights').split(',').filter(item => !user.trackedFlights.includes(item)))
if (localStorage.getItem('listed_flights')) {
  JSON.parse(localStorage.getItem('listed_flights')).forEach((item) => {
    user.listedFlights.push(item)
  })
  user.message = localStorage.getItem('last_updated')
}
// if (localStorage.getItem('listed_flights'))
// user.listedFlights = JSON.parse( localStorage.getItem('listed_flights'))
const router = useRouter()

function change_tracked_list(newList) {
  user.trackedFlights = []
  user.trackedFlights = ['clock'].concat(newList)
  localStorage.setItem('tracked_flights', user.trackedFlights)
}

async function get_all_arriving_flights() {
  // https://flightradar243.p.rapidapi.com/v1/airports/arrivals?code=IAH&limit=100&page=1
  let page = {
    current: 1,
    total: 11,
  }
  const flight_arriving_raw_inter = []
  let response = [{}]
  let flight_arriving_raw = []
  user.listedFlights = [{ flight: 'Clock: ', eta_unix: Math.round(today_date.getTime() / 1000), sta_unix: Math.round(today_date.getTime() / 1000), status: user.clock_txt,
  }]
  for (let i = page.current; i <= page.total; i++) {
    // console.log(i)
    const options = {
      method: 'GET',
      url: 'https://flightradar243.p.rapidapi.com/v1/airports/arrivals?',
      params: {
        code: 'IAH',
        limit: '100',
        page: i,

      },
      headers: {
        'X-RapidAPI-Key': user.savedKey,
        'X-RapidAPI-Host': 'flightradar243.p.rapidapi.com',
      },
    }
    response = await axios.request(options)
    page = response.data.data.airport.pluginData.schedule.arrivals.page
    flight_arriving_raw = flight_arriving_raw.concat(response.data.data.airport.pluginData.schedule.arrivals.data)
  }
  // console.log(flight_arriving_raw[900].flight.airport.origin.position.country.code)

  // ** remove non international flights

  flight_arriving_raw = flight_arriving_raw.filter(item => !(item.flight.airport.origin.position.country.code === 'US' || item.flight.airport.origin.position.country.code === 'CA')
  && ((new Date((item.flight.time.scheduled.arrival) * 1000).getDate()) === user.selectedDate.getDate()))

  flight_arriving_raw.sort((a, b) => {
    if (a.flight.time.scheduled.arrival < b.flight.time.scheduled.arrival)
      return -1

    if (a.flight.time.scheduled.arrival > b.flight.time.scheduled.arrival)
      return 1
  })

  // console.log(flight_arriving_raw)

  flight_arriving_raw.forEach((element) => {
    user.int_in_flight_api.push(element.flight.identification.number.default)
    user.listedFlights.push({
      airport_iata: element.flight.airport.origin.code.iata,
      flight: element.flight.identification.number.default,
      arr_time: arr_time2(element),
      status: element.flight.status.text,
      sta: STA_time2(element),
      sta_unix: element.flight.time.scheduled.arrival,
      eta_unix: arr_time_unix2(element),
      aircraft: element.flight.aircraft.model.text,
    })
  })

  // // .then(console.log(response))
  // console.log(response)
  // console.log(response.data.data.airport.pluginData.schedule.arrivals)
}

function arr_time_unix() {
  if (filtered_flight[0].time.other.eta)
    return filtered_flight[0].time.other.eta
  else return filtered_flight[0].time.scheduled.arrival
}

function arr_time_unix2(flight) {
  if (flight.flight.time.other.eta)
    return flight.flight.time.other.eta
  else return flight.flight.time.scheduled.arrival
}

function arr_time() {
  if (filtered_flight[0].time.other.eta)
    return new Date(filtered_flight[0].time.other.eta * 1000).toLocaleTimeString()
  else return new Date(filtered_flight[0].time.scheduled.arrival * 1000).toLocaleTimeString()
}
function arr_time2(flight) {
  if (flight.flight.time.other.eta)
    return new Date(flight.flight.time.other.eta * 1000).toLocaleTimeString()
  else return new Date(flight.flight.time.scheduled.arrival * 1000).toLocaleTimeString()
}

function STA_time() {
  return new Date(filtered_flight[0].time.scheduled.arrival * 1000).toLocaleTimeString()
}
function STA_time2(flight) {
  return new Date(flight.flight.time.scheduled.arrival * 1000).toLocaleTimeString()
}

async function go() {
  user.isSortedBySTA = false
  user.isSortedByETA = false
  user.listedFlights = []
  user.message = `last updated: ${today_date.toLocaleString()}`
  localStorage.setItem('last_updated', user.message)
  // console.log(user.message)
  for (let i = 0; i < user.trackedFlights.length; i++) {
    if (user.trackedFlights[i].toLowerCase() === 'clock') {
      user.listedFlights.push({ flight: 'Clock: ', eta_unix: Math.round(today_date.getTime() / 1000), sta_unix: Math.round(today_date.getTime() / 1000), status: user.clock_txt,
      })
      user.indexOfClock = i
      continue
    }

    const options = {
      method: 'GET',
      url: 'https://flight-radar1.p.rapidapi.com/flights/get-more-info',
      params: {
        query: user.trackedFlights[i],
        fetchBy: 'flight',
        page: '1',
        limit: '100',
      },
      headers: {
        'X-RapidAPI-Key': user.savedKey,
        'X-RapidAPI-Host': 'flight-radar1.p.rapidapi.com',
      },
    }
    const response = await axios.request(options)
    if (response.data.result.response.data) {
      filtered_flight = await response.data.result.response.data.filter(item => (new Date((item.time.scheduled.arrival) * 1000).getDate()) === user.selectedDate.getDate())
      console.log(filtered_flight)
      user.listedFlights.push({
        airport_iata: filtered_flight[0].airport.origin.code.iata,
        flight: filtered_flight[0].identification.number.default,
        arr_time: arr_time(),
        // arr_time: filtered_flight[0].time.other.eta,
        status: filtered_flight[0].status.text,
        sta: STA_time(),
        sta_unix: filtered_flight[0].time.scheduled.arrival,
        eta_unix: arr_time_unix(),
        aircraft: filtered_flight[0].aircraft.model.text,
      })
    }
    else {
      user.listedFlights.push({ flight: user.trackedFlights[i].toLowerCase(), sta_unix: 0, eta_unix: 0 })
    }

    // console.log(i)
  }

  // setTimeout(go, 1000)

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
  if (confirm(`Change API Key to: " ${user.inputKey} " ?`)) {
    user.savedKey = user.inputKey
    localStorage.setItem('access_key', user.inputKey)
    user.inputKey = ''
  }
}

function save_key(new_api_key) {
  if (!new_api_key)
    new_key = user.inputKey
  if (confirm(`Change API Key to: " ${new_api_key} " ?`)) {
    user.savedKey = new_api_key
    localStorage.setItem('access_key', new_api_key)
    user.inputKey = ''
  }
}

function addFlight() {
  if (user.inputFlight.length > 2) {
    user.trackedFlights.push(user.inputFlight)
    localStorage.setItem('tracked_flights', (user.trackedFlights))
    user.inputFlight = ''
  }
}
function sortBySTA() {
  // console.log('sortBYSTA pressed')
  if (!user.isSortedBySTA) {
    // eslint-disable-next-line array-callback-return
    user.listedFlights.sort((a, b) => {
      if (a.sta_unix < b.sta_unix)
        return -1

      if (a.sta_unix > b.sta_unix)
        return 1
    })
  }
  else {
    user.listedFlights.sort().reverse()
  }
  user.isSortedBySTA = !user.isSortedBySTA
  user.isSortedByETA = false
}
function sortByETA() {
  // console.log('sortBYSTA pressed')
  if (!user.isSortedByETA) {
    // eslint-disable-next-line array-callback-return
    user.listedFlights.sort((a, b) => {
      if (a.eta_unix < b.eta_unix)
        return -1

      if (a.eta_unix > b.eta_unix)
        return 1
    })
  }
  else {
    user.listedFlights.sort().reverse()
  }
  user.isSortedByETA = !user.isSortedByETA
  user.isSortedBySTA = false
}

function autoRefresh() {
  if (user.autoRefresh) {
    go()
    console.log('refresh')
    setTimeout(autoRefresh, 10)
  }
  else {
    console.log('stop auto refresh')
  }
}

function setAutoRefresh() {
  // if (user.autoRefresh)
  //   user.autoRefresh = ref(false)
  // if (!user.autoRefresh) {
  //   user.autoRefresh = ref(true)
  //   autoRefresh()
  // }
}

function showVersionMessage() {
  user.showVersionMessage = !user.showVersionMessage
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

function startTime() {
  today_date = new Date()
  // console.log(today_date.getTime())
  const h = today_date.getHours()
  let m = today_date.getMinutes()
  let s = today_date.getSeconds()
  m = checkTime(m)
  s = checkTime(s)
  user.clock_txt = `${h}:${m}:${s}`
  user.listedFlights.forEach((item, index) => {
    // console.log(item.flight)
    if (item.flight === 'Clock: ')
    // user.listedFlights[index].status = user.clock_txt
    // = { flight: 'Clock: ', eta_unix: today_date.getTime() / 1000, sta_unix: today_date.getTime() / 1000, status: user.clock_txt }

      user.listedFlights[index] = { flight: 'Clock: ', eta_unix: Math.round(today_date.getTime() / 1000), sta_unix: Math.round(today_date.getTime() / 1000), status: user.clock_txt }
  })

  // user.listedFlights[user.indexOfClock] =
  setTimeout(startTime, 1000)
  // { flight: 'Clock: ', eta_unix: today_date.getTime() / 1000, sta_unix: today_date.getTime() / 1000, status: user.clock_txt,}
}

function checkTime(i) {
  if (i < 10)
    i = `0${i}` // add zero in front of numbers < 10
  return i
}

function etaTxtClass(flight) {
  if (flight.eta_unix - flight.sta_unix > 3600) // 1 hour
    return 'color-red-6'
  if (flight.eta_unix - flight.sta_unix > 1800) // 1/2
    return 'color-red-4'
  if ((flight.eta_unix - flight.sta_unix > 900)) // 15 min
    return 'color-orange'

  if ((flight.eta_unix - flight.sta_unix < -600)) // -10 min
    return 'color-green-7'

  if ((flight.eta_unix - flight.sta_unix > 600)) // 10 min
    return ''
}

startTime()
</script>

<template>
  <div>
    <div>
      <!-- text-4xl -->
      <!-- <div i-skill-icons:devto-dark inline-block /> -->
    </div>
    <p>
      <!-- <h1> {{ date_string }} </h1> -->
      <!-- listed flight length : {{ user.listedFlights.length }} -->
    </p>
    <p>
      <!-- i = {{ user.requestSent }} -->
    </p>
    <p>
      <!-- {{ day_number }} -->
    </p>
    <!-- {{ user.selectedDate }} -->
    <!-- <p> flight tracking page</p> -->
    <p>
      Page's under construction
      <!-- <em text-sm opacity-75>{{ t('intro.desc') }}</em> -->
    </p>
    <div py-4 />
    <p cursor-pointer text-blue @click="showVersionMessage">
      v 0.1.10.2
    </p>
    <div
      v-show="user.showVersionMessage" color-black style="transition: width 4s;"
      class="bg-yellow-100 p-4 m-auto w-3/4"
    >
      <p />
      <p> v 0.1.10.2 </p>
      <p> &nearr;  fixed track generated flights </p>
      <p> v 0.1.10.1 </p>
      <p> &nearr; track generated flights </p>
      <p> v 0.1.10 </p>
      <p> &nearr; Can add clock in list </p>
      <p> &nearr; if flight not found the flight number will stay in table </p>
      <p> &nearr; experimental: check all arriving international flights  </p>
      <!-- <p> v 0.1.9 </p>
      <p> &nearr; highlight flights arr next hour </p>
      <p> &nearr; color coded ETA </p>
      <p> &nearr; confirm before changing Key </p>
      <p> &nearr; Added Clock </p>
      <p> &nearr; Fixed last updated message doesn't change </p>
      <p> v 0.1.8 </p>
      <p> &nearr; Fixed sort by ETA </p>
      <p> &nearr; Fixed message font color </p> -->
      <!-- <p> v 0.1.7 </p>
      <p> &nearr; Added select date option </p> -->
      <!-- <p> v 0.1.6</p>
      <p> &nearr; Added sort by ETA functionality </p>
      <p> &nearr; Changed table format </p>
      <p> &nearr; Removed some messages </p> -->
    </div>
    <div py-4 />
    <!-- {{ typeof day }} -->

    <div>
      <table class=" m-auto">
        <!-- m-auto  rounded shadow-md"> -->
        <thead>
          <tr>
            <th class="border bg-gray">
              <p i-carbon-departure />
            </th>
            <th class="border border-gray-300 bg-gray">
              <!-- w-1/3 border border-r-0 border-gray-300 bg-gray p-4 font-normal sm:w-1/4"> -->
              Flight
            </th>
            <th class="border bg-gray " @click="sortBySTA">
              STA
              <p v-if="user.isSortedBySTA" btn i-carbon-arrow-down />
              <p v-else btn i-carbon-dot-mark />
            </th>
            <th class="border bg-gray " @click="sortByETA">
              ETA
              <p v-if="user.isSortedByETA" btn i-carbon-arrow-down />
              <p v-else btn i-carbon-dot-mark />
            </th>
            <th class="border bg-gray">
              Status
            </th>
            <th v-show="true" class="border bg-gray">
              Aircraft
            </th>
          </tr>
        </thead>
        <!-- use the filtered list -->
        <tbody v-for="flight in user.listedFlights" :key="flight._id">
          <tr :class="[{ ['bg-yellow-7']: Math.abs(flight.eta_unix - today_date.getTime() / 1000) < 3600.000 }]">
            <td class="border">
              {{ flight.airport_iata }}
            </td>
            <td class="border">
              <!-- w-1/3 border border-r-0 border-gray-300  p-4 font-normal sm:w-1/4 -->
              {{ flight.flight }}
            </td>
            <td class="border">
              {{ flight.sta }}
            </td>
            <td :class="etaTxtClass(flight)" class="border">
              {{ flight.arr_time }}
            </td>
            <td class="border">
              {{ flight.status }}
            </td>
            <td class="border ">
              {{ flight.aircraft }}
            </td>
            <!-- <td class="border ">
              {{ flight.eta_unix }}
            </td> -->
          </tr>
        </tbody>
      </table>
      <div py-4 />
      <p text-4xl>
        Clock: {{ user.clock_txt }}
      </p>
      <div py-4 />
      <!-- {{ user.listedFlights }} -->
      <!-- {{ filtered_flight }} -->
      {{ user.message }}
      <p>
        <select v-model="user.selectedDate">
          <option disabled="">
            Choose Date
          </option>
          <option :value="new Date(year, month - 1, day_number - 3)">
            {{ new Date(year, month - 1, day_number
              - 3).toLocaleDateString() }}
          </option>
          <option :value="new Date(year, month - 1, day_number - 2)">
            {{ new Date(year, month - 1, day_number
              - 2).toLocaleDateString() }}
          </option>
          <option :value="new Date(year, month - 1, day_number - 1)">
            {{ new Date(year, month - 1, day_number
              - 1).toLocaleDateString() }}
          </option>
          <option :value="new Date(year, month - 1, day_number)">
            Today
          </option>
          <option :value="new Date(year, month - 1, day_number + 1)">
            {{ new Date(year, month - 1, day_number
              + 1).toLocaleDateString() }}
          </option>
          <option :value="new Date(year, month - 1, day_number + 2)">
            {{ new Date(year, month - 1, day_number
              + 2).toLocaleDateString() }}
          </option>
          <option :value="new Date(year, month - 1, day_number + 3)">
            {{ new Date(year, month - 1, day_number
              + 3).toLocaleDateString() }}
          </option>
        </select>

        <button m-3 text-sm btn @click="useTimeout(go, 1000)">
          Go
        </button>
      </p>
    </div>
    <div py-4 />
    <p> Add flight to check status: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p>
    <p>
      <input
        id="input2" v-model="user.inputFlight" placeholder=" example EK211 " autocomplete="true" type="text"
        v-bind="$attrs" p="x-4 y-2" w="250px" text="center" bg="transparent" border="~ rounded gray-200 dark:gray-700"
        outline="none active:none" @keydown.enter="addFlight"
      >
      <button m-3 text-sm btn @click="addFlight">
        Add
      </button>
    </p>
    <p>
      <input
        id="input" v-model="user.inputKey" placeholder="enter X-RapidAPI-Key" autocomplete="true" type="text"
        v-bind="$attrs" p="x-4 y-2" w="250px" text="center" bg="transparent" border="~ rounded gray-200 dark:gray-700"
        outline="none active:none" @keydown.enter="save"
      >
      <button m-3 text-sm btn @click="save">
        Save
      </button>
      <!-- <button
        m-3 text-sm btn
        @click="test"
      >
        Test
      </button> -->
    </p>

    <button m-3 text-sm btn bg-red @click="get_all_arriving_flights">
      get all arriving flights (experimental)
    </button>
    <!-- <div py-4 /> -->
    <p id="message">
      user.savedKey : {{ user.savedKey }}
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
      <div>
        <!-- {{ user.int_in_flight_api }} -->
      </div>
      <button m-3 text-sm btn bg-red @click="change_tracked_list(user.int_in_flight_api)">
        track generated flights (experimental)
      </button>
    </div>
    <div>
      <button m-3 text-sm btn bg-red @click="setAutoRefresh">
        set auto refresh (experimental)
      </button>
      {{ user.autoRefresh }}
    </div>
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

<style>
select {
  /* display: block; */
  /* width: 100%; */
  padding: 0.375rem 2.25rem 0.375rem 0.75rem;
  -moz-padding-start: calc(0.75rem - 3px);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  word-wrap: normal;
  margin-bottom: 0;
  word-wrap: normal;
}
</style>
