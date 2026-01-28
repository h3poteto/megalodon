import { detector } from 'megalodon'
import axios from 'axios'

const URL = process.env.URL as string
const instance = axios.create()

detector(URL, instance).then(sns => {
  console.log(sns)
})
