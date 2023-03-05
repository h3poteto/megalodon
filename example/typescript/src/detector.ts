import { detector } from 'megalodon'

const URL = process.env.URL as string

detector(URL).then(sns => {
  console.log(sns)
})
