import { defineStore } from 'pinia';
// import Cookies from 'js-cookie';
// import { Session } from '@/utils/storage';
import { computed, inject, reactive } from 'vue';
import { UsersServiceProxy, ZUserInfoOutput } from '@/shared/service-proxies';
import apiHttpClient from '@/utils/http';
const _usersCService = new UsersServiceProxy(inject('$baseurl'), apiHttpClient as any);

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfo = defineStore('userInfo', () => {
	const userInfoState = reactive({
		userInfo: {} as ZUserInfoOutput,
	});

	//用户信息
	const userInfo = computed(() => userInfoState.userInfo);

	/**
	 * 获取当前用户基本信息
	 */
	const getUserInfo = async () => {
		const { result } = await _usersCService.currentUserInfo();
		userInfoState.userInfo = result!;
	};
	return { userInfoState, userInfo, getUserInfo };
});
