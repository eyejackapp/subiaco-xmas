import { VNode } from 'preact';
import { useState } from 'preact/hooks';
type DropdownProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trigger: VNode<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu: VNode<any>[];
};
export function DropdownMenu({ trigger, menu }: DropdownProps) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(!open);
    };

    return (
        <div className="dropdown">
            <div onClick={handleOpen}>{trigger}</div>
            {open && menu ? (
                <ul className="menu w-[250px] border-2 border-gray-500">
                    {menu.map(
                        (menuItem, index: number) =>
                            menuItem && (
                                <li key={index} className="menu-item">
                                    <div
                                        onClick={() => {
                                            menuItem.props.onClick();
                                            setOpen(false);
                                        }}
                                    >
                                        {menuItem}
                                    </div>
                                </li>
                            ),
                    )}
                </ul>
            ) : null}
        </div>
    );
}
