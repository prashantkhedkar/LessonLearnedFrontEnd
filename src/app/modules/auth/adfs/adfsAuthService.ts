import { Log, UserManager, WebStorageStateStore, User } from "oidc-client-ts";
import { IDENTITY_CONFIG } from "./authConst";

interface AuthServiceProps {
    userManager: UserManager;
}

export default class AdfsAuthService {
    userManager: UserManager;

    constructor() {
        this.userManager = new UserManager({
            ...IDENTITY_CONFIG,
            userStore: new WebStorageStateStore({ store: window.sessionStorage }),
        });

        // Logger
        Log.setLogger(console);
        Log.setLevel(Log.DEBUG);

        this.userManager.events.addUserLoaded((user: User) => {
            if (window.location.href.indexOf("signin-oidc") !== -1) {
                this.navigateToScreen();
            }
        });

        this.userManager.events.addSilentRenewError((e) => {
            console.log("silent renew error", e.message);
        });

        this.userManager.events.addAccessTokenExpired(() => {
            console.log("token expired");
            this.signinSilent();
        });
    }

    signinRedirectCallback = () => {
        this.userManager.signinRedirectCallback().then(() => {
            // Do something after the redirect callback if needed
        });
    };

    getUser = async () => {
        const user = await this.userManager.getUser();
        if (!user) {
            return await this.userManager.signinRedirectCallback();
        }
        return user;
    };

    parseJwt = (token: string) => {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace("-", "+").replace("_", "/");
        return JSON.parse(window.atob(base64));
    };

    navigateToScreen = () => {
        window.location.replace("/en/dashboard");
    };

    isAuthenticated = () => {
        const oidcStorage = JSON.parse(
            sessionStorage.getItem(
                `oidc.user:${process.env.REACT_APP_AUTH_URL}:${process.env.REACT_APP_IDENTITY_CLIENT_ID}`
            ) || '{}'
        );

        return !!oidcStorage && !!oidcStorage.access_token;
    };

    signinSilent = () => {
        this.userManager
            .signinSilent()
            .then((user) => {

            })
            .catch((err) => {
                console.log(err);
            });
    };

    signinSilentCallback = () => {
        this.userManager.signinSilentCallback();
    };

    //createSigninRequest = () => {
        //return this.userManager.createSigninRequest();
    //};

    logout = () => {
        this.userManager.signoutRedirect({
            id_token_hint: localStorage.getItem("id_token") || "",
        });
        this.userManager.clearStaleState();
    };

    signoutRedirectCallback = () => {
        this.userManager.signoutRedirectCallback().then(() => {
            localStorage.clear();
            window.location.replace(process.env.REACT_APP_PUBLIC_URL || "");
        });
        this.userManager.clearStaleState();
    };
}