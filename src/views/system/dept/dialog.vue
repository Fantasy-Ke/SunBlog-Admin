<template>
	<div class="system-dept-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="60%">
			<el-form :rules="rules" v-loading="state.dialog.loading" ref="deptDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="上级机构" prop="parentId">
							<el-tree-select
								v-model="state.ruleForm.parentId"
								placeholder="请选择机构"
								:data="state.deptData"
								check-strictly
								:render-after-expand="false"
								class="w100"
								clearable
							/>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="机构名称" prop="name">
							<el-input v-model="state.ruleForm.name" maxlength="23" placeholder="请输入机构名称" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="机构编码" prop="code">
							<el-input v-model="state.ruleForm.code" maxlength="64" placeholder="请输入机构编码" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="排序" prop="sort">
							<el-input-number v-model="state.ruleForm.sort" controls-position="right" placeholder="请输入排序" class="w100" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="部门状态" prop="status">
							<el-switch
								v-model="state.ruleForm.status"
								inline-prompt
								:active-value="0"
								:inactive-value="1"
								active-text="启"
								inactive-text="禁"
							></el-switch>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
						<el-form-item label="备注" prop="remark">
							<el-input v-model="state.ruleForm.remark" type="textarea" placeholder="请输入部门描述" maxlength="200"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemDeptDialog">
import { reactive, ref, nextTick, inject } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { OrganizationSyssServiceProxy, TreeSelectOutput, UpdateOrgInput } from '@/shared/service-proxies';

const _orgSysService = new OrganizationSyssServiceProxy(inject('$baseurl'), inject('$api'));
// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const deptDialogFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
	name: [
		{
			required: true,
			message: '请输入机构名称',
		},
	],
	code: [
		{
			required: true,
			message: '请输入机构编码',
		},
	],
	sort: [
		{
			required: true,
			message: '请输入排序',
		},
	],
});
const state = reactive({
	ruleForm: {
		id: '',
		status: 0,
		sort: 100,
	} as UpdateOrgInput,
	deptData: [] as TreeSelectOutput[], // 部门数据
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
		loading: true,
	},
});

// 打开弹窗
const openDialog = async (row: UpdateOrgInput | null = null) => {
	if (row !== null) {
		state.ruleForm = { ...row } as UpdateOrgInput;
		state.dialog.title = '修改部门';
		state.dialog.submitTxt = '修 改';
	} else {
		state.ruleForm.id = undefined;
		state.dialog.title = '新增部门';
		state.dialog.submitTxt = '新 增';
		nextTick(() => {
			deptDialogFormRef.value?.resetFields();
		});
	}
	state.dialog.isShowDialog = true;
	const { result } = await _orgSysService.treeSelect();
	state.deptData = (result as any) ?? [];
	state.dialog.loading = false;
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	deptDialogFormRef.value!.validate(async (v) => {
		if (v) {
			const { success } = state.ruleForm.id ? await _orgSysService.updateOrg(state.ruleForm) : await _orgSysService.addOrg(state.ruleForm);
			if (success) {
				closeDialog();
				emit('refresh');
			}
		}
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
<style scoped lang="scss"></style>
