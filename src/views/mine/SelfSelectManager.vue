<template>
  <div class="self-select-manager-page">
    <el-card shadow="hover" style="height: 100%;">
      <SelfSelectGroup />
    </el-card>
  </div>
</template>

<script>
import SelfSelectGroup from '@/components/mine/SelfSelectGroup.vue'

export default {
  components: {
    SelfSelectGroup
  }
}
</script>

<style scoped>
.self-select-manager-page {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
</style>