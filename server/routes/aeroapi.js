import axios from 'axios'

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  // console.log(params)
  // console.log(event.node.req)
  // return {
  //   hello: 'world!!',
  // }
  try {
    // console.log(params.url)
    // console.log('aeroapi')

    const options = {

      method: 'GET',
      url: `https://aeroapi.flightaware.com/${params.url}`,
      headers: {
        'Accept': 'application/json; charset=UTF-8',
        'x-apikey': 'mTRBDG1YwVoonJLizwdx3TlArbIyzatA',
      },
      params: { start: params.start, end: params.end, max_pages: params.max_pages },
    }

    const response = await axios.request(options)

    //   console.log( (await zuluToCentral(response.data.arrivals[0].actual_on)).toLocaleString())
    //   console.log( (await zuluToCentral(response.data.arrivals.pop().actual_on)).toLocaleString())
    //   console.log( (await response.data.arrivals[0].destination.code))
    // console.log(response.data.scheduled_arrivals[0].ident)
    // console.log(url)
    return response.data
    // res.send("OK")
  }
  catch (error) {
    // console.log(error.message)
    return { message: 'Error fetching data', error: error.message }
  }
})
