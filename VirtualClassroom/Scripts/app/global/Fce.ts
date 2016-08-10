/* tslint:disable:max-line-length */

namespace VC.App.Global {
    "use strict";

    export class Fce {
        public static toTokenData(sData: string): TokenData {
            return <TokenData>JSON.parse(sData);
        }
        public static roleAsString(role: Roles): string {
            let e: any = Roles;
            for (let k in e) {
                if (e[k] === role) {
                    return k;
                }
            }
            return null;
        }
        public static toSimplifiedTimeString(ms: number): string {
            let m: number = Math.floor(ms / 60000);
            let time: string = "";
            if (m < 1) {
                time += "< 1 min";
            } else {
                time += m + " min";
            }
            return time;
        }
    }
}