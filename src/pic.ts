
const pictureMap = new Map<string, any>()

function splitImage(n: number, src: string) {
  const key = `${n}-${src}`
  return new Promise((resolve) => {
    if (pictureMap.has(key)) {
      return resolve(pictureMap.get(key))
    }
    const image = new Image();
    image.src = src;

    image.onload = async () => {
      const result = generateImage(image, n)
      pictureMap.set(key, result)
      resolve(result)
    }
  })
}

async function generateImage(image: any, n: number) {
  const numbers: any[] = []
  const result: any[] = []
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const w = image.width / n;
  const h = image.height / n;
  let count = 0

  for (let j = 0; j < n; j++) {
    const col = [];
    const twoCol: any[] = []
    for (let i = 0; i < n; i++) {
      ctx.drawImage(image, i * w, j * h, w, h, 0, 0, w, h);
      const url = await PicSpace(canvas.toDataURL("image/png"))
      const block = {
        url,
        x: i,
        y: j,
        pos: ++count
      };
      const twoBlock = {
        url,
        x: i,
        y: j,
        pos: ++count
      }
      numbers.push(JSON.parse(JSON.stringify(block)))
      numbers.push(JSON.parse(JSON.stringify(twoBlock)))
      col.push(block);
      twoCol.push(twoBlock);
    }
    result.push(col);
    result.push(twoCol);
  }
  return { result, numbers }
}


async function PicSpace(src: string) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const imgData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data!
      let lOffset = canvas.width, rOffset = 0, tOffset = canvas.height, bOffset = 0
      for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
          const pos = (i + canvas.width * j) * 4
          if (imgData[pos] === 255 || imgData[pos + 1] === 255 || imgData[pos + 2] || imgData[pos + 3]) {
            bOffset = Math.max(j, bOffset)
            tOffset = Math.min(j, tOffset)
            lOffset = Math.min(i, lOffset)
            rOffset = Math.max(i, rOffset)
          }
        }
      }
      lOffset++
      rOffset++
      tOffset++
      bOffset++
      const canvas1 = document.createElement('canvas')
      const ctx1 = canvas1.getContext('2d')
      canvas1.width = rOffset - lOffset
      canvas1.height = bOffset - tOffset
      ctx1?.drawImage(img, lOffset, tOffset, canvas1.width, canvas1.height, 0, 0, canvas1.width, canvas1.height)
      resolve(canvas1.toDataURL())
    }
  })

}

function randomPic(numbers: any[]) {

  const result = numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0];
  return result
}
export async function initData(n: number, src: string) {
  const { result: arrayPic, numbers } = await splitImage(n, src) as any
  const copyNumbers = JSON.parse(JSON.stringify(numbers))
  const copyArrayPic = JSON.parse(JSON.stringify(arrayPic))

  for (let i = 0; i < arrayPic.length; i++) {
    for (let j = 0; j < arrayPic[i].length; j++) {
      const { url, pos, } = randomPic(copyNumbers)
      console.log(pos)
      copyArrayPic[i][j].url = url
      copyArrayPic[i][j].pos = pos
      copyArrayPic[i][j].animateX = false
      copyArrayPic[i][j].animateY = false
    }
  }
  return copyArrayPic
}



