//This is Simple Helper functions to Manage Loader Status of Attachment in Localstorage
//HOT FIX

export function SetAttachmentLoaderStatus(uniqueKey:any,value:any) {
    try {
        localStorage.setItem(uniqueKey+"_legal-isAttachmentLoading", value);
    } catch (e) {
        console.log(e);
    }
}

export function GetAttachmentLoaderStatus(uniqueKey:any) {
    try {
        return localStorage.getItem(uniqueKey+"_legal-isAttachmentLoading") || false;
    } catch (e) {
        return "false"
        console.log(e);
    }
}