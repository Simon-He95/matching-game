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
    block.url = emptyFlag;
    pre.value.url = emptyFlag;
  }
  block.animate = false;
  pre.value.animate = false;
  pre.value = {};
  if (isWin()) {
    alert("You Win!");
  }
}

function canEliminate(block: Block) {
  return bfs(block, pre.value) || bfs(pre.value, block);
}

function bfs(block, target, path = new Set()) {
  const copyArray = JSON.parse(JSON.stringify(arrayPic.value));
  const queue = [block];
  while (queue.length) {
    const cur = queue.shift();
    if (path.has(cur)) {
      continue;
    }
    path.add(cur);
    const y = cur.y;
    const x = cur.x;
    // 处理边界
    if (y > 0) {
      const top = copyArray[y - 1][x];
      top.type = "down";
      top.pre = JSON.parse(JSON.stringify(cur));
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
      bottom.type = "up";
      bottom.pre = JSON.parse(JSON.stringify(cur));
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
      left.type = "right";
      left.pre = JSON.parse(JSON.stringify(cur));
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
      right.type = "left";
      right.pre = JSON.parse(JSON.stringify(cur));
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
    current = null;
  const queue = [block];
  while (queue.length) {
    const block = queue.shift();
    current = block.type;
    if (pre === null) {
      pre = current;
    } else {
      if (pre !== current) {
        count++;
        pre = current;
      }
    }
    if (block.pre) {
      queue.push(block.pre);
    }
    if (count > 3) return false;
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

function newGame() {
  baseImage();
}
</script>

<template>
  <div m-y-5 flex="~ gap-5" justify-center>
    <button btn @click="reset">Rest</button>
    <button btn @click="newGame">New Game</button>
  </div>
  <div
    v-for="(row, y) in arrayPic"
    :key="y"
    flex="~"
    items-center
    justify-center
    w-max
    ma
    m-l--20
    :style="{
      'margin-bottom': !loading && y === 2 * n + 1 && -height + 'rem',
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
        block?.animateY ? 'animate-shake-y' : '',
        block?.animateX ? 'animate-shake-x' : '',
      ]"
      :src="block?.url"
      @click="match(block)"
      :style="sizeStyle(block)"
    />
  </div>
</template>

<style scoped></style>
