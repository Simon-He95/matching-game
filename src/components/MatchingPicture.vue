<script setup lang="ts">
import { arrayPic, emptyFlag, ratio } from "../config";
import { Block } from "../type";
const pre = ref<Block>({});
function match(block: Block) {
  if (block.url === emptyFlag) return;
  if (pre.value.pos === block.pos) {
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
  if (
    block.x === pre.value.x &&
    (block.x === 0 || block.x === arrayPic.value[0].length - 1)
  ) {
    return pre.value.url === block.url;
  } else if (
    block.y === pre.value.y &&
    (block.y === 0 || block.y === arrayPic.value.length - 1)
  ) {
    return pre.value.url === block.url;
  } else {
    return bfs(block, pre.value) || bfs(pre.value, block);
  }
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
    if (cur.pos === target.pos) {
      console.log("find", cur);
      return true;
    }
    const y = cur.y;
    const x = cur.x;
    // 处理边界
    if (y > 0) {
      const top = copyArray[y - 1][x];
      top.type = "down";
      top.pre = cur;
      if (top.pos === target.pos) {
        console.log("find", top);
        return true;
      }
      if (top.url === emptyFlag) {
        queue.push(top);
      }
    }
    if (y < copyArray.length - 1) {
      const bottom = copyArray[y + 1][x];
      bottom.type = "up";
      bottom.pre = cur;
      if (bottom.pos === target.pos) {
        console.log("find", bottom);
        return true;
      }
      if (bottom.url === emptyFlag) {
        queue.push(bottom);
      }
    }
    if (x > 0) {
      const left = copyArray[y][x - 1];
      left.type = "right";
      left.pre = cur;
      if (left.pos === target.pos) {
        console.log("find", left);
        return true;
      }
      if (left.url === emptyFlag) {
        queue.push(left);
      }
    }
    if (x < copyArray[0].length - 1) {
      const right = copyArray[y][x + 1];
      right.type = "left";
      right.pre = cur;
      if (right.pos === target.pos) {
        console.log("find", right);
        return true;
      }
      if (right.url === emptyFlag) {
        queue.push(right);
      }
    }
  }
  return false;
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
  result["aspect-ratio"] = ratio.value;
  return result;
};
</script>

<template>
  <div
    v-for="(row, y) in arrayPic"
    :key="y"
    flex="~"
    items-center
    justify-center
    w-max
    ma
  >
    <div v-for="block in row" relative m="1px">
      <img
        object-fill
        w-auto
        flex="~"
        items-center
        justify-center
        border-box
        :title="block.pos"
        border="0.5 gray-400/10"
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
  </div>
</template>

<style scoped></style>
