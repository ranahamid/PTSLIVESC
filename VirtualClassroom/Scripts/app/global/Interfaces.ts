/* tslint:disable:max-line-length */

namespace VC.App.Global {
    "use strict";

    export class TokBoxSession {
        SessionId: string;
        Token: string;
    }
    export class TokenData {
        Uid: string;
        Name: string;
        Role: number;
        Position: number;
    }
    export interface IComputerData {
        Uid: string;
        Key: string;
        ClassroomSetting: IClassroomConfig;
        ComputerSetting: IComputerConfig;
        ScSession?: TokBoxSession;
        TcSession?: TokBoxSession;
        AcSession?: TokBoxSession;
    }
    export interface IClassroomConfig {
    }
    export interface IComputerConfig {
        Audio: boolean;
        Video: boolean;
        Volume: Array<number>;
    }
}