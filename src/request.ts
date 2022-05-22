import axios from "axios";
import { currentImage, base64, arrayPic, ratio, n, loading } from "./config";
import { initData } from './pic'
const localUrl = "./img/"


const url = "https://source.unsplash.com/collection/94734566";

export function getImage() {
  return new Promise(async (resolve, reject) => {
    const { data } = await axios({
      methods: "get",
      responseType: "blob",
      url
    })
    let oFileReader = new FileReader();
    oFileReader.readAsDataURL(data);
    oFileReader.onloadend = (e) => dealPicture(e?.target?.result as any, resolve)
  })
}

const imageLength = 29
export function baseImage() {
  return new Promise((resolve) => {
    loading.value = true
    const picId = picIndex()
    const src = `${localUrl}${picId}.jpg`
    currentImage.value = picId
    const image = new Image();
    image.src = src;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height
      ctx?.drawImage(image, 0, 0, image.width, image.height)
      dealPicture(canvas.toDataURL(), resolve)
    }
  })
}

function picIndex(): number {
  const id = Math.floor(Math.random() * imageLength) + 1
  if (id === currentImage.value) {
    return picIndex()
  }
  return id
}


async function dealPicture(baseUrl: string, resolve: any) {
  base64.value = baseUrl
  arrayPic.value = await initData(n.value, base64.value);
  const image = new Image();
  image.src = base64.value;
  image.onload = () => {
    ratio.value = (image.width / image.height).toFixed(1);
  };
  loading.value = false
  resolve('success')
}



