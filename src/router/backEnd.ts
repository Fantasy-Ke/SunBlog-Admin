import { RouteRecordRaw } from 'vue-router';
import { useUserInfo } from '@/stores/userInfo';
// import { useRequestOldRoutes } from '@/stores/requestOldRoutes';
import pinia from '@/stores/index';
import { Session } from '@/utils/storage';
import { NextLoading } from '@/utils/loading';
import { dynamicRoutes, notFoundAndNoPower } from '@/router/route';
import { formatTwoStageRoutes, formatFlatteningRoutes, router } from '@/router/index';
import { useRoutesList } from '@/stores/routesList';
import { useTagsViewRoutes } from '@/stores/tagsViewRoutes';
import { accessTokenKey } from '@/utils/request';
import apiHttpClient from '@/utils/http';
import { inject } from 'vue';
import { MenusServiceProxy } from '@/shared/service-proxies';
const _menuService = new MenusServiceProxy(inject('$baseurl'), apiHttpClient as any);

// 后端控制路由

/**
 * 获取目录下的 .vue、.tsx 全部文件
 * @method import.meta.glob
 * @link 参考：https://cn.vitejs.dev/guide/features.html#json
 */
const layouModules: any = import.meta.glob('../layout/routerView/*.{vue,tsx}');
const viewsModules: any = import.meta.glob('../views/**/*.{vue,tsx}');
const dynamicViewsModules: Record<string, Function> = Object.assign({}, { ...layouModules }, { ...viewsModules });

/**
 * 后端控制路由：初始化方法，防止刷新时路由丢失
 * @method NextLoading 界面 loading 动画开始执行
 * @method useUserInfo().setUserInfos() 触发初始化用户信息 pinia
 * @method useRequestOldRoutes().setRequestOldRoutes() 存储接口原始路由（未处理component），根据需求选择使用
 * @method setAddRoute 添加动态路由
 * @method setFilterMenuAndCacheTagsViewRoutes 设置路由到 pinia routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
 */
export async function initBackEndControlRoutes() {
	// 界面 loading 动画开始执行
	if (window.nextLoading === undefined) NextLoading.start();
	// 无 token 停止执行下一步
	if (!Session.get(accessTokenKey)) return false;
	// 触发初始化用户信息 pinia
	// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
	await useUserInfo().getUserInfo();
	// 获取路由菜单数据
	const data = await getBackEndControlRoutes();
	// 无登录权限时，添加判断
	// https://gitee.com/lyt-top/vue-next-admin/issues/I64HVO
	const routeList = data ?? [];
	if (routeList.length === 0) return Promise.resolve(true);
	// 存储接口原始路由（未处理component），根据需求选择使用
	// useRequestOldRoutes().setRequestOldRoutes(JSON.parse(JSON.stringify(data ?? [])));
	// 处理路由（component），替换 dynamicRoutes（@/router/route）第一个顶级 children 的路由

	//静态路由
	let staticRoute = [
		{
			path: '/personal',
			name: 'personal',
			component: 'personal/index',
			meta: {
				title: '个人中心',
				isHide: true,
				isKeepAlive: true,
			},
		},
		{
			path: '/system/config/design',
			name: 'configDesign',
			component: 'system/config/design',
			meta: {
				title: '配置设计',
				isKeepAlive: false,
				isHide: true,
			},
		},
		{
			path: '/system/config/render',
			name: 'configRender',
			component: 'system/config/render',
			meta: {
				title: '编辑配置项',
				isKeepAlive: false,
				isHide: true,
			},
		},
		{
			path: '/system/config/items',
			name: 'configItems',
			component: 'system/config/itemList',
			meta: {
				title: '配置项列表',
				isKeepAlive: false,
				isHide: true,
			},
		},
		{
			path: '/blog/article/operate',
			name: 'articleOperate',
			component: 'blog/article/operate',
			meta: {
				title: '新增文章',
				isKeepAlive: false,
				isHide: true,
			},
		},
	];
	dynamicRoutes[0].children = await backEndComponent([...routeList, ...staticRoute]);
	// dynamicRoutes[0].children = await backEndComponent(routeList);
	// 添加动态路由
	await setAddRoute();
	// 设置路由到 pinia routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
	setFilterMenuAndCacheTagsViewRoutes();
}

/**
 * 设置路由到 pinia routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
 * @description 用于左侧菜单、横向菜单的显示
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export async function setFilterMenuAndCacheTagsViewRoutes() {
	const storesRoutesList = useRoutesList(pinia);
	storesRoutesList.setRoutesList(dynamicRoutes[0].children as any);
	setCacheTagsViewRoutes();
}

/**
 * 缓存多级嵌套数组处理后的一维数组
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export function setCacheTagsViewRoutes() {
	const storesTagsView = useTagsViewRoutes(pinia);
	storesTagsView.setTagsViewRoutes(formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes))[0].children);
}

/**
 * 处理路由格式及添加捕获所有路由或 404 Not found 路由
 * @description 替换 dynamicRoutes（@/router/route）第一个顶级 children 的路由
 * @returns 返回替换后的路由数组
 */
export function setFilterRouteEnd() {
	let filterRouteEnd: any = formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes));
	// notFoundAndNoPower 防止 404、401 不在 layout 布局中，不设置的话，404、401 界面将全屏显示
	// 关联问题 No match found for location with path 'xxx'
	filterRouteEnd[0].children = [...filterRouteEnd[0].children, ...notFoundAndNoPower];
	return filterRouteEnd;
}

/**
 * 添加动态路由
 * @method router.addRoute
 * @description 此处循环为 dynamicRoutes（@/router/route）第一个顶级 children 的路由一维数组，非多级嵌套
 * @link 参考：https://next.router.vuejs.org/zh/api/#addroute
 */
export async function setAddRoute() {
	await setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
		router.addRoute(route);
	});
}

/**
 * 请求后端路由菜单接口
 * @description isRequestRoutes 为 true，则开启后端控制路由
 * @returns 返回后端路由菜单数据
 */
export async function getBackEndControlRoutes() {
	const { result } = await _menuService.permissionMenus();
	return result;
}

/**
 * 重新请求后端路由菜单接口
 * @description 用于菜单管理界面刷新菜单（未进行测试）
 * @description 路径：/src/views/system/menu/component/addMenu.vue
 */
export async function setBackEndControlRefreshRoutes() {
	await getBackEndControlRoutes();
}

/**
 * 后端路由 component 转换
 * @param routes 后端返回的路由表数组
 * @returns 返回处理成函数后的 component
 */
export function backEndComponent(routes: any) {
	if (!routes) return;
	return routes.map((item: any) => {
		if (item.component === '') {
			item.component = 'layout/routerView/parent';
		}
		if (item.component) item.component = dynamicImport(dynamicViewsModules, item.component as string);
		item.children && item.children.length > 0 && backEndComponent(item.children);
		return item;
	});
}

/**
 * 后端路由 component 转换函数
 * @param dynamicViewsModules 获取目录下的 .vue、.tsx 全部文件
 * @param component 当前要处理项 component
 * @returns 返回处理成函数后的 component
 */
export function dynamicImport(dynamicViewsModules: Record<string, Function>, component: string) {
	const keys = Object.keys(dynamicViewsModules);
	const matchKeys = keys.filter((key) => {
		const k = key.replace(/..\/views|../, '');
		return k.startsWith(`${component}`) || k.startsWith(`/${component}`);
	});
	if (matchKeys?.length === 1) {
		const matchKey = matchKeys[0];
		return dynamicViewsModules[matchKey];
	}
	if (matchKeys?.length > 1) {
		return false;
	}
}
