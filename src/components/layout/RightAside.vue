<script>
import quoteApi from '@/api/quote'
export default {
  data() {
    return { marketIndex: {} }
  },
  mounted() {
    this.loadMarketIndex()
  },
  methods: {
    loadMarketIndex() {
      quoteApi.getMarketIndex().then(res => {
        this.marketIndex = res.data // 注意：res.data 对应 Mock 返回的 data 字段
      }).catch(err => {
        console.error('加载大盘指数失败：', err)
      })
    }
  }
}
</script>