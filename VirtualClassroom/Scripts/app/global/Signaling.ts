/* tslint:disable:max-line-length */

namespace VC.App.Global {
    "use strict";

    export enum SignalTypes {
        Unknown = 0,
        Connected = 1,  // used for PC, SC, TC => AC
        RaiseHand = 2,  // used for PC => SC
        TurnAv = 3,     // used for AC => PC, SC, TC
        Volume = 4,     // used for AC => PC, SC, TC
        TurnOff = 5,    // used for AC => PC, SC, TC
        Chat = 6,
        Forms = 7,
        FeaturedChanged = 8 // used for AC => FC
    }

    export interface ISignalRaiseHandData {
        raised: boolean;
    }
    export interface ISignalConnectedData {
        audio: boolean;
        video: boolean;
        volume: Array<number>;
    }
    export interface ISignalTurnAvData {
        audio?: boolean;
        video?: boolean;
    }
    export interface ISignalVolumeData {
        volume: Array<number>;
    }
    export interface ISignalTurnOffData {
    }

    export enum ChatType {
        Private = 0,
        Public = 1
    }
    export interface ISignalChatData {
        type: ChatType;
        userUid: string;
        userName: string;
        userRole: Roles;
        message: string;
    }
    export interface ISignalFormsData {
        formId: string;
        answerId: string;
        type: Forms.FormType;
        status: Forms.FormAnswerStatus;
        resultData: string;
    }
    export interface ISignalFeaturedChangedData {
    }

    export class Signaling {

        public static signalTypeAsString(type: SignalTypes): string {
            let e: any = SignalTypes;
            for (let k in e) { if (e[k] === type) { return k; } }
            return null;
        }

        public static sendSignal<T>(session: any, to: any, type: SignalTypes, data: T): void {
            session.signal({
                to: to,
                type: this.signalTypeAsString(type),
                data: JSON.stringify(data)
            }, (error: any): void => {
                if (error) {
                    console.log("Signal Error: " + error.message);
                }
            });
        }
        public static sendSignalAll<T>(session: any, type: SignalTypes, data: T): void {
            session.signal({
                type: this.signalTypeAsString(type),
                data: JSON.stringify(data)
            }, (error: any): void => {
                if (error) {
                    console.log("Signal Error: " + error.message);
                }
            });
        }

        public static getSignalType(type: string): SignalTypes {
            let signalType: SignalTypes = SignalTypes.Unknown;
            let signalPrefix: string = "signal:";
            switch (type.toLowerCase()) {
                case signalPrefix + this.signalTypeAsString(SignalTypes.Connected).toLowerCase():
                    signalType = SignalTypes.Connected;
                    break;
                case signalPrefix + this.signalTypeAsString(SignalTypes.RaiseHand).toLowerCase():
                    signalType = SignalTypes.RaiseHand;
                    break;
                case signalPrefix + this.signalTypeAsString(SignalTypes.TurnAv).toLowerCase():
                    signalType = SignalTypes.TurnAv;
                    break;
                case signalPrefix + this.signalTypeAsString(SignalTypes.Volume).toLowerCase():
                    signalType = SignalTypes.Volume;
                    break;
                case signalPrefix + this.signalTypeAsString(SignalTypes.TurnOff).toLowerCase():
                    signalType = SignalTypes.TurnOff;
                    break;
                case signalPrefix + this.signalTypeAsString(SignalTypes.Chat).toLowerCase():
                    signalType = SignalTypes.Chat;
                    break;
                case signalPrefix + this.signalTypeAsString(SignalTypes.Forms).toLowerCase():
                    signalType = SignalTypes.Forms;
                    break;
                case signalPrefix + this.signalTypeAsString(SignalTypes.FeaturedChanged).toLowerCase():
                    signalType = SignalTypes.FeaturedChanged;
                    break;
            }
            return signalType;
        }
    }

}