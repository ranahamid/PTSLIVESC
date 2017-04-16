/* tslint:disable:max-line-length */

namespace VC.App.Global {
    "use strict";

    export class TokBoxSession {
        SessionId: string;
        Token: string;
    }
    export class TokenData {
        Uid: string;
        Id: string;
        Name: string;
        Role: number;
        Seat: string;
        Address1: string;
        State: string;
        City: string;
        ZipCode: string;
        Country: string;
    }
    export interface IComputerData {
        Uid: string;
        Id: string;
        Key: string;
        ComputerSetting: IComputerConfig;
        Session: TokBoxSession;
        Group: Array<GroupComputer>
    }
    export interface IComputerConfig {
        Audio: boolean;
        Video: boolean;
        Volume: number;
    }
    export interface GroupComputer {
        Uid: string;
        Id: string;
        Role: number;
        Position: number;
        Seat: string;
    }
}