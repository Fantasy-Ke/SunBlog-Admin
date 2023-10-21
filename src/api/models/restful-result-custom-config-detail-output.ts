/* tslint:disable */
/* eslint-disable */
/**
 * 规范化接口演示
 * 让 .NET 开发更简单，更通用，更流行。
 *
 * OpenAPI spec version: 1.0.0
 * Contact: monksoul@outlook.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { CustomConfigDetailOutput } from './custom-config-detail-output';
/**
 * 
 * @export
 * @interface RESTfulResultCustomConfigDetailOutput
 */
export interface RESTfulResultCustomConfigDetailOutput {
    /**
     * 
     * @type {number}
     * @memberof RESTfulResultCustomConfigDetailOutput
     */
    statusCode?: number | null;
    /**
     * 
     * @type {CustomConfigDetailOutput}
     * @memberof RESTfulResultCustomConfigDetailOutput
     */
    data?: CustomConfigDetailOutput;
    /**
     * 
     * @type {boolean}
     * @memberof RESTfulResultCustomConfigDetailOutput
     */
    succeeded?: boolean;
    /**
     * 
     * @type {any}
     * @memberof RESTfulResultCustomConfigDetailOutput
     */
    errors?: any | null;
    /**
     * 
     * @type {any}
     * @memberof RESTfulResultCustomConfigDetailOutput
     */
    extras?: any | null;
    /**
     * 
     * @type {number}
     * @memberof RESTfulResultCustomConfigDetailOutput
     */
    timestamp?: number;
}
