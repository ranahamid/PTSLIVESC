/* tslint:disable:max-line-length */

namespace VC.Global.Components {
    "use strict";

    export interface ITabItemProps {
        id: number;
        title: string;
        badge?: number;
        onClick: (id: number) => void;
        active: boolean;
        hidden?: boolean;
    }
    interface ITabItemState {
    }

    class TabItem extends React.Component<ITabItemProps, ITabItemState> {
        constructor(props: ITabItemProps) {
            super(props);
        }

        onClick(): void {
            if (!this.props.active) {
                this.props.onClick(this.props.id);
            }
        }

        render(): JSX.Element {
            let className: string = this.props.active ? "active" : "";
            let title: string = this.props.title;
            let badge: JSX.Element = (<span></span>);
            if (this.props.badge !== null) {
                badge = (<span className="badge" style={{ backgroundColor: (this.props.badge > 0 ? "green" : "gray") }}>{this.props.badge}</span>);
            }
            if (this.props.badge != null) {
                title = title + " ";
            }
            return (
                <li className={className} style={{ display: (this.props.hidden ? "none" : "inline-block") }}><a className="link" onClick={() => this.onClick() }>{title}{badge}</a></li>
            );
        }
    }


    interface ITabsProps {
        items: Array<ITabItemProps>;
        className: string;
    }
    interface ITabsState {
        active: Array<boolean>;
        badges: Array<number>;
        hidden: Array<boolean>;
    }

    export class Tabs extends React.Component<ITabsProps, ITabsState> {
        constructor(props: ITabsProps) {
            super(props);
            this.setInitialState();
        }

        private setInitialState(): void {
            let a: Array<boolean> = [];
            let b: Array<number> = [];
            let h: Array<boolean> = [];
            this.props.items.forEach((item: ITabItemProps) => { a.push(item.active); b.push(item.badge); h.push(false); });
            this.state = { active: a, badges: b, hidden: h };
        }

        public getSelectedItem(): number {
            let selectedItem: number = null;
            for (let i: number = 0; i < this.props.items.length && selectedItem === null; i++) {
                if (this.state.active[i]) {
                    selectedItem = this.props.items[i].id;
                }
            }
            return selectedItem;
        }
        public selectItem(id: number): void {
            let a: Array<boolean> = [];
            this.props.items.forEach((item: ITabItemProps) => { a.push(item.id === id); });
            this.setState({ active: a, badges: this.state.badges } as ITabsState);
        }
        public updateBadge(id: number, badge?: number): void {
            let b: Array<number> = [];
            for (let i: number = 0; i < this.props.items.length; i++) {
                if (this.props.items[i].id === id) {
                    b.push(badge);
                } else {
                    b.push(this.state.badges[i]);
                }
            }
            this.setState({ active: this.state.active, badges: b } as ITabsState);
        }
        private changeBadge(id: number, by: number): void {
            let found: boolean = false;
            for (var i: number = 0; i < this.props.items.length && !found; i++) {
                if (this.props.items[i].id === id) {
                    let b: number = this.state.badges[i] + by;
                    this.updateBadge(id, b);
                    found = true;
                }
            }
        }
        public increaseBadge(id: number): void {
            this.changeBadge(id, +1);
        }
        public decreaseBadge(id: number): void {
            this.changeBadge(id, -1);
        }

        private changeHiddenState(id: number, hidden: boolean): void {
            let found: boolean = false;
            for (var i: number = 0; i < this.props.items.length && !found; i++) {
                if (this.props.items[i].id === id) {
                    this.state.hidden[i] = hidden;
                    found = true;
                }
            }
            this.setState(this.state);
        }
        public hideTab(id: number): void {
            this.changeHiddenState(id, true);
        }
        public showTab(id: number): void {
            this.changeHiddenState(id, false);
        }

        render(): JSX.Element {
            let items: Array<JSX.Element> = [];
            for (let i: number = 0; i < this.props.items.length; i++) {
                items.push(<TabItem key={this.props.items[i].id} id={this.props.items[i].id} title={this.props.items[i].title} onClick={this.props.items[i].onClick.bind(this) } badge={this.state.badges[i]} active={this.state.active[i]} hidden={this.state.hidden[i]} />);
            }

            return (
                <div className={this.props.className}>
                    <ul className="nav nav-tabs">
                        {items}
                    </ul>
                </div>
            );
        }
    }
}