<script setup lang="js">
import axios from 'axios'

defineOptions({
  name: 'FlightsTracker',
})
// const { t } = useI18n()
// let message =  JSON.parse(localStorage.getItem("listed_flights"))[0]
const clientXS = 0
const clientXE = 0
const changeX = 0
const fl = ''
// const server = 'http://localhost:3001'
const server = '/aeroapi'
let today_date = new Date()
// const date_string = date.toString() // .replace(/T/, ':').replace(/\.\w*/, '')
const year = today_date.getFullYear().toString()
const month = `0${today_date.getMonth() + 1}`.slice(-2)
const day = `0${today_date.getDate().toString()}`.slice(-2)
const day_number = today_date.getDate()
const date_formated = `${year}-${month}-${day}`
const user = useUserStore()
user.selectedDate = new Date(year, month - 1, day_number)

if (localStorage.getItem('airport_icao'))
  user.airport_icao = localStorage.getItem('airport_icao')

if (localStorage.getItem('access_key'))
  user.savedKey = localStorage.getItem('access_key')

let filtered_flight = []
// console.log(localStorage.getItem('tracked_flights'))
if (localStorage.getItem('tracked_flights'))
  user.trackedFlights = user.trackedFlights.concat(localStorage.getItem('tracked_flights').split(',').filter(item => !user.trackedFlights.includes(item)))
if (localStorage.getItem('listed_flights')) {
  user.listedFlights = []
  JSON.parse(localStorage.getItem('listed_flights')).forEach((item) => {
    user.listedFlights.push(item)
  })
  user.message = localStorage.getItem('last_updated')
}
if (localStorage.getItem('saved_listed_flights')) {
  user.savedListedFlights = []
  JSON.parse(localStorage.getItem('saved_listed_flights')).forEach((item) => {
    user.savedListedFlights.push(item)
  })
}
// if (localStorage.getItem('listed_flights'))
//   user.listedFlights = JSON.parse(localStorage.getItem('listed_flights'))
const router = useRouter()

// function touchStart(e, fl) {
//   clientXS = e.changedTouches[0].clientX
//   // console.log(e.changedTouches[0].clientX)
//   console.log(fl.flight)
//   user.message = fl.flight
// }

// function touchEnd(e, fl) {
//   clientXE = e.changedTouches[0].clientX
//   changeX = clientXE - clientXS
//   this.fl = fl.flight
//   console.log(clientXS)
//   console.log(clientXE)
//   console.log(changeX)
//   console.log(fl.flight)
//   console.log(this.fl)
//   user.message = user.message.concat(['', clientXS, clientXE, changeX, fl.flight, this.fl])
// }

// ----------------------------------
async function test() {

}
async function filterFlights(flights) {
  // console.log(flights[0].origin.code_icao[0])
  return await flights.filter(item => !(item.origin.code_icao[0] === 'K' || item.origin.code_icao[0] === 'C'))
  // || item.flight.airport.origin.position.country.code === 'CA')
}

async function getNextPageAeroApi(url, response, params, i, endpiont, l) {
  if (i < 100 && response.links) {
    console.log(`get page ${i}`)
    console.log('wait 7 seconds')
    user.message = `get page ${i} in ${endpiont}`
    i++
    setTimeout(async () => {
      url = `/aeroapi${response.links.next}`
      // console.log(url)
      // response = await axios.get(server + url)
      response = await $fetch(server, { params: { url } })
      pushFlightsFromAeroApi(response[endpiont])
      await getNextPageAeroApi (url, response, params, i, endpiont, l)
    }, 7000)
  }
  else if (l === 0) { useTimeout(await aeroApiScheduled('arrivals', 1), 7000) }
  else { user.message = 'Done Done!!' }
}
async function pushFlightsFromAeroApi(results) {
  const flights = await filterFlights(results)
  // const flights = await results
  flights.forEach((element) => {
    // console.log(element)
    user.int_in_flight_api.push(element.ident_iata)
    user.listedFlights.push({
      airport_iata: element.origin.code_iata,
      flight: element.ident_iata ?? element.registration,
      arr_time: new Date(element.estimated_on).toTimeString().split(' ')[0].slice(0, 5),
      status: element.status,
      sta: new Date(element.scheduled_on).toTimeString().split(' ')[0].slice(0, 5),
      sta_unix: new Date(element.scheduled_on).getTime() / 1000,
      eta_unix: new Date(element.estimated_on).getTime() / 1000,
      aircraft: element.gate_destination || '',
      airport_text: element.origin.name,
      airline_name: element.operator ?? '__',
      airport_city: element.origin.city || '',
      scheduled_in: new Date(element.scheduled_in).toTimeString().split(' ')[0].slice(0, 5),
      estimated_in: new Date(element.estimated_in).toTimeString().split(' ')[0].slice(0, 5),
      ...(element.actual_in && { actual_in: new Date(element.actual_in).toTimeString().split(' ')[0].slice(0, 5) }),
      scheduled_in_unix: new Date(element.scheduled_in).getTime() / 1000,
      estimated_in_unix: new Date(element.estimated_in).getTime() / 1000,
      ...(element.actual_in && { actual_in_unix: new Date(element.actual_in).getTime() / 1000 }),
    })
  })
  localStorage.setItem('listed_flights', JSON.stringify(user.listedFlights))
}

async function aeroApiScheduled(endpiont, l) {
  user.isSortedBySTA = false
  user.isSortedByETA = false
  user.isSortedByActualIn = false
  user.message = `getting ${endpiont} ....`
  const airport_icao = user.airport_icao || 'KIAH'
  const url = `/aeroapi/airports/${airport_icao}/flights/${endpiont}`
  const params = {
    start: new Date(user.selectedDate.getFullYear(), user.selectedDate.getMonth(), user.selectedDate.getDate(), 11, 0).toISOString(),
    end: new Date(user.selectedDate.getFullYear(), user.selectedDate.getMonth(), user.selectedDate.getDate(), 22, 0).toISOString(),
    max_pages: '1',
    url,
  }
  try {
    // const response = await axios.get(server + url, { params })
    const response = await $fetch(server, { method: 'GET', params })
    // console.log(response)
    // console.log(response.data.scheduled_arrivals[0].estimated_on.split('T')[1])
    // console.log(response.data.scheduled_arrivals.length)
    if (l === 0) {
      user.listedFlights = [{
        flight: 'Clock: ',
        eta_unix: Math.round(today_date.getTime() / 1000),
        sta_unix: Math.round(today_date.getTime() / 1000),
        status: user.clock_txt,
      }]
    }

    // console.log(response)

    await pushFlightsFromAeroApi(response[endpiont])

    await getNextPageAeroApi (url, response, params, 2, endpiont, l)

    user.message = 'Done!'
  }
  catch (error) {
    // console.log(error)
  }
}
// _________________________

// -----------------------------------------------------------------------------------------------------------------///

function add_to_listed_flights(flight) {
  if (flight.length > 2 && !user.listedFlights.find((element) => { return element.flight.toLowerCase() === flight.toLowerCase() })) {
    user.listedFlights.push({ flight })
    localStorage.setItem('listed_flights', JSON.stringify(user.listedFlights))
    user.newFlight.flight = ''
    update_one_flight(flight, user.listedFlights.length - 1)
  }
  user.newFlight.flight = ''
}

function load_saved_listed_flights() {
  user.listedFlights = [].concat(user.savedListedFlights)
}

function save_listed_flights() {
  user.savedListedFlights = [].concat(user.listedFlights)
  localStorage.setItem('saved_listed_flights', JSON.stringify(user.savedListedFlights))
}

function remove_listed_flight(flight) {
  user.listedFlights.splice(flight, 1)
  localStorage.setItem('listed_flights', JSON.stringify(user.listedFlights))
}

async function update_listed_flights() {
  user.isSortedBySTA = false
  user.isSortedByETA = false
  user.isSortedByActualIn = false

  user.message = `last updated: ${today_date.toLocaleString()}`
  localStorage.setItem('last_updated', user.message)
  // console.log(user.message)
  for (let i = 0; i < user.listedFlights.length; i++) {
    user.message = `getting flight ${i + 1} out of ${user.trackedFlights.length}`
    if (user.listedFlights[i].flight.toLowerCase() === 'clock: ') {
      user.listedFlights[i] = {
        flight: 'Clock: ',
        eta_unix: Math.round(today_date.getTime() / 1000),
        sta_unix: Math.round(today_date.getTime() / 1000),
        status: user.clock_txt,
      }
      user.indexOfClock = i
      continue
    }
    user.listedFlights[i].status = '...'
    // console.log(i)
    setTimeout(() => { console.log('wait .5 second') }, 500)
    const options = {
      method: 'GET',
      url: 'https://flight-radar1.p.rapidapi.com/flights/get-more-info',
      params: {
        query: user.listedFlights[i].flight,
        fetchBy: 'flight',
        page: '1',
        limit: '100',
      },
      headers: {
        'X-RapidAPI-Key': user.savedKey,
        'X-RapidAPI-Host': 'flight-radar1.p.rapidapi.com',
      },
    }
    // console.log(user.listedFlights[i].flight)
    const response = await axios.request(options)
    if (response.data.result.response.data)
      filtered_flight = await response.data.result.response.data.filter(item => (new Date((item.time.scheduled.arrival) * 1000).getDate()) === user.selectedDate.getDate())
      // console.log(filtered_flight)
    if (filtered_flight[0]) {
      user.listedFlights[i] = {
        airport_iata: filtered_flight[0].airport.origin.code.iata,
        flight: filtered_flight[0].identification.number.default,
        arr_time: arr_time(),
        // arr_time: filtered_flight[0].time.other.eta,
        status: filtered_flight[0].status.text,
        // sta: 'new',
        sta: STA_time(),
        sta_unix: filtered_flight[0].time.scheduled.arrival,
        eta_unix: arr_time_unix(),
        aircraft: filtered_flight[0].aircraft.model.text,
        airport_text: filtered_flight[0].airport.origin.name || '',
        airline_name: filtered_flight[0].airline.name || '',
        airport_city: filtered_flight[0].airport.origin.position.region.city || '',
      }
    }
    else {
      user.message = `could not update FLight ${user.listedFlights[i].flight} `
    }

    // console.log(i)
  }
  localStorage.setItem('listed_flights', JSON.stringify(user.listedFlights))
}

async function update_one_flight(flightNumber, index) {
// TO-DO : search bt reg number too if flight number is null like privet jets
  user.listedFlights[index].status = '...'
  // console.log(index)
  setTimeout(() => { console.log('wait .5 second') }, 500)
  const options = {
    method: 'GET',
    url: 'https://flight-radar1.p.rapidapi.com/flights/get-more-info',
    params: {
      query: flightNumber,
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
  if (response.data.result.response.data)
    filtered_flight = await response.data.result.response.data.filter(item => (new Date((item.time.scheduled.arrival) * 1000).getDate()) === user.selectedDate.getDate())
    // console.log(filtered_flight)

  if (filtered_flight[0]) {
    user.listedFlights[index] = {
      airport_iata: filtered_flight[0].airport.origin.code.iata,
      flight: filtered_flight[0].identification.number.default,
      arr_time: arr_time(),
      // arr_time: filtered_flight[0].time.other.eta,
      status: filtered_flight[0].status.text,
      // sta: 'new',
      sta: STA_time(),
      sta_unix: filtered_flight[0].time.scheduled.arrival,
      eta_unix: arr_time_unix(),
      aircraft: filtered_flight[0].aircraft.model.text,
      airport_text: filtered_flight[0].airport.origin.name || '',
      airline_name: filtered_flight[0].airline.name || '',
      airport_city: filtered_flight[0].airport.origin.position.region.city || '',
    }
  }

  else {
    user.message = `could not update Flight ${user.listedFlights[index].flight} `
  }
  localStorage.setItem('listed_flights', JSON.stringify(user.listedFlights))
}

function change_tracked_list(newList) {
  user.trackedFlights = ['clock']
  user.trackedFlights = user.trackedFlights.concat(newList)
  // console.log(user.trackedFlights)
  localStorage.setItem('tracked_flights', user.trackedFlights)
}

async function get_all_arriving_flights() {
  // https://flightradar243.p.rapidapi.com/v1/airports/arrivals?code=IAH&limit=100&page=1
  let page = {
    current: 1,
    total: 9,
  }
  const flight_arriving_raw_inter = []
  let response = [{}]
  let flight_arriving_raw = []
  user.listedFlights = [{
    flight: 'Clock: ',
    eta_unix: Math.round(today_date.getTime() / 1000),
    sta_unix: Math.round(today_date.getTime() / 1000),
    status: user.clock_txt,
  }]
  for (let i = page.current; i <= page.total; i++) {
    user.message = `loading page ${i} out of ${page.total} `
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
    page = await response.data.data.airport.pluginData.schedule.arrivals.page
    flight_arriving_raw = flight_arriving_raw.concat(response.data.data.airport.pluginData.schedule.arrivals.data)
  }
  // console.log(flight_arriving_raw[900].flight.airport.origin.position.country.code)

  // ** remove non international flights

  flight_arriving_raw = flight_arriving_raw.filter(item => !(item.flight.airport.origin.position.country.code === 'US' || item.flight.airport.origin.position.country.code === 'CA')
  && ((new Date((item.flight.time.scheduled.arrival) * 1000).getDate()) === user.selectedDate.getDate()))

  // eslint-disable-next-line array-callback-return
  flight_arriving_raw.sort((a, b) => {
    if (a.flight.time.scheduled.arrival < b.flight.time.scheduled.arrival)
      return -1

    if (a.flight.time.scheduled.arrival > b.flight.time.scheduled.arrival)
      return 1
  })

  // console.log(flight_arriving_raw)
  user.int_in_flight_api = []
  flight_arriving_raw.forEach((element) => {
    // console.log(element.flight.identification.number.default)
    // console.log(element)
    // console.log('element.flight.identification.number.default')
    // console.log(element.flight.identification.number.default)
    user.int_in_flight_api.push(element.flight.identification.number.default)
    user.listedFlights.push({
      airport_iata: element.flight.airport.origin.code.iata,
      flight: element.flight.identification.number.default ?? element.flight.aircraft.registration,
      arr_time: arr_time2(element),
      status: element.flight.status.text,
      sta: STA_time2(element),
      sta_unix: element.flight.time.scheduled.arrival,
      eta_unix: arr_time_unix2(element),
      aircraft: element.flight.aircraft.model.text || '',
      airport_text: element.flight.airport.origin.name,
      airline_name: element.flight.airline?.name ?? '__',
      airport_city: element.flight.airport.origin.position.region.city || '',
    })
  })
  localStorage.setItem('listed_flights', JSON.stringify(user.listedFlights))

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
  user.isSortedByActualIn = false
  user.listedFlights = []
  for (let i = 0; i < user.trackedFlights.length; i++) {
    if (user.trackedFlights[i].toLowerCase() === 'clock') {
      user.listedFlights[i] = {
        flight: 'Clock: ',
        eta_unix: Math.round(today_date.getTime() / 1000),
        sta_unix: Math.round(today_date.getTime() / 1000),
        status: user.clock_txt,
      }
      continue
    }
    user.listedFlights[i] = {
      flight: user.trackedFlights[i],
      status: '...',
    }
  }

  // console.log(user.message)
  for (let i = 0; i < user.trackedFlights.length; i++) {
    user.message = `getting flight ${i + 1} out of ${user.trackedFlights.length}`
    if (user.trackedFlights[i].toLowerCase() === 'clock') {
      user.listedFlights[i] = {
        flight: 'Clock: ',
        eta_unix: Math.round(today_date.getTime() / 1000),
        sta_unix: Math.round(today_date.getTime() / 1000),
        status: user.clock_txt,
      }
      user.indexOfClock = i
      continue
    }
    // user.listedFlights[i].status = '...'
    // console.log(i)
    setTimeout(() => { console.log('wait .5 second') }, 500)
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
      // console.log(filtered_flight)
      user.listedFlights[i] = {
        airport_iata: filtered_flight[0].airport.origin.code.iata,
        flight: filtered_flight[0].identification.number.default,
        arr_time: arr_time(),
        // arr_time: filtered_flight[0].time.other.eta,
        status: filtered_flight[0].status.text,
        sta: STA_time(),
        sta_unix: filtered_flight[0].time.scheduled.arrival,
        eta_unix: arr_time_unix(),
        aircraft: filtered_flight[0].aircraft.model.text,
        airport_text: filtered_flight[0].airport.origin.name || '',
        airline_name: filtered_flight[0].airline.name || '',
        airport_city: filtered_flight[0].airport.origin.position.region.city || '',

      }
    }
    else {
      user.message = `could not update FLight ${user.listedFlights[i].flight} `
    }
  }
  localStorage.setItem('listed_flights', JSON.stringify(user.listedFlights))
  setTimeout(() => { console.log('wait 1.5 second'); user.message = `last updated: ${today_date.toLocaleString()}` }, 1500)

  localStorage.setItem('last_updated', user.message)

  // message = ''
  // const flight = {}
  // user.trackedFlights.forEach((element) => {
  //   // send  requst to api to get respond respond_1 and  2 are examples
  // })
  // return this.respond_1.data.find(
  //   'flight_date', '2024-04-14')
}
// testing
function del(index) {
  // console.log(user.selectedDate.toISOString())
  // console.log(new Date('2025-05-28T16:00:00Z').getTime() / 1000)
  // user.trackedFlights.splice(index, 1)
  // localStorage.setItem('tracked_flights', user.trackedFlights)
}
function save() {
  if (confirm(`Change API Key to: " ${user.inputKey} " ?`)) {
    user.savedKey = user.inputKey
    localStorage.setItem('access_key', user.inputKey)
    user.inputKey = ''
  }
}

function changeAirport() {
  user.airport_icao = user.inputAirport
  localStorage.setItem('airport_icao', user.inputAirport)
  user.inputKey = ''
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
  user.isSortedByActualIn = false
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
  user.isSortedByActualIn = false
}

function sortByAcualIn() {
  // console.log('sortBYSTA pressed')
  if (!user.isSortedByActualIn) {
    // eslint-disable-next-line array-callback-return
    user.listedFlights.sort((a, b) => {
      if (a.actual_in_unix < b.actual_in_unix)
        return -1

      if (a.actual_in_unix > b.actual_in_unix)
        return 1
    })
  }
  else {
    user.listedFlights.sort().reverse()
  }
  user.isSortedByActualIn = !user.isSortedByActualIn
  user.isSortedBySTA = false
  user.isSortedByETA = false
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
      <!-- Page's under construction -->
      <!-- <em text-sm opacity-75>{{ t('intro.desc') }}</em> -->
    </p>
    <p cursor-pointer text-blue @click="showVersionMessage">
      V 0.3.0.1
    </p>
    <div
      v-show="user.showVersionMessage" color-black style="transition: width 4s;"
      class="bg-yellow-100 p-4 m-auto w-3/4"
    >
      <p> V 0.3.0.1 </p>
      <p> &nearr; UI changes and changes time format </p>

      <p> V 0.3.0.0 </p>
      <p> &nearr; only AeroAPI button works as it is</p>
      <p> &nearr; now using AeroAPI from flightAware </p>
      <p>
        &nearr; it is still possible to use olg function but user has to
        provide own rapid api key
      </p>
      <p> &nearr; </p>
      <!-- <p> v 0.2.1.1 </p>
      <p> &nearr;fixed default access key </p>
      <p> v 0.1.10.2 </p>
      <p> &nearr; fixed track generated flights </p>
      <p> v 0.1.10.1 </p>
      <p> &nearr; track generated flights </p> -->
      <!-- <p> v 0.1.10 </p>
      <p> &nearr; Can add clock in list </p>
      <p> &nearr; if flight not found the flight number will stay in table </p>
      <p> &nearr; experimental: check all arriving international flights </p> -->
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
    <!-- {{ typeof day }} -->

    <div>
      <div max-h-lg overflow-auto m-5>
        <table class=" m-auto border ">
          <!-- m-auto  rounded shadow-md"> -->
          <thead top-0px position-sticky>
            <tr>
              <th class="border bg-gray">
                <p i-carbon-departure />
              </th>
              <th class="border border-gray-300 bg-gray">
                <!-- Flight -->
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

              <th v-show="true" class="border bg-gray">
                <!-- Sch_in -->
              </th>
              <th v-show="true" class="border bg-gray">
                <!-- Ested_in -->
              </th>
              <th v-show="true" class="border bg-gray" @click="sortByAcualIn">
                Acl_in___________
                <p v-if="user.isSortedByActualIn" btn i-carbon-arrow-down />
                <p v-else btn i-carbon-dot-mark />
              </th>
              <th class="border bg-gray">
                <!-- Status -->
              </th>
              <th class="border bg-gray" />
            </tr>
          </thead>
          <!-- use the filtered list -->
          <tbody v-for="flight in user.listedFlights" :key="flight._id">
            <tr>
              <td class="border" :class="[{ ['bg-yellow-7']: Math.abs(flight.eta_unix - today_date.getTime() / 1000) < 3600.000 }]">
                <p py-1 cursor-pointer @click="() => { flight.show = !flight.show }">
                  {{ flight.airport_iata }}
                </p>
                <p> {{ flight.flight }} </p>
              </td>
              <td class="border">
                <!-- w-1/3 border border-r-0 border-gray-300  p-4 font-normal sm:w-1/4 -->
                <!-- {{ flight.flight }} -->
              </td>
              <td class="border">
                {{ flight.sta }}
                {{ flight.scheduled_in }}
              </td>
              <td :class="etaTxtClass(flight)" class="border">
                {{ flight.arr_time }}
                {{ flight.estimated_in }}
              </td>

              <td class="border ">
                <!-- {{ flight.scheduled_in }} -->
              </td>
              <td class="border ">
                <!-- {{ flight.estimated_in }} -->
              </td>
              <td class="border " :class="[{ ['bg-yellow-7']: ((today_date.getTime() / 1000 - flight.actual_in_unix) > 600.000) && ((today_date.getTime() / 1000 - flight.actual_in_unix) < 1200.000) }]">
                {{ flight.actual_in }}
                <p text-xs>
                  {{ flight.status }}
                </p>
              </td>
              <td class="border">
                <!-- {{ flight.status }} -->
              </td>
              <td class="border ">
                <p btn bg-rose i-carbon-x @click="remove_listed_flight(user.listedFlights.indexOf(flight))" />
              <!-- {{ user.listedFlights.indexOf(flight) }} -->
              </td>

            <!-- <td class="border ">
              {{ flight.eta_unix }}
            </td> -->
            </tr>
            <tr>
              <td />
              <td v-if="flight.show" class="border" colspan="6">
                <!-- {{ flight.airport_text }} -->
                {{ ` ${flight.airline_name} , ${flight.airport_city}, ` }}
                <p>{{ flight.aircraft }}</p>

                <!-- <p i-carbon-arrow-down /> -->
                <!-- <p>
                  <button @click="update_one_flight(flight.flight, user.listedFlights.indexOf(flight)) ">
                    <p btn i-carbon-repeat-one />
                  </button>
                  <button @click=" update_listed_flights()">
                    <p btn i-carbon-repeat />
                  </button>
                  <button @click=" remove_listed_flight(user.listedFlights.indexOf(flight))">
                    <p btn bg-rose i-carbon-x />
                  </button>
                </p> -->
              </td>
            </tr>
          </tbody>
          <!-- <tr class="border">
            <td class="border" />
            <td class="border">
              <input v-model="user.newFlight.flight" text-black w-full class="border" placeholder="new flight: " @keydown.enter="add_to_listed_flights(user.newFlight.flight)">
            </td>
            <td class="border" />
            <td class="border">
              <button btn @click="add_to_listed_flights(user.newFlight.flight)">
                Add
              </button>
            </td>
            <td class="border" />
          </tr>
          <tr> &nbsp; </tr> -->
        </table>
      </div>
      <!-- <div py-2 /> -->
      <p text-4xl>
        {{ user.clock_txt }}
      </p>
      <p>
        {{ user.message }}
      </p>
      <button m-3 text-sm btn @click="useTimeout(aeroApiScheduled('scheduled_arrivals', 0), 1000)">
        AeroAPI
      </button>
      <!-- <button m-3 text-sm btn @click="useTimeout(test(), 1000)">
        Test
      </button> -->
      <!-- <p>
        {{ user.airport_icao }}
        <input
          id="input" v-model="user.inputAirport" placeholder="enter icao code" autocomplete="true" type="text"
          v-bind="$attrs" p="x-4 y-2" w="150px" text="center" bg="transparent" border="~ rounded gray-200 dark:gray-700"
          outline="none active:none" @keydown.enter="changeAirport"
        >
        <button m-3 text-sm btn @click="changeAirport">
          Change
        </button> -->

      <!-- <button
        m-3 text-sm btn
        @click="test"
      >
        Test
      </button> -->
      <!-- </p>
      <div py-4 /> -->
      <!-- {{ user.listedFlights }} -->
      <!-- {{ filtered_flight }} -->
      <!-- <p>
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
      </button> -->
      <!-- <button
        m-3 text-sm btn
        @click="test"
      >
        Test
      </button> -->
    <!-- </p> -->

    <!-- <button m-3 text-sm btn bg-red @click="get_all_arriving_flights">
      get all arriving flights (experimental)
    </button> -->
    <!-- <div py-4 /> -->
    <!-- <p id="message">
      user.savedKey : {{ user.savedKey }}
    </p>
    <p id="message">
      user.trackedFlights : click to delete
    </p>
    <button
      v-for="flight in user.trackedFlights" :key="flight" m-1 bg-red
      @click="del(user.trackedFlights.indexOf(flight))"
    >
      {{ flight }}
    </button>
    <div>
      <div>
        <!-- {{ user.int_in_flight_api }} -->
    <!-- </div>
    <button m-3 text-sm btn bg-red @click="change_tracked_list(user.int_in_flight_api)">
      track generated flights (experimental)
    </button>
  </div>
  <button btn @click="load_saved_listed_flights()">
    use saved listed flights
  </button>
  <button btn @click="save_listed_flights()">
    save listed flights
  </button> -->
    <!-- <div>
      <button m-3 text-sm btn bg-red @click="setAutoRefresh">
        set auto refresh (experimental)
      </button>
      {{ user.autoRefresh }}
    </div> -->
    <!-- <div> -->
    <!-- <button
        m-3 text-sm btn
        @click="go_home"
      >
        Home
      </button> -->
    <!-- </div> -->
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
