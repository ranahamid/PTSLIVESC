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
    }
    export interface IComputerData {
        Uid: string;
        Id: string;
        Key: string;
        ClassroomSetting: IClassroomConfig;
        ComputerSetting: IComputerConfig;
        Session: TokBoxSession;
        Group: Array<GroupComputer>
    }
    export interface IClassroomConfig {
    }
    export interface IComputerConfig {
        Audio: boolean;
        Video: boolean;
        Volume: Array<number>;
        Layout: number;
    }
    export interface GroupComputer {
        Uid: string;
        Id: string;
        Role: number;
        Position: number;
    }
}