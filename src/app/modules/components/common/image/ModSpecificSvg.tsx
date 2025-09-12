

import { toAbsoluteUrl } from "../../../../../_metronic/helpers"

interface props {
    name: string;
    myClass?: string
}
export const ModSpecificSvg = ({ name, myClass }: props) => {

    return (

        <img src={toAbsoluteUrl(`/media/svg/mod-specific/${name}.svg`)} className={myClass} />
    )
}
export const FileTypeSvg = ({ name }) => {
    return (
        <img src={toAbsoluteUrl(`/media/svg/mod-specific/fileType/${name}.svg`)} className="svg-icon" />
    )
}
export const ColoredFileTypeSvg = ({ name }) => {
    return (
        <img src={toAbsoluteUrl(`/media/svg/filetypes-icons/${name}.svg`)} className="svg-filetype-icon" />
    )
}

export const ColoredFolderTypeSvg = ({ name }) => {
    return (
        <img src={toAbsoluteUrl(`/media/svg/foldertype-icons/${name}.svg`)} className="svg-filetype-icon" />
    )
}