<template>
  <div class="table-container">
    <div class="toolbar"
         style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px">
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('searchKeywordPlaceholder')"
          clearable
          @keyup.enter.native="handleSearch"
          style="width: 220px"
        >
          <template #suffix>
            <el-icon class="el-input__icon">
              <search/>
            </el-icon>
          </template>
        </el-input>

        <el-input
          v-model="searchTargetUrl"
          :placeholder="t('searchTargetUrlPlaceholder')"
          clearable
          @keyup.enter.native="handleSearch"
          style="width: 220px"
        >
          <template #suffix>
            <el-icon class="el-input__icon">
              <search/>
            </el-icon>
          </template>
        </el-input>

        <el-select
          v-model="searchRedirectCode"
          :placeholder="t('redirectCodePlaceholder')"
          clearable
          style="width: 120px"
        >
          <el-option :label="'301'" :value="301"/>
          <el-option :label="'302'" :value="302"/>
          <el-option :label="'307'" :value="307"/>
        </el-select>

        <el-select
          v-model="searchDisabled"
          :placeholder="t('statusPlaceholder')"
          clearable
          style="width: 120px"
        >
          <el-option :label="t('statusEnabled')" :value="false"/>
          <el-option :label="t('statusDisabled')" :value="true"/>
        </el-select>

        <el-button type="primary" @click="handleSearch" :loading="loading">{{
            t('search')
          }}
        </el-button>
        <el-button @click="handleReset">{{ t('reset') }}</el-button>
      </div>

      <div>
        <el-button type="primary" @click="handleAdd">
          <el-icon>
            <plus/>
          </el-icon>
          {{ t('add') }}
        </el-button>

        <el-select v-model="locale" :placeholder="t('language')"
                   style="width: 120px;margin-left: 16px;">
          <el-option label="中文" value="zh"/>
          <el-option label="English" value="en"/>
        </el-select>
      </div>
    </div>

    <el-table
      :data="tableData"
      border
      stripe
      v-loading="loading"
      style="width: 100%; margin-top: 20px"
      :header-cell-style="() => ({ background: '#f5f7fa', fontWeight: 'bold' })"
    >
      <el-table-column prop="id" :label="t('id')" width="80" align="center"/>
      <el-table-column :label="t('shortCode')" width="150">
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
      <el-table-column :label="t('fullShortCode')" width="250">
        <template #default="scope">
          <a v-if="scope.row" :href="`${baseUrl}/${scope.row.shortCode}`" target="_blank"
             class="full-url">
            {{ baseUrl }}/{{ scope.row.shortCode }}
          </a>
        </template>
      </el-table-column>
      <el-table-column :label="t('targetUrl')">
        <template #default="scope">
          <div class="target-url" v-if="scope.row">{{ scope.row.targetUrl }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="redirectCode" :label="t('redirectCode')" width="120" align="center"/>
      <el-table-column :label="t('status')" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row" :type="scope.row.disabled ? 'danger' : 'success'" effect="dark">
            {{ scope.row.disabled ? t('statusDisabled') : t('statusEnabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalPv" :label="t('pv')" width="100" align="center"/>
      <el-table-column prop="totalUv" :label="t('uv')" width="100" align="center"/>
      <el-table-column :label="t('operation')" width="120" fixed="right" align="center">
        <template #default="scope">
          <el-button-group v-if="scope.row">
            <el-button @click="handleEdit(scope.row)" type="primary" size="small"
                       :title="t('edit')">
              <el-icon>
                <edit/>
              </el-icon>
            </el-button>
            <el-button @click="handleDelete(scope.row.id)" type="danger" size="small"
                       :title="t('delete')">
              <el-icon>
                <delete/>
              </el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end">
      <el-pagination
        layout="total, sizes, prev, pager, next"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? t('dialogTitleEdit') : t('dialogTitleAdd')"
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
        <el-form-item :label="t('shortCode')" prop="shortCode">
          <el-input v-model="form.shortCode" :disabled="!!form.id">
            <template #prepend>{{ baseUrl }}/</template>
          </el-input>
          <div class="form-tip">{{ t('formShortCodeInvalid') }}</div>
        </el-form-item>
        <el-form-item :label="t('targetUrl')" prop="targetUrl">
          <el-input
            v-model="form.targetUrl"
            :placeholder="t('formTargetUrlInvalid')"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item :label="t('redirectCode')" prop="redirectCode">
          <el-select v-model="form.redirectCode" style="width: 100%">
            <el-option :value="301" :label="t('redirectCode301')"/>
            <el-option :value="302" :label="t('redirectCode302')"/>
            <el-option :value="307" :label="t('redirectCode307')"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('status')" prop="disabled">
          <el-radio-group v-model="form.disabled">
            <el-radio :label="false">{{ t('statusEnabled') }}</el-radio>
            <el-radio :label="true">{{ t('statusDisabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed, nextTick, watch} from 'vue'
import {
  Search, Plus, Edit, Delete, DocumentCopy,
} from '@element-plus/icons-vue'
import {
  ElMessage, ElMessageBox, ElNotification
} from 'element-plus'
import {
  getTableData, addData, updateData, deleteData
} from '@/api/table.js'

import {useI18n} from 'vue-i18n'

const {t} = useI18n()

// 状态管理
const loading = ref(true)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref<string>('')              // 短链关键词
const searchTargetUrl = ref<string>('')            // 目标链接
const searchRedirectCode = ref<number | null>(null) // 重定向码（301、302、307）
const searchDisabled = ref<boolean | null>(null)   // 状态：true=禁用, false=启用
const dialogVisible = ref(false)
const searchTimer = ref<number | null>(null)

// 表单数据
const form = ref<FormData>({
  id: null,
  shortCode: '',
  targetUrl: '',
  redirectCode: 302,
  disabled: false
})

interface FormData {
  id: string | number | null
  shortCode: string
  targetUrl: string
  redirectCode: number
  disabled: boolean
}


// 获取当前域名
const baseUrl = computed(() => window.location.origin)

const locale = ref(localStorage.getItem('locale') || 'zh')

watch(locale, (val) => {
  localStorage.setItem('locale', val)
  location.reload() // 或 useI18n().locale.value = val（根据是否支持热切换）
})

// 表单验证规则
const formRules = {
  shortCode: [
    {required: true, message: '短链不能为空', trigger: 'blur'},
    {
      pattern: /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/,
      message: t('formShortCodeInvalid'),
      trigger: 'blur'
    }
  ],
  targetUrl: [
    {required: true, message: '目标链接不能为空', trigger: 'blur'},
    {
      pattern: /^(http|https):\/\/.+$/,
      message: t('formTargetUrlInvalid'),
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
      shortCode: searchKeyword.value,
      targetUrl: searchTargetUrl.value,
      redirectCode: searchRedirectCode.value,
      disabled: searchDisabled.value,
    })
    tableData.value = res?.list || []
    total.value = res?.total || 0
  } catch (err) {
    console.error('加载数据失败:', err)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索（带防抖）
const handleSearch = () => {
  if (searchTimer.value !== null) {
    clearTimeout(searchTimer.value)
  }
  searchTimer.value = setTimeout(() => {
    currentPage.value = 1
    loadData()
  }, 500)
}

// 重置搜索
const handleReset = () => {
  searchKeyword.value = ''
  searchTargetUrl.value = ''
  searchRedirectCode.value = null
  searchDisabled.value = null
  currentPage.value = 1
  loadData()
}


// 分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadData()
}

// 每页条数变化
const handleSizeChange = (size: number) => {
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
const handleEdit = (row: any) => {
  form.value = {...row}
  dialogVisible.value = true
}




const handleSubmit = async () => {
  if (!formRef.value) return

  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id !== null) {
          await updateData(form.value as { id: string | number } & Record<string, any>)
          ElMessage.success('更新成功')
        } else {
          await addData(form.value)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        void loadData()
      } catch (err) {
        console.error('创建短链失败:', err)
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
const copyToClipboard = (text: string) => {
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
