/* tslint:disable */
/* eslint-disable */
/**
 * 后端接口
 * 让 .NET 开发更简单，更通用，更流行。
 *
 * OpenAPI spec version: 1.0.0
 * Contact: monksoul@outlook.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { SigninLogPageOutput } from './signin-log-page-output';
/**
 * 
 * @export
 * @interface PageResultSigninLogPageOutput
 */
export interface PageResultSigninLogPageOutput {
    /**
     * 当前页
     * @type {number}
     * @memberof PageResultSigninLogPageOutput
     */
    pageNo?: number;
    /**
     * 页容量
     * @type {number}
     * @memberof PageResultSigninLogPageOutput
     */
    pageSize?: number;
    /**
     * 总页数
     * @type {number}
     * @memberof PageResultSigninLogPageOutput
     */
    pages?: number;
    /**
     * 总条数
     * @type {number}
     * @memberof PageResultSigninLogPageOutput
     */
    total?: number;
    /**
     * 数据
     * @type {Array<SigninLogPageOutput>}
     * @memberof PageResultSigninLogPageOutput
     */
    rows?: Array<SigninLogPageOutput> | null;
}
