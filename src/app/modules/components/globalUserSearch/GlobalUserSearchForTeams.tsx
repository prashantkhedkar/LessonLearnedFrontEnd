import { ChangeEvent, useEffect, useState } from 'react';
import { BtnLabelCanceltxtMedium2, BtnLabeltxtMedium2, DetailLabels, LabelTextSemibold1 } from '../common/formsLabels/detailLabels'
import { useIntl } from 'react-intl';
import { useAppDispatch } from '../../../../store';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import { addUpdateAssignee, fetchUserListAsync } from '../../services/globalSlice';
import { IUserSearchPersonModel, PersonModel, addUpdatePersonModelInitialValue } from '../../../models/global/personModel';
import NoRecordsAvailable from '../noRecordsAvailable/NoRecordsAvailable';
import { writeToBrowserConsole } from '../../utils/common';
import { Checkbox, Chip, Divider } from '@mui/material';
import "./GlobalUserSearch.css"

interface props {
    sendToParent: Function
}
export default function GlobalUserSearchForTeams({ sendToParent }: props) {
    const intl = useIntl();
    const lang = useLang();

    const [getMilitaryNumber, setMilitaryNumber] = useState("");
    const [getUNumber, setUNumber] = useState("");
    const [getName, setName] = useState("");
    const [searchError, setSearchError] = useState("");

    useEffect(() => {
        let formDataObject: IUserSearchPersonModel = {
            pageNumber: 0,
            rowsPerPage: 2000,
            militaryNumber: '',
            unumber: '',
            name: '',
            allowUnitSearch: false
        };
    }, []);

    // Event Handler
    const handleOnSearch = () => {
        //console.log("Global User Search - handleOnSearch");
        if (getMilitaryNumber.toString().trim() === "" && getUNumber.toString().trim() === "" && getName.toString().trim() === "") {
            setSearchError(intl.formatMessage({ id: 'MOD.GLOBAL.SEARCH.PARAMETER.MANDATORY' }));
            return;
        } else {
            setSearchError("");
        }

        let formDataObject: IUserSearchPersonModel = {
            militaryNumber: getMilitaryNumber,
            unumber: getUNumber,
            name: getName,
            pageNumber: 0,
            rowsPerPage: 2000,
            allowUnitSearch: false
        };

        sendToParent(formDataObject);
    };

    // Helper Function
    const handleOnChangeTextLengthValidation = (e: any, fieldName: string, allowedFieldLength: number) => {
        try {
            if (fieldName === "setUserName") {
                setMilitaryNumber(e.target.value);
            }

            if (fieldName === "setUNumber") {
                setUNumber(e.target.value);
            }

            if (fieldName === "setName") {
                setName(e.target.value);
            }
        } catch (e) {
            writeToBrowserConsole("Error at handleOnChangeTextLengthValidation " + e);
        }
    };

    // Help Function
    const handleOnClearFields = () => {
        setMilitaryNumber("");
        setUNumber("");
        setName("");

        setSearchError("");

        let formDataObject: IUserSearchPersonModel = {
            militaryNumber: "",
            unumber: "",
            name: "",
            pageNumber: 0,
            rowsPerPage: 10,
            allowUnitSearch: false
        };

        sendToParent(formDataObject);        
    };

    return (
        <>
            {/* Search Parameters */}
            <div className="row mt-2">
                <div className="col-lg-6 col-md-6">
                    <DetailLabels style={{}} text={"MOD.GLOBAL.SEARCH.USERNAME.LABEL"} isRequired={false} />
                    <input
                        type="text"
                        autoComplete="off"
                        maxLength={50}
                        value={getMilitaryNumber}
                        className="form-control form-control-solid active input5 lbl-text-regular-2"
                        placeholder={intl.formatMessage({ id: 'MOD.SHAREDFILES.PLACEHOLDER.USERNAME' })}
                        onChange={(e) => handleOnChangeTextLengthValidation(e, "setUserName", 50)}
                        name="groupName"
                    />
                </div>
                <div className="col-lg-6 col-md-6">
                    <DetailLabels style={{}} text={"MOD.GLOBAL.SEARCH.UNUMBER.LABEL"} isRequired={false} />
                    <input
                        type="text"
                        autoComplete="off"
                        maxLength={50}
                        value={getUNumber}
                        className="form-control form-control-solid active input5 lbl-text-regular-2"
                        placeholder={intl.formatMessage({ id: 'MOD.SHAREDFILES.PLACEHOLDER.UNUMBER' })}
                        onChange={(e) => handleOnChangeTextLengthValidation(e, "setUNumber", 50)}
                        name="groupName"
                    />
                </div>
            </div>

            {/* Search Parameters */}
            <div className="row mt-2">
                <div className="col-lg-12 col-md-12">
                    <DetailLabels style={{}} text={"MOD.GLOBAL.SEARCH.NAME.LABEL"} isRequired={false} />
                    <input
                        type="text"
                        autoComplete="off"
                        maxLength={50}
                        value={getName}
                        className="form-control form-control-solid active input5 lbl-text-regular-2"
                        placeholder={intl.formatMessage({ id: 'MOD.SHAREDFILES.PLACEHOLDER.NAME' })}
                        onChange={(e) => handleOnChangeTextLengthValidation(e, "setName", 50)}
                        name="groupName"
                    />
                </div>
            </div>

            {/* Error Message */}
            <div className="row mt-2">
                <div className='col-lg-6'>
                    <div className={"error"}>{searchError}</div>
                </div>
            </div>

            {/* User Search Button */}
            <div className="row mt-2">
                <div className="col-auto">
                    <button className="btn MOD_btn btn-create" onClick={handleOnSearch}>
                        <BtnLabeltxtMedium2 text={'MOD.GLOBAL.BUTTON.SEARCH'} />
                    </button>
                </div>
                <div className="col-auto">
                    <button
                        className="btn MOD_btn btn-cancel"
                        onClick={handleOnClearFields}>
                        <BtnLabelCanceltxtMedium2 text={'MOD.SHAREDFILES.BUTTON.RESETUSER'} />
                    </button>
                </div>
            </div>
        </>
    )
}