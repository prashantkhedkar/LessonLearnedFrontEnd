import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  LabelTitleSemibold1,
} from "../../../../app/modules/components/common/formsLabels/detailLabels";
import { useIntl } from "react-intl";
import { useLang } from "../../../i18n/Metronici18n";
import {
  fetchGlobalSearchAsync,
  insertPageLog,
} from "../../../../app/modules/services/globalSlice";
import { toast } from "react-toastify";
import { unwrapResult } from "@reduxjs/toolkit";
import { useAppDispatch } from "../../../../store";
import * as Yup from "yup";
import { IPageLog } from "../../../../app/models/global/globalGeneric";

const validationSchema = Yup.object().shape({
  selectedDate: Yup.date().required("Date is required"),
});

export default function GlobalSearch() {
  //const GlobalSearch: FC = () => {
  const intl = useIntl();
  const lang = useLang();
  //const [value, setValue] = React.useState('one');
  const [tabValue, setTabValue] = React.useState("1");

  const theme = useTheme();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const initialState = {
    recordLength: 0,
    projectData: [],
    milestoneData: [],
    taskData: [],
    projectDataLength: 0,
    fileData: [],
    meetingData: [],
    meetingRecapData: [],
    watiraTaskData: [],
    searchString: "",
    loading: true,
    isShow: false,
    highlightedUpdate: "",
    highlightedPeople: "",
    highlightedFile: "",
  };

  const sections: string[] = [
    "all",
    "projects",
    "milestones",
    "tasks",
    "updates",
    "people",
    "files",
  ];
  const [searchModel, setSearchModel] = useState({ ...initialState });
  const [currentTab, setCurrentTab] = useState(0);
  const [showSection, setShowSection] = useState([...sections.keys()]);
  const dispatch = useAppDispatch();

  const [selectedFromDate, setSelectedFromDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{
    selectedFromDate: string;
    selectedEndDate: string;
  }>({ selectedFromDate: "", selectedEndDate: "" });

  // States related to meeting
  const [show, setShow] = useState(false);
  const [meetingId, setMeetingId] = useState<number>(0);
  const [origin, setOrigin] = useState<string>("");
  const [meetingDate, setMeetingDate] = useState<Date | undefined>();
  const [editSeries, setEditSeries] = useState<boolean>(false);
  const [popupTitle, setPopupTitle] = useState<string>("");
  const [showMRPopup, setShowMRPopup] = useState(false);
  // End of States related to meeting

  useEffect(() => {
    if (searchModel.isShow) {
      let formDataObject: IPageLog;
      formDataObject = {
        pageName: "/global-search",
        username: "",
      };
      dispatch(insertPageLog({ formDataObject }));
    }
  }, [searchModel]);

  const handleEmpty = (a) => {
    if (a) {
      return a;
    } else {
      return [];
    }
  };
  const getLength = (x) => {
    return (
      handleEmpty(x.projects).length +
      handleEmpty(x.milestones).length +
      handleEmpty(x.tasks).length +
      handleEmpty(x.people).length +
      handleEmpty(x.files).length +
      handleEmpty(x.updates).length
    );
  };

  const getSearchResults = (
    searchText,
    fromDate,
    endDate,
    showMoreType,
    pageNumber,
    rowsPerPage,
    callBack
  ) => {
    try {
      dispatch(
        fetchGlobalSearchAsync({
          searchText,
          fromDate,
          endDate,
          lang,
          showMoreType,
          pageNumber,
          rowsPerPage,
        })
      )
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            //const responseData = originalPromiseResult.data as IUserCommentModel[];
            callBack(originalPromiseResult.data);
          } else {
            if (originalPromiseResult.statusCode === 401) {
              toast.error("Session expired. Kindly login");
            }
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          console.log(rejectedValueOrSerializedError);
        });
    } catch (e) {
      console.log(e);
    }
  };

  var close = document.getElementById("close");

  close?.addEventListener("click", function () {
    var search = document?.getElementById("search") as HTMLInputElement;
    if (search != null) {
      search.value! = "";
    }
    // search?.value! = "";
    (document.getElementById("close") as HTMLInputElement).style.display =
      "none";
    setSearchModel({ ...searchModel, searchString: "" });
  });

  const setSearchModelWithLoading = (value) => {
    setSearchModel({
      ...searchModel,
      projectData: [],
      taskData: [],
      milestoneData: [],
      fileData: [],
      meetingData: [],
      meetingRecapData: [],
      watiraTaskData: [],
      searchString: value,
      loading: true,
    });
  };

  const handleSearchResults = (value) => {
    getSearchResults(
      value,
      selectedFromDate != null && selectedEndDate != null
        ? new Date(selectedFromDate).toISOString()
        : "",
      selectedFromDate != null && selectedEndDate != null
        ? new Date(selectedEndDate).toISOString()
        : "",
      "",
      1,
      20,
      (resultData) => {
        setSearchModel({
          ...searchModel,
          recordLength: getLength(resultData),
          projectData: handleEmpty(resultData.projectSearchList),
          milestoneData: handleEmpty(resultData.projectMilestoneSearchList),
          taskData: handleEmpty(resultData.projectTaskSearchList),
          fileData: handleEmpty(resultData.fileSearchContentList),
          meetingData: handleEmpty(resultData.meetingSearchList),
          meetingRecapData: handleEmpty(resultData.meetingRecapSearchList),
          watiraTaskData: handleEmpty(resultData.watiraTaskSearchList),
          loading: false,
          searchString: value,
        });
      }
    );
  };

  const handleClearDateSearchResults = (value) => {
    getSearchResults(value, "", "", "", 1, 20, (resultData) => {
      setSearchModel({
        ...searchModel,
        recordLength: getLength(resultData),
        projectData: handleEmpty(resultData.projectSearchList),
        milestoneData: handleEmpty(resultData.projectMilestoneSearchList),
        taskData: handleEmpty(resultData.projectTaskSearchList),
        fileData: handleEmpty(resultData.fileSearchContentList),
        meetingData: handleEmpty(resultData.meetingSearchList),
        meetingRecapData: handleEmpty(resultData.meetingRecapSearchList),
        watiraTaskData: handleEmpty(resultData.watiraTaskSearchList),
        loading: false,
        searchString: value,
      });
    });
  };

  const setSearchModelWithInitialState = () => {
    setSearchModel({
      ...initialState,
      isShow: true,
      loading: false,
      searchString: "",
    });
  };

  const setSearchModelWithoutLoading = (value) => {
    setSearchModel({
      ...searchModel,
      searchString: value,
      loading: false,
    });
  };

  const onChangeHandle = (e) => {
    const value = e.target.value;

    setTimeout(() => {
      setSearchModel({
        ...searchModel,
        searchString: value,
        loading: false,
      });
    }, 0);
    // setTimeout(() => {
    //     // if (value.length > 1) {
    //     //     handleSearchResults(value);
    //     // } else if (value.length === 0) {
    //     //     setSearchModelWithInitialState();
    //     // } else {
    //     setSearchModelWithoutLoading(value);
    //     //}
    // }, 0);
  };

  const onProjectShowMore = (projrowsPerPage: number) => {
    setSearchModel({
      ...searchModel,
      loading: true,
      projectData: [],
      projectDataLength: 0,
    });
    setTimeout(() => {
      if (searchModel?.searchString.length > 1) {
        getSearchResults(
          searchModel?.searchString,
          "",
          "",
          "P",
          1,
          projrowsPerPage,
          (resultData) => {
            //Inside Search box
            setSearchModel({
              ...searchModel,
              projectData: handleEmpty(resultData.projectSearchList),
              loading: false,
              projectDataLength: resultData.projectSearchList[0].totalRowCount,
              searchString: searchModel?.searchString,
            });
          }
        );
      } else {
        setSearchModel({
          ...searchModel,
          searchString: searchModel?.searchString,
          loading: false,
        });
      }
    }, 0);
  };

  const onClosePopup = () => {
    setSearchModel(initialState);
    setTabValue("1");
    (document.getElementById("searchInput") as HTMLInputElement).value = "";
  };

  const handleFromDateChange = (date: Date | null) => {
    setSelectedFromDate(date);

    if (selectedFromDate! >= selectedEndDate!) {
      setSelectedEndDate(null);
    }
    // Perform validation before submitting the form
    // if (!selectedFromDate) {
    //     setErrors(prevErrors => ({ ...prevErrors, selectedFromDate:intl.formatMessage({ id: 'MOD.GLOBAL.SEARCH.FROMDATEREQ.LABEL' }) }));

    // }
    // if (!selectedEndDate) {
    //     setErrors(prevErrors => ({ ...prevErrors, selectedEndDate: intl.formatMessage({ id: 'MOD.GLOBAL.SEARCH.TODATEREQ.LABEL' }) }));

    // }

    // Reset validation error when date is changed
    //setErrors({ ...errors, selectedFromDate: '' });
  };
  const handleEndDateChange = (date: Date | null) => {
    setSelectedEndDate(date);
    // Reset validation error when date is changed
    // setErrors({ ...errors, selectedEndDate: '' });
  };

  const handleDateSearchClear = (e) => {
    e.preventDefault();
    // Update selectedFromDate and selectedEndDate
    setSelectedFromDate(null);
    setSelectedEndDate(null);

    // Reset validation errors
    setErrors((prevErrors) => ({
      ...prevErrors,
      selectedFromDate: "",
      selectedEndDate: "",
    }));
    setTimeout(() => {
      setSearchModelWithInitialState();
    }, 0);

    // if(selectedFromDate!=null && selectedEndDate!=null)
    // {
    //     setSearchModelWithLoading(searchModel.searchString);

    //     setTimeout(() => {
    //         if (searchModel.searchString.length > 1) {
    //             handleClearDateSearchResults(searchModel.searchString);
    //         } else if (searchModel.searchString.length === 0) {
    //             setSearchModelWithInitialState();
    //         } else {
    //             setSearchModelWithoutLoading(searchModel.searchString);
    //         }
    //     }, 0);
    // }
  };

  const handleDateSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true;

    (document.getElementById("searchInput") as HTMLInputElement).value = "";
    // Perform validation before submitting the form
    // if (!selectedFromDate) {
    //     setErrors(prevErrors => ({ ...prevErrors, selectedFromDate:intl.formatMessage({ id: 'MOD.GLOBAL.SEARCH.FROMDATEREQ.LABEL' }) }));
    //     isValid = false;
    // }
    // if (!selectedEndDate) {
    //     setErrors(prevErrors => ({ ...prevErrors, selectedEndDate: intl.formatMessage({ id: 'MOD.GLOBAL.SEARCH.TODATEREQ.LABEL' }) }));
    //     isValid = false;
    // }

    // if (!isValid) {
    //     return;
    // }
    handleSearchIconClick(searchModel?.searchString);
    // Form submission logic
  };

  useEffect(() => {
    setShowSection(currentTab === 0 ? [...sections.keys()] : [currentTab]);
    return () => { };
  }, [currentTab]);

  const showCurrentTabContent = (selectedTab) => {
    const p = selectedTab === 0 ? [...sections.keys()] : [];
    setCurrentTab(selectedTab);
    setShowSection(p);
  };

  const mobilemenu = (e) => {
    var sidebar = document.getElementById("sidebar") as HTMLInputElement | null;
    if (sidebar != null) {
      sidebar.classList.add("sidebarActive");
    }
  };

  const TabLabelTitle = ({ text, count }) => {
    var lblText = text + " (" + count + ")";
    return (
      <LabelTitleSemibold1
        text={lblText}
        isI18nKey={false}
        customClassName="text-color"
      />
    );
  };

  const handleSearchIconClick = (searchtxt, isClear = false) => {
    if (searchtxt === "") {
      searchtxt = (document.getElementById("searchInput") as HTMLInputElement)
        .value;
    }

    if (isClear) {
      setSelectedFromDate(null);
      setSelectedEndDate(null);
    }

    // setSearchModel({
    //     ...searchModel,
    //     searchString: searchtxt,
    //     isShow: true,
    // });
    setSearchModelWithLoading(searchtxt);

    if (
      searchtxt != "" ||
      selectedFromDate != null ||
      selectedEndDate != null
    ) {
      getSearchResults(
        searchtxt,
        selectedFromDate != null
          ? new Date(selectedFromDate).toISOString()
          : "",
        selectedEndDate != null ? new Date(selectedEndDate).toISOString() : "",
        "",
        1,
        20,
        (resultData) => {
          //Main Search box
          setSearchModel({
            ...searchModel,
            recordLength: getLength(resultData),
            projectData: handleEmpty(resultData.projectSearchList),
            milestoneData: handleEmpty(resultData.projectMilestoneSearchList),
            taskData: handleEmpty(resultData.projectTaskSearchList),
            fileData: handleEmpty(resultData.fileSearchContentList),
            meetingData: handleEmpty(resultData.meetingSearchList),
            meetingRecapData: handleEmpty(resultData.meetingRecapSearchList),
            watiraTaskData: handleEmpty(resultData.watiraTaskSearchList),
            loading: false,
            isShow: true,
            searchString: searchtxt,
          });
          // document.getElementById("search").focus();
        }
      );
    } else {
      setTimeout(() => {
        setSearchModelWithInitialState();
      }, 0);
    }
  };

  return (
    <>
      <div role="search" id="formSearch">
        <input
          type="text"
          id="searchInput"
          name="q"
          maxLength={100}
          defaultValue={searchModel?.searchString || ""}
          placeholder={intl.formatMessage({
            id: "MOD.QUICKSEARCH.QUICKSEARCH",
          })}
          autoComplete="off"
          aria-label="Search through site content"
          onKeyPress={(e) => {
            const event = e.currentTarget as HTMLInputElement;
            if (
              event?.value !== "" &&
              event?.value?.length > 1 &&
              e?.key === "Enter"
            ) {
              setSelectedFromDate(null);
              setSelectedEndDate(null);
              //onChangeHandle(e);
              setSearchModel({
                ...searchModel,
                searchString: e?.currentTarget?.value,
                isShow: true,
              });
              if (e?.currentTarget?.value != "") {
                getSearchResults(
                  e?.currentTarget?.value,
                  selectedFromDate != null
                    ? new Date(selectedFromDate).toISOString()
                    : "",
                  selectedEndDate != null
                    ? new Date(selectedEndDate).toISOString()
                    : "",
                  "",
                  1,
                  20,
                  (resultData) => {
                    //Main Search box
                    setSearchModel({
                      ...searchModel,
                      recordLength: getLength(resultData),
                      projectData: handleEmpty(resultData.projectSearchList),
                      milestoneData: handleEmpty(
                        resultData.projectMilestoneSearchList
                      ),
                      taskData: handleEmpty(resultData.projectTaskSearchList),
                      fileData: handleEmpty(resultData.fileSearchContentList),
                      meetingData: handleEmpty(resultData.meetingSearchList),
                      meetingRecapData: handleEmpty(
                        resultData.meetingRecapSearchList
                      ),
                      watiraTaskData: handleEmpty(
                        resultData.watiraTaskSearchList
                      ),
                      loading: false,
                      isShow: true,
                      searchString: event?.value,
                    });
                    // document.getElementById("search").focus();
                  }
                );
              }
            }
          }}
        ></input>
        <button onClick={() => handleSearchIconClick("")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.85002 11.0004C3.85002 7.05155 7.05119 3.85039 11 3.85039C14.9489 3.85039 18.15 7.05155 18.15 11.0004C18.15 14.9492 14.9489 18.1504 11 18.1504C7.05119 18.1504 3.85002 14.9492 3.85002 11.0004ZM11 2.15039C6.1123 2.15039 2.15002 6.11267 2.15002 11.0004C2.15002 15.8881 6.1123 19.8504 11 19.8504C13.1378 19.8504 15.0985 19.0924 16.6281 17.8306L19.399 20.6014C19.7309 20.9334 20.2691 20.9334 20.6011 20.6014C20.933 20.2695 20.933 19.7313 20.6011 19.3994L17.8302 16.6285C19.0921 15.0989 19.85 13.1382 19.85 11.0004C19.85 6.11267 15.8877 2.15039 11 2.15039Z"
              fill="#9CA3AF"
            />
          </svg>
        </button>
      </div>


    </>
  );
}
