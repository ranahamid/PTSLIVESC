/* tslint:disable:max-line-length */

namespace VC.Global.Data {
    "use strict";

    export const RESPONSE_SUCCESS: string = "success";
    export const RESPONSE_ERROR: string = "error";

    export interface IDataResponse<T> {
        status: string;
        message?: string;
        data?: T;
    }
}
