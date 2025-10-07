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
    onUsersAdd: Function
    isSingleSelection?: boolean
    allowUnitSearch?: boolean
}
export default function GlobalUserSearch({ onUsersAdd, isSingleSelection = false, allowUnitSearch = true }: props) {
    const intl = useIntl();
    const lang = useLang();

    // Data Model
    const [modelData, setModelData] = useState<PersonModel[]>([]);
    const [selectedDataModel, setSelectedDataModel] = useState<PersonModel[]>([]);

    // InfinityScroll Component
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);
    const [totalRows, setTotalRows] = useState(1000);
    const [hasMore, setHasMore] = useState(false);

    const [getMilitaryNumber, setMilitaryNumber] = useState("");
    const [getUNumber, setUNumber] = useState("");
    const [getName, setName] = useState("");
    const [searchError, setSearchError] = useState("");
    const [saveError, setSaveError] = useState("");

    // API
    const dispatch = useAppDispatch();

    useEffect(() => {
        //console.log("Global User Search - UseEffect");
        setModelData([]);
        loadDefaultUserData();
    }, []);

    const loadDefaultUserData = () => {
        let formDataObject: IUserSearchPersonModel = {
            pageNumber: pageNumber,
            rowsPerPage: rowsPerPage,
            militaryNumber: '',
            unumber: '',
            name: '',
            allowUnitSearch: true
        };
        setRowsPerPage(rowsPerPage);
        searchUsers(formDataObject);
    }

    const searchUsers = (formDataObject: IUserSearchPersonModel) => {
        //console.log("Global User Search - searchUsers " + JSON.stringify(searchUsers));
        dispatch(fetchUserListAsync({ formDataObject }))
            .then((response) => {
                //console.log("Global User Search - searchUsers-response " + JSON.stringify(response));
                try {
                    var output = response.payload.data as PersonModel[];
                    //console.log("Global User Search - searchUsers-output " + JSON.stringify(output));

                    if (output && output.length > 0) {
                        setModelData(output);

                        //setTotalRows(output[0].totalRowCount!);

                        if (totalRows > rowsPerPage) {
                            setHasMore(true);
                        } else {
                            setHasMore(false);
                        }
                    } else {
                        setModelData([]);
                        setTotalRows(0);
                        setHasMore(false);
                    }
                } catch (e) {
                    writeToBrowserConsole(e);
                }
            })
    };

    const fetchMore = (formDataObject: IUserSearchPersonModel) => {
        dispatch(fetchUserListAsync({ formDataObject }))
            .then((response) => {
                var output = response.payload.data as PersonModel[];

                if (output && output.length > 0) {

                    setModelData((prevItems) => [...prevItems, ...output]);
                    //setTotalRows(output[0].totalRowCount!);

                    if (totalRows > rowsPerPage) {
                        setHasMore(true);
                    } else {
                        setHasMore(false);
                    }
                } else {
                    if(modelData && modelData.length === 0){
                        setModelData([]);
                        setTotalRows(0);
                    }
                    setHasMore(false);
                }
            })
    };

    const fetchData = () => {
        //console.log("fetch global user search");
        let rowpage = rowsPerPage;
        let pageNo = pageNumber + 1;
        setPageNumber(pageNo);
        let formDataObject: IUserSearchPersonModel = {
            militaryNumber: getMilitaryNumber,
            unumber: getUNumber,
            name: getName,
            pageNumber: pageNo,
            rowsPerPage: rowpage,
            allowUnitSearch: allowUnitSearch
        }

        if (modelData.length === 0) {
            formDataObject = {
                ...formDataObject,
                pageNumber: 0,
                rowsPerPage: rowsPerPage
            }

            setPageNumber(0);

            setTimeout(() => {
                fetchMore(formDataObject);
            }, 500);
        }
        else if (modelData.length < totalRows) {
            //rowpage = rowsPerPage + 10;
            formDataObject = {
                ...formDataObject,
                pageNumber: pageNo,
                rowsPerPage: rowsPerPage
            }
            setTimeout(() => {
                //setRowsPerPage(rowpage);
                fetchMore(formDataObject);
                setHasMore(true);
            }, 500);
        }
        else {
            setHasMore(false);
        }
    };

    // Event Handler
    const handleOnSearch = () => {
        setModelData([]);
        
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
            rowsPerPage: rowsPerPage,
            allowUnitSearch: allowUnitSearch
        };
        setPageNumber(0);
        setRowsPerPage(rowsPerPage);
        searchUsers(formDataObject);
    };

    // Event Handler
    const handleOnChecked = (event, pModel: PersonModel) => {
        pModel.name = pModel.fullName;
        let filteredItem: PersonModel[] = [];
        if (event.target.checked === false) {
            filteredItem = selectedDataModel.filter((item) => item.personId !== pModel.personId);
            setSelectedDataModel([...filteredItem]);
        } else {
            setSelectedDataModel(prev => [...prev, pModel]);
            AddUpdateUsers(pModel);
        }
    };

    const AddUpdateUsers = (pModel: PersonModel) => {
        try {
            let addUpdateUserModel = addUpdatePersonModelInitialValue;
            addUpdateUserModel.data = pModel;
            dispatch(addUpdateAssignee({ formDataObject: addUpdateUserModel }));
        } catch (e) {
            writeToBrowserConsole("Error at AddUpdateUsers " + e);
        }
    };

    // Event Handler
    const handleOnAdd = () => {
        if (selectedDataModel.length > 0) {
            onUsersAdd(selectedDataModel);
        } else {
            setSaveError(intl.formatMessage({ id: "MOD.SHAREDFILES.VALIDATION.CREATEGROUPMEMBER" }))
        }
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
        setPageNumber(0);

        setSearchError("");
        setSaveError("");

        setModelData([]);
        setSelectedDataModel([]);
        loadDefaultUserData();
    };

    const handleOnSelectClick = (pModel: PersonModel) => {
        pModel.name = pModel.fullName;
        onUsersAdd([pModel]);
        AddUpdateUsers(pModel);
    };

    const handleUserRowClick = (e, pModel: PersonModel) => {
        pModel.name = pModel.fullName;
        let filteredItem: PersonModel[] = [];
        let isUserExists = selectedDataModel.some((item) => item.personId === pModel.personId);
        if (!isUserExists) {
            setSelectedDataModel(prev => [...prev, pModel]);
            AddUpdateUsers(pModel);
        } else {
            let filteredItem: PersonModel[] = [];
            filteredItem = selectedDataModel.filter((item) => item.personId !== pModel.personId);
            setSelectedDataModel([...filteredItem]);
        }

        //console.log(JSON.stringify(selectedDataModel));
    }


    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleOnSearch();
        }
    }

    const getUserRankAndName = (name:string, rank?:string) => {
        if(rank && rank.length > 0){
            return rank + " " + name;
        } else {
            return name;
        }
    }

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
                        onKeyDown={handleKeyDown} />
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
                        onKeyDown={handleKeyDown} />
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
                        onKeyDown={handleKeyDown} />
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

            {/* Line Divider */}
            {
                (modelData && modelData.length > 0) &&
                <div className='mt-5'>
                    <Divider>
                        <Chip label={intl.formatMessage({ id: 'MOD.GLOBAL.SEARCH.SEARCHRESULT.LABEL' })} size="small" />
                    </Divider>
                </div>
            }

            {/* Grid */}
            <div className='row mt-5'>
                <div className='col-lg-12 col-md-12'>

                    {

                        (modelData && modelData.length > 0) &&
                        <div id="scrollableDivModalPopupUserSearch"
                            style={{
                                height: '17rem',
                                overflow: 'auto',
                            }}>
                            <InfiniteScroll
                                dataLength={modelData.length}
                                next={fetchData}
                                hasMore={hasMore}
                                loader={modelData.length > 10 ? <><div style={{ textAlign: "center" }}><h6>{intl.formatMessage({ id: 'MOD.LOADINGMORE' })}</h6></div></> : ""}
                                inverse={false}
                                scrollableTarget="scrollableDivModalPopupUserSearch">
                                <table className="table create-project-task-ms table-striped table-bordered">
                                    <thead>
                                        {isSingleSelection ?
                                        <></>
                                        :                                        
                                        <th>
                                        </th>
                                        }
                                        <th>
                                            <LabelTextSemibold1 isI18nKey={true} text={"MOD.GLOBAL.SEARCH.NAME.LABEL"} />
                                        </th>
                                        <th>
                                            <LabelTextSemibold1 isI18nKey={true} text={"MOD.PERSON.UNIT"} />
                                        </th>
                                        <th>
                                            <LabelTextSemibold1 isI18nKey={true} text={"MOD.GLOBAL.SEARCH.USERNAME.LABEL"} />
                                        </th>
                                    </thead>
                                    <tbody>
                                        {
                                            modelData.map((item, index) => (
                                                <tr key={item.personId} className={'user-list-row'} onClick={(e) => { isSingleSelection ? handleOnSelectClick(item) : handleUserRowClick(e, item) }}>
                                                    {isSingleSelection ?
                                                        <></>
                                                        :
                                                        <td className="w-5px" ref={el => {
                                                            if (el) {
                                                                el.style.setProperty('padding-top', '0', 'important');
                                                            }
                                                        }}>
                                                            <Checkbox
                                                                edge="start"
                                                                //onChange={(e) => handleOnChecked(e, item)}
                                                                tabIndex={-1}
                                                                disableRipple
                                                                sx={{
                                                                    "& .MuiSvgIcon-root": { border: "1px" },
                                                                    "&.Mui-checked": {
                                                                        color: "#B7945A",
                                                                    },
                                                                }}
                                                                //checked={checkIfUserIsSelected(item)}
                                                                checked={selectedDataModel && selectedDataModel.map(u => u.personId).includes(item.personId)}
                                                            />
                                                        </td>
                                                    }
                                                    <td>
                                                        <LabelTextSemibold1 isI18nKey={false} text={(lang === 'en') ? getUserRankAndName(item.fullName.en, item.rank) :  getUserRankAndName(item.fullName.ar, item.rank)} />
                                                    </td>
                                                    <td>
                                                        <LabelTextSemibold1 isI18nKey={false} text={(lang === 'en') ? item.unit.en : item.unit.ar} />
                                                    </td>
                                                    <td>
                                                        <LabelTextSemibold1 isI18nKey={false} text={item.militaryNumber} />
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </InfiniteScroll>
                        </div>
                    }
                </div>
            </div>

            {/* Error Message */}
            <div className="row mt-2">
                <div className='col-lg-6'>
                    <div className={"error"}>{saveError}</div>
                </div>
            </div>

            {/* No Records Found */}
            {
                (!modelData || modelData.length === 0) &&
                <NoRecordsAvailable />
            }

            {/* Add Button */}
            {
                modelData &&
                modelData.length > 0 && !isSingleSelection &&
                <div className="row mt-2">
                    <div className="col-lg-12 col-md-12">
                        <button className="btn MOD_btn btn-create" onClick={handleOnAdd}>
                            <BtnLabeltxtMedium2 text={'MOD.GLOBAL.BUTTON.ADD'} />
                        </button>
                    </div>
                </div>
            }
        </>
    )
}