import { FC, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { SearchComponent } from "../../../../_metronic/assets/ts/components/SearchComponent";
import { useAppDispatch } from "../../../../store";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { NoSearchResultsFound } from "../noRecordsAvailable/NoSearchResultsFound";
import { SearchByWildCardText } from "../../services/globalSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { ServiceStatus } from "../../../helper/_constant/serviceStatus";
import { ApiCallType } from "../../../helper/_constant/apiCallType.constant";
import { fetchObservations } from "../../services/observationSlice";

export interface SearchResultModel {
  id: number;
  title: string;
  description: string;
  sortOrder: number;
  lookupName: string;
  serviceCode: string;
  statusId: number;
  categoryName: string;
  requestId?: number;
}

interface AdminMetSearchProps {
  apiCallType: number;
  statusId?: string;
  categoryId?: number;
  date?: string;
}

const AdminMetSearch: FC<AdminMetSearchProps> = ({
  statusId,
  categoryId,
  date,
  apiCallType,
}) => {
  const [menuState, setMenuState] = useState<
    "main" | "advanced" | "preferences"
  >("main");
  const element = useRef<HTMLDivElement | null>(null);
  const wrapperElement = useRef<HTMLDivElement | null>(null);
  const resultsElement = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const emptyElement = useRef<HTMLDivElement | null>(null);
  const searchIconElement = useRef<HTMLDivElement | null>(null);
  const crossIconElement = useRef<HTMLDivElement | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResultModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshData, setRefreshData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const lang = useLang();
  const intl = useIntl();

  const processs = (search: SearchComponent) => {
    setTimeout(function () {
      const number = Math.floor(Math.random() * 6) + 1;
      // Complete search
      search.complete();
    }, 1500);
  };

  const clear = (search: SearchComponent) => {
    // Hide results
    resultsElement &&
      resultsElement.current &&
      resultsElement.current!.classList.add("d-none");
    // Hide empty message
    emptyElement &&
      emptyElement.current &&
      emptyElement.current!.classList.add("d-none");

    // Hide crossIconElement message
    crossIconElement &&
      crossIconElement.current &&
      crossIconElement.current!.classList.add("d-none");

    searchIconElement &&
      searchIconElement.current &&
      searchIconElement.current!.classList.remove("d-none");

    setSearchTerm("");
  };

  useEffect(() => {
    // Initialize search handler
    const searchObject = SearchComponent.createInsance("#kt_header_search");

    // Search handler
    searchObject!.on("kt.search.process", processs);

    // Clear handler
    searchObject!.on("kt.search.clear", clear);
  }, []);

  let inputHandler = (e) => {
    var value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value.length > 2) {
      SeachApi(value, currentPage);
    }
  };

  function SeachApi(text, pageNumber) {
    if (text && text.length >= 3) {
      if (apiCallType === ApiCallType.ObservationList) {
        fetchObservationList(text, pageNumber);
      }

      
    }
  }

  const fetchObservationList = (text, pageNumber) => {
    dispatch(
        fetchObservations({
            pageNumber: pageNumber ? pageNumber : 1,
            pageSize: pageSize ? pageSize : 10,
            observationType: undefined,
            status: undefined,
            dateFrom:undefined,
            dateTo: undefined,
            searchTerm: text ? text : "",
          })
    )
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          if (
            originalPromiseResult.data &&
            originalPromiseResult.data.wildCardSearchTextDto.length > 0
          ) {
            resultsElement.current!.classList.remove("d-none");
            emptyElement.current!.classList.add("d-none");
            searchIconElement.current!.classList.add("d-none");
            setSearchResult(originalPromiseResult.data.wildCardSearchTextDto);
            if (originalPromiseResult.data) {
              let totalCount = originalPromiseResult.data.totalCount;
              setNumberOfPages(Math.ceil(totalCount / pageSize));
              setRefreshData(false);
            }
          } else {
            resultsElement.current!.classList.add("d-none");
            // Show empty message
            emptyElement.current!.classList.remove("d-none");

            searchIconElement.current!.classList.add("d-none");
          }
        } else {
          resultsElement.current!.classList.add("d-none");
          emptyElement.current!.classList.remove("d-none");
        }
        if (originalPromiseResult.statusCode === 401) {
          console.log("Selected Role Api call Failed");
          resultsElement.current!.classList.add("d-none");
          emptyElement.current!.classList.remove("d-none");
          searchIconElement.current!.classList.add("d-none");
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        console.log(rejectedValueOrSerializedError);
        resultsElement.current!.classList.add("d-none");
        emptyElement.current!.classList.remove("d-none");
        searchIconElement.current!.classList.add("d-none");
      });
  };

  

  const highLightBold = (text, searchT) => {
    if (searchT == "") return text;
    try {
      const regex = new RegExp(`(${searchT})`, "gi");
      return text.replace(
        regex,
        (match) =>
          `<span className="fw-bold searchResultTitleHighlite" style="font-family:${
            lang == "ar" ? "FrutigerLTArabic-Bold_2" : "'Roboto-Bold'"
          } ;color: #000 !important;">${match}</span>`
      );
    } catch {
      return text;
    }
  };

  const handlePageChange = (pageNumber: number) => {
    console.log("handlePageChange pageNumber " + pageNumber);
    setCurrentPage(pageNumber);
    setRefreshData(true);
    SeachApi(searchTerm, pageNumber);
  };

  const getNavigationLink = () => {
    
    if (apiCallType === ApiCallType.ObservationList) {
      return "/observation/new";
    }
    return "";
  };

  return (
    <>
      <div
        data-kt-search-element="content"
        id="kt_header_search"
        className="d-flex align-items-stretch search-btn-bg"
        data-kt-search-keypress="true"
        data-kt-search-min-length="2"
        data-kt-search-enter="enter"
        ref={element}
      >
        <div
          className={`w-100 position-relative ${
            menuState === "main" ? "" : "d-none"
          }`}
          ref={wrapperElement}
          data-kt-search-element="wrapper"
        >
          <div
            data-kt-search-element="form"
            className="w-100 position-relative golder-border-1"
          >
            <input
              type="text"
              className={`form-control form-control-flush search-input ${
                lang === "ar" ? "ps-12" : "pe-12"
              }`}
              name="search"
              placeholder={intl.formatMessage({ id: "LABEL.SEARCH" })}
              data-kt-search-element="input"
              onChange={inputHandler}
              value={searchTerm}
              autoComplete="off"
              dir={lang === "ar" ? "rtl" : "ltr"}
            />
            <span ref={searchIconElement}>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                size="5x"
                color="#afaba4"
                className={`text-gold fs-2 text-lg-1 position-absolute top-50 ${
                  lang === "ar" ? "start-0 ms-4" : "end-0 me-4"
                } translate-middle-y`}
              />
            </span>
            <span
              className={`position-absolute top-50 ${
                lang === "ar" ? "start-3 ms-1" : "end-3 me-1"
              } translate-middle-y lh-0 d-none`}
              data-kt-search-element="spinner"
            >
              <span className="spinner-border h-25px w-25px align-middle text-gray-400" />
            </span>
            <span
              className={`btn btn-flush btn-active-color-primary position-absolute top-50 ${
                lang === "ar" ? "start-3 ms-1" : "end-3"
              } translate-middle-y lh-0 d-none`}
              data-kt-search-element="clear"
            >
              <FontAwesomeIcon
                icon={faXmark}
                size="2xl"
                color="#afaba4"
                className={lang === "ar" ? "ms-2" : "me-2"}
              />
            </span>
          </div>

          <div
            ref={resultsElement}
            data-kt-search-element="results"
            className="d-none position-absolute bg-white z-3 w-100 golder-border-1 pb-4"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)", color: "#222" }}
          >
            <div className="scroll-y mh-200px mh-lg-350px">
              <div className="px-4">
                {searchResult.map((item) => (
                  <NavLink
                    to={getNavigationLink()}
                    state={{
                      observationId: item.id,
                    }}
                    className="d-flex text-dark text-hover-primary align-items-center pb-5 border-bottom pt-2 "
                  >
                    <div className="symbol symbol-40px me-4 h-100 ">
                      {item.serviceCode}
                    </div>

                    <div className="d-flex flex-column justify-content-start fw-bold border-start ps-2">
                      <div
                        className="fs-6 searchResultTitle"
                        dangerouslySetInnerHTML={{
                          __html: highLightBold(
                            item.categoryName,
                            searchTerm.toString()
                          ),
                        }}
                      ></div>{" "}
                      <br />
                      <div
                        className="fs-7 fw-bold text-muted"
                        dangerouslySetInnerHTML={{
                          __html: highLightBold(
                            item.title,
                            searchTerm.toString()
                          ),
                        }}
                      ></div>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
            {/* <Pagination
              numberOfPages={numberOfPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            /> */}
          </div>
          <div
            ref={emptyElement}
            className="d-none position-absolute bg-white z-3 w-100 golder-border-1 pb-4"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)", color: "#222" }}
          >
            <NoSearchResultsFound />
          </div>
        </div>
      </div>
    </>
  );
};

export { AdminMetSearch };
