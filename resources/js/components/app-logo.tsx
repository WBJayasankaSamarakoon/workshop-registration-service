import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white flex aspect-square size-9 items-center justify-center rounded-xl shadow-sm">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="flex flex-col text-left">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">Workshop Hub</span>
                <span className="text-[10px] font-medium text-slate-400 mt-0.5">Management Portal</span>
            </div>
        </div>
    );
}
