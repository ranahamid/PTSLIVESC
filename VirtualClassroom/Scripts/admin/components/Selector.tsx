/* tslint:disable:max-line-length */

namespace VC.Admin.Components {
    "use strict";

    interface ISelectorItemProps {
        item: ISelectorItem;
        selected: boolean;
    }
    interface ISelectorItemState {
    }

    class SelectorItem extends React.Component<ISelectorItemProps, ISelectorItemState> {
        constructor(props: ISelectorItemProps) {
            super(props);
        }

        render(): JSX.Element {
            return (<option value={this.props.item.id}>{this.props.item.name}</option>);
        }
    }

    enum SelectorStatus {
        Loading,
        Success,
        Error
    }

    interface IComputer {
        id: string;
        name: string;
    }
    interface ISelectorItem extends IComputer {
    }

    interface ISelectorProps {
        actionUrl: string;
        classroomId: string;
        loadAction: string;
        defaultName: string;
        className: string;
        onSelectedItemChanged: () => void;
    }
    interface ISelectorState {
        status: SelectorStatus;
        errorMessage: string;
        items: Array<ISelectorItem>;
        selectedValue: string;
        validationError: string;
    }

    export class Selector extends React.Component<ISelectorProps, ISelectorState> {
        private select: HTMLSelectElement;

        constructor(props: ISelectorProps) {
            super(props);
            this.state = { status: SelectorStatus.Loading, errorMessage: "", items: [], selectedValue: null, validationError: "" };
        }

        public init(selectedValue: string, includeId?: string): void {
            this.setState({ status: SelectorStatus.Loading, errorMessage: "", items: [], selectedValue: null, validationError: "" } as ISelectorState);
            $.ajax({
                cache:false,
                type: "GET",
                url: "/api/Classroom/" + this.props.classroomId + "/" + this.props.loadAction + (includeId != null ? "/" + includeId : ""),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<Array<IComputer>>): void => {
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        this.setState({ status: SelectorStatus.Success, errorMessage: "", items: r.data, selectedValue: selectedValue, validationError: "" } as ISelectorState);
                        this.select.value = (selectedValue === null ? "" : selectedValue);
                    } else {
                        this.setErrorMessage(r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    this.setErrorMessage("XHR Error - " + xhr.statusText);
                }
            });
        }

        private setErrorMessage(msg: string): void {
            this.setState({ status: SelectorStatus.Error, errorMessage: msg, items: this.state.items, selectedValue: this.state.selectedValue, validationError: "" } as ISelectorState);
        }

        public getSelectedValue(): string {
            return this.select.value;
        }
        public getSelectedText(): string {
            let text: string = "";
            let selectedValue: string = this.getSelectedValue();
            for (let i: number = 0; i < this.state.items.length && text === ""; i++) {
                if (this.state.items[i].id === selectedValue) {
                    text = this.state.items[i].name;
                }
            }
            return text;
        }

        private onSelectedItemChanged(): void {
            let selectedValue: string = this.getSelectedValue();
            this.state.selectedValue = selectedValue;
            this.props.onSelectedItemChanged();
        }

        public focus(): void {
            this.select.focus();
        }

        renderLoading(): JSX.Element {
            return (
                <select ref={(ref: HTMLSelectElement) => this.select = ref} disabled="true" className={this.props.className} style={{ color: "orange" }}>
                    <option>Loading ...</option>
                </select>
            );
        }
        renderError(): JSX.Element {
            return (
                <select ref={(ref: HTMLSelectElement) => this.select = ref} disabled="true" className={this.props.className}  style={{ color: "red" }}>
                    <option>{"ERROR:" + this.state.errorMessage}</option>
                </select>
            );
        }
        renderSelectorItems(): Array<JSX.Element> {
            let items: Array<JSX.Element> = [];
            for (let i: number = 0; i < this.state.items.length; i++) {
                items.push(<SelectorItem key={this.state.items[i].id} item={this.state.items[i]} selected={this.state.items[i].id === this.state.selectedValue} />);
            }
            return items;
        }
        renderSelector(): JSX.Element {
            let items: Array<JSX.Element> = this.renderSelectorItems();
            return (
                <select ref={(ref: HTMLSelectElement) => this.select = ref} className={this.props.className} onChange={this.onSelectedItemChanged.bind(this) }>
                    <option value="" style={{ color: "gray" }} selected={this.state.selectedValue === null}>== {this.props.defaultName} ==</option>
                    {items}
                </select>
            );
        }

        render(): JSX.Element {
            if (this.state.status === SelectorStatus.Loading) {
                return this.renderLoading();
            } else if (this.state.status === SelectorStatus.Error) {
                return this.renderError();
            } else {
                return this.renderSelector();
            }
        }
    }
}