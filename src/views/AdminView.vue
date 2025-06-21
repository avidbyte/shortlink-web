<template>
  <div class="table-container">
    <!-- 操作区域 -->
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入短链关键字"
        clearable
        @input="handleSearch"
        @clear="handleReset"
        style="width: 300px; margin-right: 10px"
      >
        <template #suffix>
          <el-icon class="el-input__icon">
            <search/>
          </el-icon>
        </template>
      </el-input>
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleAdd">
        <el-icon>
          <plus/>
        </el-icon>
        新增
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      border
      stripe
      v-loading="loading"
      style="width: 100%; margin-top: 20px"
      :header-cell-style="() => ({ background: '#f5f7fa', fontWeight: 'bold' })"
    >
      <el-table-column prop="id" label="ID" width="80" align="center"/>
      <el-table-column label="短链" width="150">
        <template #default="scope">
          <div class="short-url" v-if="scope.row">
            <span>{{ scope.row.shortCode }}</span>
            <el-icon class="copy-icon"
                     @click="copyToClipboard(`${baseUrl}/${scope.row.shortCode}`)">
              <document-copy/>
            </el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="完整短链" width="250">
        <template #default="scope">
          <a
            v-if="scope.row"
            :href="`${baseUrl}/${scope.row.shortCode}`"
            target="_blank"
            class="full-url"
          >
            {{ baseUrl }}/{{ scope.row.shortCode }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="目标链接">
        <template #default="scope">
          <div class="target-url" v-if="scope.row">
            {{ scope.row.targetUrl }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="redirectCode" label="重定向码" width="120" align="center"/>
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row" :type="scope.row.disabled ? 'danger' : 'success'" effect="dark">
            {{ scope.row.disabled ? '已禁用' : '启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalPv" label="PV" width="100" align="center"/>
      <el-table-column prop="totalUv" label="UV" width="100" align="center"/>
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="scope">
          <el-button-group v-if="scope.row">

            <el-button
              @click="handleEdit(scope.row)"
              type="primary"
              size="small"
              title="编辑"
            >
              <el-icon>
                <edit/>
              </el-icon>
            </el-button>

            <el-button
              @click="handleDelete(scope.row.id)"
              type="danger"
              size="small"
              title="删除"
            >
              <el-icon>
                <delete/>
              </el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      layout="total, sizes, prev, pager, next"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      style="margin-top: 20px; text-align: right"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑短链' : '新增短链'"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        :model="form"
        label-width="100px"
        :rules="formRules"
        ref="formRef"
        label-position="left"
      >
        <el-form-item label="短链" prop="shortCode">
          <el-input
            v-model="form.shortCode"
            :disabled="!!form.id"> <!-- 编辑模式下禁用 -->
            <template #prepend>{{ baseUrl }}/</template>
          </el-input>
          <div class="form-tip">短链只能包含字母、数字、下划线、连字符，并可包含多级路径</div>
        </el-form-item>
        <el-form-item label="目标链接" prop="targetUrl">
          <el-input
            v-model="form.targetUrl"
            placeholder="请输入完整URL（包含http://或https://）"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="重定向码" prop="RedirectCode">
          <el-select v-model="form.redirectCode" style="width: 100%">
            <el-option :value="301" label="301 - 永久重定向"/>
            <el-option :value="302" label="302 - 临时重定向"/>
            <el-option :value="307" label="307 - 临时重定向(保持方法)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.disabled"
            :active-value="true"
            :inactive-value="false"
            active-text="禁用"
            inactive-text="启用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed, nextTick} from 'vue'
import {
  Search, Plus, Edit, Delete, DocumentCopy,
} from '@element-plus/icons-vue'
import {
  ElMessage, ElMessageBox, ElNotification
} from 'element-plus'
import {
  getTableData, addData, updateData, deleteData, toggleStatus
} from '@/api/table.js'

// 状态管理
const loading = ref(true)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const searchTimer = ref<number | null>(null)

// 表单数据
const form = ref({
  id: null,
  shortCode: '',
  targetUrl: '',
  redirectCode: 302,
  disabled: false
})

// 获取当前域名
const baseUrl = computed(() => window.location.origin)

// 表单验证规则
const formRules = {
  shortCode: [
    { required: true, message: '短链不能为空', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/,
      message: '短链只能包含字母、数字、下划线、连字符，并可包含多级路径（例如：abc-123/def_456）',
      trigger: 'blur'
    }
  ],
  targetUrl: [
    {required: true, message: '目标链接不能为空', trigger: 'blur'},
    {
      pattern: /^(http|https):\/\/.+$/,
      message: '请输入有效的URL（以http://或https://开头）',
      trigger: 'blur'
    }
  ]
}

// 表单引用
const formRef = ref()

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const res = await getTableData({
      page: currentPage.value,
      size: pageSize.value,
      shortCode: searchKeyword.value
    })
    tableData.value = res?.list || []
    total.value = res?.total || 0
  } catch (err) {
    console.error('加载数据失败:', err)
    ElMessage.error('请求失败，请稍后再试或检查网络')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索（带防抖）
const handleSearch = () => {
  clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(() => {
    currentPage.value = 1
    loadData()
  }, 500)
}

// 重置搜索
const handleReset = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  loadData()
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
  loadData()
}

// 每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

// 新增
const handleAdd = () => {
  form.value = {
    id: null,
    shortCode: '',
    targetUrl: '',
    redirectCode: 302,
    disabled: false
  }
  dialogVisible.value = true
  nextTick(() => {
    if (formRef.value) formRef.value.clearValidate()
  })
}

// 编辑
const handleEdit = (row) => {
  form.value = {...row}
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = async (row) => {
  try {
    const newStatus = {"status": !row.disabled}
    await toggleStatus(row.id, newStatus)
    row.disabled = newStatus
    ElMessage.success(`已${newStatus ? '禁用' : '启用'}短链`)
  } catch (err) {
    ElMessage.error('状态切换失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.value.id) {
          await updateData(form.value)
          ElMessage.success('更新成功')
        } else {
          await addData(form.value)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        void loadData()
      } catch (err) {
        ElMessage.error('操作失败，请重试')
      }
    }
  })
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该短链，是否继续？', '警告', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
      center: true
    } as any)

    await deleteData(id)
    ElMessage.success('删除成功')

    // 如果当前页最后一条被删除，则回到上一页
    if (tableData.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }

    void loadData()
  } catch (error) {
    // 用户取消删除
  }
}

// 复制到剪贴板
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElNotification({
      title: '复制成功',
      message: `已复制短链: ${text}`,
      type: 'success',
      duration: 2000
    })
  }).catch(err => {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动复制')
  })
}

// 初始化加载
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.table-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}


.el-table :deep(.el-table__cell) {
  padding: 12px 0;
}

.short-url {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-icon {
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.copy-icon:hover {
  color: #409eff;
}

.full-url {
  color: #409eff;
  text-decoration: none;
  font-size: 13px;
  word-break: break-all;
}

.full-url:hover {
  text-decoration: underline;
}

.target-url {
  word-break: break-all;
  font-size: 13px;
  line-height: 1.5;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}


.el-button + {
  margin-left: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .toolbar {
    flex-wrap: wrap;
  }

  .toolbar {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }

}

</style>
