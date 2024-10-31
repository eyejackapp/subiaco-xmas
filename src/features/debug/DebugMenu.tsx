import { DropdownMenu } from "./DropdownMenu";
export enum DebugMenuState {
    CLOSED,
    ONBOARDING,
    ARTWORKS_CLUE_NOTIFICATION,
    ARTWORK_FOUND_NOTIFICATION,
    ARTWORK_POPUP,
    SPLASH,
    HEADER,
    MEDIA_PREVIEW,
    CONGRATULATIONS,
}

type DebugMenuProps = {
    debugStateCallback: (state: DebugMenuState) => void;
};
export function DebugMenu({ debugStateCallback }: DebugMenuProps) {
    return (
        <div className="flex flex-col absolute z-50 pointer-events-auto">
            <DropdownMenu
                trigger={<button className="bg-[rgba(0,0,0,0.8)] p-3  w-[100px] text-white">Debug</button>}
                menu={[
                    <button
                        key={2}
                        className="py-3 px-2 bg-[rgba(0,0,0,0.7)] w-full hover:opacity-90"
                        onClick={() => debugStateCallback(DebugMenuState.ONBOARDING)}
                    >
                        Onboarding Modal
                    </button>,
                    <button
                        key={3}
                        className="py-3 px-2 bg-[rgba(0,0,0,0.7)] w-full hover:opacity-90"
                        onClick={() => debugStateCallback(DebugMenuState.ARTWORKS_CLUE_NOTIFICATION)}
                    >
                        Artwork Clue Notification
                    </button>,
                    <button
                        key={4}
                        className="py-3 px-2 bg-[rgba(0,0,0,0.7)] w-full hover:opacity-90"
                        onClick={() => debugStateCallback(DebugMenuState.ARTWORK_FOUND_NOTIFICATION)}
                    >
                        Artwork Found Notification
                    </button>,
                    <button
                        key={5}
                        className="py-3 px-2 bg-[rgba(0,0,0,0.7)] w-full hover:opacity-90"
                        onClick={() => debugStateCallback(DebugMenuState.ARTWORK_POPUP)}
                    >
                        Artwork Popup
                    </button>,
                    <button
                        key={6}
                        className="py-3 px-2 bg-[rgba(0,0,0,0.7)] w-full hover:opacity-90"
                        onClick={() => debugStateCallback(DebugMenuState.SPLASH)}
                    >
                        Splash
                    </button>,
                    <button
                        key={7}
                        className="py-3 px-2 bg-[rgba(0,0,0,0.7)] w-full hover:opacity-90"
                        onClick={() => debugStateCallback(DebugMenuState.HEADER)}
                    >
                        Header
                    </button>,
                    <button
                        key={8}
                        className="py-3 px-2 bg-[rgba(0,0,0,0.7)] w-full hover:opacity-90"
                        onClick={() => debugStateCallback(DebugMenuState.MEDIA_PREVIEW)}
                    >
                        Media Preview
                    </button>,
                    <button
                        key={9}
                        className="py-3 px-2 bg-[rgba(0,0,0,0.7)] w-full hover:opacity-90"
                        onClick={() => debugStateCallback(DebugMenuState.CONGRATULATIONS)}
                    >
                        Congratulations Modal
                    </button>,
                    <button
                        key={1}
                        className="py-3 px-2 bg-[rgba(255,255,255,0.8)] w-full text-black hover:opacity-90"
                        onClick={() => debugStateCallback(DebugMenuState.CLOSED)}
                    >
                        Clear
                    </button>,
                ]}
            />
        </div>
    );
}
