import { ChangeEvent, useEffect, useState } from 'react';
import { BtnLabelCanceltxtMedium2, BtnLabeltxtMedium2, DetailLabels, LabelTextSemibold1 } from '../common/formsLabels/detailLabels'
import { useIntl } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../../../store';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import { addUpdateAssignee, addUpdateUnit, fetchUnitListAsync } from '../../services/globalSlice';
import NoRecordsAvailable from '../noRecordsAvailable/NoRecordsAvailable';
import { writeToBrowserConsole } from '../../utils/common';
import { Checkbox, Chip, Divider } from '@mui/material';
import { write } from 'fs';
import { IUnitSearchModel, UnitModel } from '../../../models/global/unitModel';
import "../globalUserSearch/GlobalUserSearch.css"
import { useAuth } from '../../auth/core/Auth';

interface props {
    onUnitsAdd: Function;
    isSingleSelection?: boolean;
    checkUnitEmployeeCountOnSelection?: boolean;
    showDefaultAllUnit?: boolean;
    hideCurrentUnit?: boolean;
}
export default function GlobalUnitSearch({ onUnitsAdd, isSingleSelection = false, checkUnitEmployeeCountOnSelection = false, showDefaultAllUnit = false, hideCurrentUnit = false }: props) {
    const intl = useIntl();
    const lang = useLang();
    const dispatch = useAppDispatch();

    // Data Model
    const [modelData, setModelData] = useState<UnitModel[]>([]);
    const [selectedDataModel, setSelectedDataModel] = useState<UnitModel[]>([]);
    const { viewLookups } = useAppSelector((s) => s.globalgeneric);

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
    const { auth } = useAuth();

    let defaultSelectorValue: UnitModel = {
        id: 0,
        name: ""
    };

    useEffect(() => {
        setModelData([]);
        //loadDefaultUnitData();        
    },[]);
    useEffect(() => {        
        if (viewLookups && viewLookups !== null && viewLookups!.filter(x => x.lookupType === "MOD").length > 0) {
            let mylookupName: string =
                viewLookups!.filter(
                    (item) => {
                        return item.lookupType === "MOD"
                    }
                )[0].lookupName.toString();

            let mylookupNameAr: string =
                viewLookups!.filter(
                    (item) => {
                        return item.lookupType === "MOD"
                    }
                )[0].lookupNameAr;

            defaultSelectorValue = {
                id: 0,
                name: (lang === "en") ?
                    mylookupName
                    :
                    mylookupNameAr
            }

            if (showDefaultAllUnit) {
                setModelData([defaultSelectorValue]);
            } else {
                setModelData([])
            }
        }
    }, [viewLookups]);

    const searchUnits = (formDataObject: IUnitSearchModel) => {

        dispatch(fetchUnitListAsync({ formDataObject }))
            .then((response) => {
                try {
                    var output = response.payload.data as UnitModel[];

                    let defaultValue: UnitModel[] = [{
                        id: 0,
                        name: intl.formatMessage({ id: 'MOD.MINISTRY.OF.DEFENSE' }).toString()
                    }]

                    if (output && output.length > 0) {

                        let filteredItem: UnitModel[] = [];
                        if(hideCurrentUnit)
                            filteredItem = output.filter((item) => item.id !== Number(0));
                        else
                            filteredItem = output;

                        if(showDefaultAllUnit)
                            setModelData(prev => [...defaultValue, ...filteredItem]);
                        else 
                            setModelData(filteredItem);
                        if (totalRows > rowsPerPage) {
                            setHasMore(true);
                        } else {
                            setHasMore(false);
                        }
                    } else {
                        if (showDefaultAllUnit) {
                            setModelData([defaultSelectorValue]);
                        } else {
                            setModelData([])
                        }
                        setTotalRows(0);
                        setHasMore(false);
                    }
                } catch (e) {
                    writeToBrowserConsole(e);
                }
            })
    };

    const fetchMore = (formDataObject: IUnitSearchModel) => {
        dispatch(fetchUnitListAsync({ formDataObject }))
            .then((response) => {
                var output = response.payload.data as UnitModel[];

                if (output && output.length > 0) {

                    let filteredItem: UnitModel[] = [];
                    if(hideCurrentUnit)
                        filteredItem = output.filter((item) => item.id !== Number(0));
                    else
                        filteredItem = output;

                    setModelData((prevItems) => [...prevItems, ...filteredItem]);
                    //setTotalRows(output[0].totalRowCount!);

                    if (totalRows > rowsPerPage) {
                        setHasMore(true);
                    } else {
                        setHasMore(false);
                    }
                } else {
                    if (showDefaultAllUnit) {
                        setModelData([defaultSelectorValue]);
                    } else {
                        setModelData([])
                    }
                    setTotalRows(0);
                    setHasMore(false);
                }
            })
    };

    const fetchData = () => {
        let rowpage = rowsPerPage;
        let pageNo = pageNumber + 1;
        setPageNumber(pageNo);
        let formDataObject: IUnitSearchModel = {
            name: getName,
            pageNumber: pageNo,
            rowsPerPage: rowpage
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
        if (getMilitaryNumber.toString().trim() === "" && getUNumber.toString().trim() === "" && getName.toString().trim() === "") {
            setSearchError(intl.formatMessage({ id: 'MOD.GLOBAL.SEARCH.PARAMETER.MANDATORY' }));
            return;
        } else {
            setSearchError("");
        }

        let formDataObject: IUnitSearchModel = {
            name: getName,
            pageNumber: 0,
            rowsPerPage: rowsPerPage
        };
        setPageNumber(0);
        setRowsPerPage(rowsPerPage);
        searchUnits(formDataObject);
    };

 
    const AddUpdateUnits = (uModel: UnitModel) => {
        try {
            dispatch(addUpdateUnit({ formDataObject: uModel }));
        } catch (e) {
            writeToBrowserConsole("Error at AddUpdateUsers " + e);
        }
    }

    // Event Handler
    const handleOnAdd = () => {
        if (selectedDataModel.length > 0) {
            onUnitsAdd(selectedDataModel);
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

        setSearchError("");
        setSaveError("");
        setPageNumber(0);

        if (showDefaultAllUnit) {
            setModelData([defaultSelectorValue]);
        } else {
            setModelData([])
        }
        setSelectedDataModel([]);
        //loadDefaultUnitData();
    };

    const handleOnSelectClick = (uModel: UnitModel) => {
        onUnitsAdd([uModel]);
        AddUpdateUnits(uModel);
    };

    const handleUnitRowClick = (e, uModel: UnitModel) => {        
        uModel.name = uModel.name;
        let filteredItem: UnitModel[] = [];
        let isUserExists = selectedDataModel.some((item) => item.id === uModel.id);
        if(!isUserExists) {
            setSelectedDataModel(prev => [...prev, uModel]);
            AddUpdateUnits(uModel);
        } else {
            let filteredItem: UnitModel[] = [];
            filteredItem = selectedDataModel.filter((item) => item.id !== uModel.id);
            setSelectedDataModel([...filteredItem]);
        }

    }

    const handleKeyDown = (event) => {
        if(event.key === 'Enter'){
            handleOnSearch();
        }
    }

    const loadDefaultUnitData = () => {
        let formDataObject: IUnitSearchModel = {
            pageNumber: pageNumber,
            rowsPerPage: rowsPerPage,
            name: ''
        };
        setRowsPerPage(rowsPerPage);
        searchUnits(formDataObject);
    }

    return (
        <>
            {/* Search Parameters */}
            <div className="row mt-2">
                <div className="col-lg-12 col-md-12">
                    <DetailLabels style={{}} text={"MOD.GLOBAL.SEARCH.NAME.LABEL"} isRequired={true} />
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
                                    <tbody>
                                        {
                                            modelData.map((item, index) => (
                                                <tr key={item.id} className={'user-list-row'} onClick={(e) => { isSingleSelection ? handleOnSelectClick(item) : handleUnitRowClick(e, item)}}>
                                                    {isSingleSelection ?
                                                    <></>
                                                    :
                                                    <td className="w-5px" ref={el => {
                                                        if (el) {
                                                            el.style.setProperty('padding-top', '0', 'important');
                                                        }
                                                    }}>
                                                        {isSingleSelection ?
                                                            <button className="btn MOD_btn btn-create" onClick={() => handleOnSelectClick(item)}>
                                                                <BtnLabeltxtMedium2 text={'MOD.PROJECTMANAGEMENT.SELECT'} />
                                                            </button>
                                                            :
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
                                                                checked={selectedDataModel && selectedDataModel.map(u => u.id).includes(item.id)}
                                                            />
                                                        }
                                                    </td>
                                                    }
                                                    <td>                                                    
                                                        <LabelTextSemibold1 isI18nKey={false} text={item.name} />
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
                <div className='col-lg-12'>
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