import { IRoleAcces } from "../../models/global/globalGeneric";

const getAuthorizedUser = (userRoleAccess: IRoleAcces[], moduleName: string, moduleActions: string, roleName?: string) => {
    try {
        let roleOutput: IRoleAcces[] = [];

        if (!roleName || roleName.trim() === "") {
            roleOutput = userRoleAccess && userRoleAccess
                .filter((item) => item.moduleName.trim().toLowerCase() === moduleName.trim().toLowerCase());
        } else {
            roleOutput = userRoleAccess && userRoleAccess
                .filter((item) => item.moduleName.trim().toLowerCase() === moduleName.trim().toLowerCase() && item.roleName.trim().toLowerCase() === roleName.trim().toLowerCase());
        }

        if (roleOutput && roleOutput.length > 0) {
            return roleOutput[0].actions.filter((action) => action.actionName.trim().toLowerCase() === moduleActions.trim().toLowerCase()).length > 0;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

export default getAuthorizedUser;