<script setup lang="ts">
import { arrayPic, emptyFlag, ratio, loading, height, n } from "../config";
import { reset } from "../pic";
import { Block } from "../type";
import { baseImage } from "../request";
const pre = ref<Block>({});
function match(block: Block) {
  if (block.url === emptyFlag) return;
  if (pre.value === block) {
    pre.value.animate = false;
    pre.value = {};
    return;
  }
  block.animate = true;
  if (pre.value.url !== block.url && pre.value.pos !== block.pos) {
    pre.value.animate = false;
    pre.value = block;
    return;
  }

  if (canEliminate(block)) {
    block.disappear = true;
    pre.value.disappear = true;
    const _pre = pre.value;
    setTimeout(() => {
      block.url = emptyFlag;
      _pre.url = emptyFlag;
      block.disappear = false;
      _pre.disappear = false;
      if (isWin()) {
        setTimeout(() => {
          alert("You Win!");
          baseImage();
        });
      }
    }, 200);
  }
  block.animate = false;
  pre.value.animate = false;
  pre.value = {};
}

function canEliminate(block: Block) {
  return bfs(block, pre.value) || bfs(pre.value, block);
}

function bfs(block, target, path = new Set()) {
  const copyArray = JSON.parse(JSON.stringify(arrayPic.value));
  const queue = [block];
  while (queue.length) {
    const cur = queue.shift();
    const y = cur.y;
    const x = cur.x;
    // 处理边界
    if (y > 0) {
      const top = copyArray[y - 1][x];
      const types: string[] = JSON.parse(JSON.stringify(cur.types || []));
      top.types = types ? ["down", ...types] : ["down"];
      if (preReturn(top)) {
        if (top.pos === target.pos) {
          console.log("find", top);
          return true;
        }
        if (top.url === emptyFlag) {
          queue.push(top);
        }
      }
    }
    if (y < copyArray.length - 1) {
      const bottom = copyArray[y + 1][x];
      const types: string[] = JSON.parse(JSON.stringify(cur.types || []));
      bottom.types = types ? ["up", ...types] : ["up"];
      if (preReturn(bottom)) {
        if (bottom.pos === target.pos) {
          console.log("find", bottom);
          return true;
        }
        if (bottom.url === emptyFlag) {
          queue.push(bottom);
        }
      }
    }
    if (x > 0) {
      const left = copyArray[y][x - 1];
      const types: string[] = JSON.parse(JSON.stringify(cur.types || []));
      left.types = types ? ["right", ...types] : ["right"];
      if (preReturn(left)) {
        if (left.pos === target.pos) {
          console.log("find", left);
          return true;
        }
        if (left.url === emptyFlag) {
          queue.push(left);
        }
      }
    }
    if (x < copyArray[0].length - 1) {
      const right = copyArray[y][x + 1];
      const types: string[] = JSON.parse(JSON.stringify(cur.types || []));
      right.types = types ? ["left", ...types] : ["left"];

      if (preReturn(right)) {
        if (right.pos === target.pos) {
          console.log("find", right);
          return true;
        }
        if (right.url === emptyFlag) {
          queue.push(right);
        }
      }
    }
  }
  return false;
}

function preReturn(block) {
  let count = 0;
  let pre = null,
    cur = null;
  if (block.types.length < 4) {
    return true;
  }

  for (let i = 1; i < block.types.length; i++) {
    cur = block.types[i];
    pre = block.types[i - 1];
    if (pre !== cur) {
      count++;
    }
    if (count > 2) {
      return false;
    }
  }
  return true;
}

function isWin() {
  return arrayPic.value.every((row) => {
    return row.every((block) => {
      return block.url === emptyFlag;
    });
  });
}

const sizeStyle = (block) => {
  const result = {};
  if (block.animate) {
    result["transform"] = "scale(1.1)";
  }
  result["width"] = "5rem !important";
  result["height"] = "auto !important";
  if (block.url === emptyFlag) {
    result["visibility"] = "hidden";
  }
  result["aspect-ratio"] = ratio.value;
  return result;
};

function newGame(type: "Easy" | "Normal" | "Hard") {
  if (type === "Easy" && n.value !== 2) {
    n.value = 2;
    baseImage();
  } else if (type === "Normal" && n.value !== 3) {
    n.value = 3;
    baseImage();
  } else if (type === "Hard" && n.value !== 4) {
    n.value = 4;
    baseImage();
  }
}
newGame("Easy");
</script>

<template>
  <div m-y-5 flex="~ gap-1" justify-center>
    <button btn @click="reset">Rest</button>
    <button btn @click="baseImage">New Game</button>
    <button btn @click="newGame('Easy')">Easy</button>
    <button btn @click="newGame('Normal')">Normal</button>
    <button btn @click="newGame('Hard')">Hard</button>
  </div>
  <div
    v-for="(row, y) in arrayPic"
    :key="y"
    flex="~"
    items-center
    justify-center
    ma
    :style="{
      'margin-bottom': !loading && y === 2 * n + 1 ? -height + 'rem' : '',
      'margin-top': !loading && y === 0 && -height + 'rem',
    }"
  >
    <img
      v-for="block in row"
      m-1
      object-fill
      w-auto
      flex="~"
      items-center
      justify-center
      :title="block.pos"
      :class="[
        'bg-gray-500/10',
        'hover:bg-gray-500/20',
        block?.disappear ? 'animate-fade-out' : '',
      ]"
      :src="block?.url"
      @click="match(block)"
      :style="sizeStyle(block)"
    />
  </div>
</template>

<style scoped></style>
