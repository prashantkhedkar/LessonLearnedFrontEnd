import { useState } from "react";
import { IRole } from "../../../../models/global/globalGeneric";
import { Link } from "react-router-dom";
import { useLang } from "../../../../../_metronic/i18n/Metronici18n";
import { toAbsoluteUrl } from "../../../../../_metronic/helpers";
import { BtnLabeltxtMedium2 } from "../formsLabels/detailLabels";

interface MenuCategoryProps {
    url: string,
    createOnClick: Function,
    text: string
   
}

export const CreateButton=({...props}:MenuCategoryProps)=>{
    const lang = useLang();
    const [getAuthorizedRoles, setAuthorizedRoles] = useState<IRole[]>([]);
    return (
        <>
 {
              getAuthorizedRoles.filter((item) => item.actionName === "Create").length > 0 &&
              <Link className="prj-button-createdd MOD_btn btn-create" onClick={()=>props.createOnClick()}
                to={props.url}
                style={{ float: lang === "ar" ? "left" : "right" }}>
                <span className="prj-icon-stroke-plus">
                  <img src={toAbsoluteUrl('/media/svg/mod-specific/icon-stroke-plus.svg')} />
                </span>
                <BtnLabeltxtMedium2 text={props.text} />
                {/* //{'MOD.PROJECTMANAGEMENT.CREATEPROJECTS'} */}
              </Link>
            }

        </>
    )

}